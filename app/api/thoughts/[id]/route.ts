import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupermemoryClient } from "@/lib/supermemory";

// Helper to clean and format tags
function formatTag(tag: string): string {
  const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned ? `#${cleaned}` : "";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supermemory = getSupermemoryClient();
    const documentDetails = await supermemory.documents.get(id);

    if (!documentDetails) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    console.log(
      `[Status Poll] Document ${id} — status: ${documentDetails.status}, title: ${documentDetails.title || "N/A"}`,
    );

    // Process Tags
    const tagsSet = new Set<string>();

    // Extract metadata tags from supermemory
    if (
      documentDetails.metadata &&
      typeof documentDetails.metadata === "object"
    ) {
      const meta = documentDetails.metadata as any;
      if (Array.isArray(meta.manualTags)) {
        meta.manualTags.forEach((tag: string) => {
          const formatted = formatTag(tag);
          if (formatted) tagsSet.add(formatted);
        });
      }
      if (Array.isArray(meta.tags)) {
        meta.tags.forEach((tag: string) => {
          const formatted = formatTag(tag);
          if (formatted) tagsSet.add(formatted);
        });
      }
    }

    const meta = (documentDetails.metadata as any) || {};

    let title = documentDetails.title;
    if (!title && documentDetails.url) {
      try {
        title = new URL(documentDetails.url).hostname;
      } catch (e) {
        title = "Unknown Title";
      }
    }

    // Normalize status
    let normalizedStatus: string;
    if (documentDetails.status === "done") {
      normalizedStatus = "done";
    } else if (documentDetails.status === "failed") {
      normalizedStatus = "failed";
    } else {
      normalizedStatus = "processing";
    }

    // Extract error details for failed documents
    let errorDetails: string | null = null;
    if (documentDetails.status === "failed") {
      console.error(
        `[Status Poll] Document ${id} FAILED. Full response:`,
        JSON.stringify(documentDetails, null, 2),
      );

      if (documentDetails.raw && typeof documentDetails.raw === "object") {
        const raw = documentDetails.raw as any;
        errorDetails =
          raw.error || raw.message || raw.reason || JSON.stringify(raw);
      } else if (typeof documentDetails.raw === "string") {
        errorDetails = documentDetails.raw;
      }

      const docType = meta.type || documentDetails.type || "unknown";
      if (!errorDetails) {
        if (docType === "youtube" || documentDetails.type === "video") {
          errorDetails =
            "YouTube video processing failed. This may be due to: video access restrictions, region locks, content exceeding the 10MB fetch limit, or temporary processing issues.";
        } else {
          errorDetails =
            "Document processing failed. The content may be inaccessible, too large, or unsupported.";
        }
      }
    }

    // Staleness detection
    let isStale = false;
    if (normalizedStatus === "processing" && documentDetails.updatedAt) {
      const updatedAt = new Date(documentDetails.updatedAt).getTime();
      const now = Date.now();
      const tenMinutesMs = 10 * 60 * 1000;
      if (now - updatedAt > tenMinutesMs) {
        isStale = true;
      }
    }

    const mappedThought: Record<string, any> = {
      id: documentDetails.id,
      title: title || "Unknown Title",
      url: documentDetails.url || meta.url || documentDetails.content || "",
      description:
        (documentDetails as any).description ||
        meta.description ||
        documentDetails.summary ||
        "",
      type: meta.type || documentDetails.type || "article",
      thumbnail_url: documentDetails.ogImage || null,
      embed_url: meta.embed_url || null,
      tags: Array.from(tagsSet),
      status: normalizedStatus,
      supermemory_status: documentDetails.status,
    };

    if (errorDetails) {
      mappedThought.error_details = errorDetails;
    }
    if (isStale) {
      mappedThought.stale = true;
    }

    return NextResponse.json(mappedThought);
  } catch (error: any) {
    console.error("Status API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const supermemory = getSupermemoryClient();

    // Call Supermemory SDK delete endpoint
    const result = await supermemory.documents.delete(id);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Status API Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
