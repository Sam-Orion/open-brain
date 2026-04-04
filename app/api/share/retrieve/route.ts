import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupermemoryClient } from "@/lib/supermemory";

// Helper to clean and format tags
function formatTag(tag: string): string {
  const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned ? `#${cleaned}` : "";
}

// Helper to map Supermemory doc to Thought UI shape
function mapDocumentToThought(doc: any) {
  const meta =
    doc.metadata &&
    typeof doc.metadata === "object" &&
    !Array.isArray(doc.metadata)
      ? (doc.metadata as Record<string, any>)
      : {};

  const tagsSet = new Set<string>();
  if (Array.isArray(meta.manualTags)) {
    meta.manualTags.forEach((t: string) => {
      const formatted = formatTag(t);
      if (formatted) tagsSet.add(formatted);
    });
  }
  if (Array.isArray(meta.tags)) {
    meta.tags.forEach((t: string) => {
      const formatted = formatTag(t);
      if (formatted) tagsSet.add(formatted);
    });
  }

  return {
    id: doc.id,
    title: doc.title || "Unknown Title",
    description: doc.description || meta.description || doc.summary || "",
    type: meta.type || doc.type || "article",
    thumbnail_url: doc.ogImage || meta.thumbnail_url || null,
    embed_url: meta.embed_url || null,
    tags: Array.from(tagsSet),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Bypass RLS using Service Role Key for public retrieval
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Look up the token
    const { data: shareRecord, error: shareError } = await supabaseAdmin
      .from("shares")
      .select("*")
      .eq("share_token", token)
      .eq("is_active", true)
      .single();

    if (shareError || !shareRecord) {
      return NextResponse.json(
        { error: "Invalid or inactive share token" },
        { status: 404 },
      );
    }

    const {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
    } = shareRecord;

    const supermemory = getSupermemoryClient();
    let thoughts: any[] = [];

    if (entityType === "brain") {
      // Retrieve the entire brain for this user
      const results = await supermemory.documents.list({
        containerTags: [userId],
        limit: 100,
      });
      let rawDocuments = (results as any)?.memories || [];
      thoughts = rawDocuments
        .filter((doc: any) => doc.status === "done")
        .map(mapDocumentToThought);
    } else if (entityType === "tag") {
      // Retrieve thoughts for this user that have the specific tag
      const formattedTag = formatTag(entityId);

      const results = await supermemory.documents.list({
        containerTags: [userId],
        limit: 100,
      });
      let rawDocuments = (results as any)?.memories || [];

      // Filter dynamically across the mapped tags to catch both 'manualTags' and 'tags' cleanly
      thoughts = rawDocuments
        .filter((doc: any) => doc.status === "done")
        .map(mapDocumentToThought)
        .filter((thought: any) => thought.tags.includes(formattedTag));
    } else if (entityType === "thought") {
      // Retrieve a specific thought
      const doc = await supermemory.documents.get(entityId);

      if (!doc || doc.status !== "done") {
        return NextResponse.json(
          { error: "Thought not found or still processing" },
          { status: 404 },
        );
      }

      // Important Security Check: Verify that the document belongs to the token owner
      if (
        !Array.isArray(doc.containerTags) ||
        !doc.containerTags.includes(userId)
      ) {
        return NextResponse.json(
          { error: "Unauthorized data access" },
          { status: 403 },
        );
      }

      thoughts = [mapDocumentToThought(doc)];
    }

    // Wrap the response so the frontend knows what is being returned
    return NextResponse.json({
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
      thoughts,
    });
  } catch (error: any) {
    console.error("Share Retrieve API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
