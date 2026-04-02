import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupermemoryClient } from "@/lib/supermemory";

// Helper to clean and format tags — preserves digits per project rules
function formatTag(tag: string): string {
  const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned ? `#${cleaned}` : "";
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeParams = searchParams.getAll("type");
    const tagParams = searchParams.getAll("tag");

    // Build metadata filters
    const andFilters: any[] = [];

    // Helper to format tag with '#' to match DB
    function cleanTagForFilter(tag: string): string {
      const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleaned ? `#${cleaned}` : "";
    }

    // Tag filtering — match the raw unformatted string stored in Supermemory
    for (const tag of tagParams) {
      const dbTag = cleanTagForFilter(tag.trim());
      if (dbTag) {
        andFilters.push({
          key: "metadata.manualTags",
          value: dbTag,
          filterType: "array_contains",
        });
      }
    }

    // Type filtering
    for (const type of typeParams) {
      if (type.trim()) {
        andFilters.push({
          key: "metadata.type",
          value: type.trim(),
          filterType: "metadata",
          // Added back filterType: 'metadata' to fix silent SDK validation failures for string matching
        });
      }
    }

    const supermemory = getSupermemoryClient();

    // Fetch all documents for the user to reliably apply filters locally,
    // as Supermemory's endpoint conflicts when combining containerTags with filters.
    const results = await supermemory.documents.list({
      containerTags: [user.id],
      limit: 100,
    });

    let rawDocuments: any[] = [];
    if (results && Array.isArray((results as any).memories)) {
      rawDocuments = (results as any).memories;
    }

    // Filter documents locally
    const filteredDocuments = rawDocuments.filter((doc: any) => {
      if (doc.status !== "done") return false;

      // Type filtering
      if (typeParams.length > 0) {
        const docType = doc.metadata?.type || doc.type || "article";
        const matchesType = typeParams.some((t) => t.trim() === docType);
        if (!matchesType) return false;
      }

      // Tag filtering
      if (tagParams.length > 0) {
        const docTags = new Set<string>();
        if (Array.isArray(doc.metadata?.manualTags)) {
          doc.metadata.manualTags.forEach((t: string) => docTags.add(t));
        }
        if (Array.isArray(doc.metadata?.tags)) {
          doc.metadata.tags.forEach((t: string) => docTags.add(t));
        }

        const matchesTag = tagParams.some((tag) => {
          const dbTag = cleanTagForFilter(tag.trim());
          return dbTag && docTags.has(dbTag);
        });
        if (!matchesTag) return false;
      }

      return true;
    });

    // Map to UI Thought shape
    const thoughts = filteredDocuments.map((doc: any) => {
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
        url: doc.url || meta.url || "",
        description: doc.summary || "",
        type: meta.type || doc.type || "article",
        thumbnail_url: doc.ogImage || meta.thumbnail_url || null,
        embed_url: meta.embed_url || null,
        tags: Array.from(tagsSet),
      };
    });

    return NextResponse.json(thoughts);
  } catch (error: any) {
    console.error("Sidebar Filtering API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
