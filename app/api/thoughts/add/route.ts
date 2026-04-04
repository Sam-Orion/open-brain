import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupermemoryClient } from "@/lib/supermemory";

// Helper to clean and format tags
function formatTag(tag: string): string {
  const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned ? `#${cleaned}` : "";
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url, type, manualTags = [] } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const supermemory = getSupermemoryClient();

    // Pre-calculate type and embedUrl for metadata persistence
    let mappedType: "youtube" | "twitter" | "article" | "pdf" = "article";
    const lowerUrl = url.toLowerCase();

    // Use explicitly passed type, else infer from URL
    if (type?.toLowerCase() === "pdf") mappedType = "pdf";
    else if (type?.toLowerCase() === "article") mappedType = "article";
    else if (
      type?.toLowerCase() === "tweet" ||
      type?.toLowerCase() === "twitter"
    )
      mappedType = "twitter";
    else if (
      type?.toLowerCase() === "video" ||
      type?.toLowerCase() === "youtube"
    )
      mappedType = "youtube";
    else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be"))
      mappedType = "youtube";
    else if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com"))
      mappedType = "twitter";
    else if (lowerUrl.endsWith(".pdf")) mappedType = "pdf";

    let embedUrl: string | null = null;
    if (mappedType === "youtube") {
      let videoId = null;
      if (lowerUrl.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      } else if (lowerUrl.includes("youtube.com/watch")) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get("v");
      }
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (mappedType === "twitter") {
      embedUrl = url;
    }

    // Process manual tags strictly via formatTag before DB insertion to universally guarantee `#` prefix
    const sanitizedManualTags = Array.isArray(manualTags)
      ? manualTags.map((tag: string) => formatTag(tag)).filter(Boolean)
      : [];

    const metaPayload: Record<
      string,
      string | number | boolean | Array<string>
    > = {
      manualTags: sanitizedManualTags,
      type: mappedType,
      url: url,
    };
    if (embedUrl) metaPayload.embed_url = embedUrl;

    // Normalize YouTube URLs — Supermemory's fetcher fails with www. prefix
    let contentUrl = url;
    if (mappedType === "youtube") {
      contentUrl = url.replace(
        /^(https?:\/\/)www\.youtube\.com/,
        "$1youtube.com",
      );
    }

    // 1. Initial Insert
    console.log("[Ingestion] Adding document to Supermemory:", {
      url: contentUrl,
      mappedType,
      metaPayload,
    });

    const addRes = await supermemory.add({
      content: contentUrl,
      containerTag: user.id,
      metadata: metaPayload,
    });

    console.log(
      "[Ingestion] Supermemory add response:",
      JSON.stringify(addRes),
    );

    if (!addRes || !addRes.id) {
      return NextResponse.json(
        { error: "Failed to ingest URL into Supermemory" },
        { status: 500 },
      );
    }

    // 2. Poll for Data Extraction (up to ~5 seconds)
    let docId = addRes.id;
    let documentDetails: any = null;

    // Up to 5 retries, 1000ms pause each
    for (let i = 0; i < 5; i++) {
      // Delay using promise
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        documentDetails = await supermemory.documents.get(docId);
        console.log(
          `[Ingestion] Poll ${i + 1}/5 — status: ${documentDetails.status}, title: ${documentDetails.title || "N/A"}`,
        );

        if (
          documentDetails.status === "done" ||
          documentDetails.status === "failed"
        ) {
          break;
        }
      } catch (err: any) {
        console.error(
          `[Ingestion] Poll ${i + 1}/5 — error:`,
          err.message || err,
        );
      }
    }

    if (!documentDetails) {
      documentDetails = {
        id: docId,
        title: null,
        summary: null,
        type: "webpage",
        ogImage: null,
        status: "queued",
      };
    }

    // 3. Data Mapping & Formatting

    // Process Document-level type fallback if pdf wasn't caught in URL
    if (documentDetails.type === "pdf") mappedType = "pdf";

    // Process Tags
    const tagsSet = new Set<string>();

    // Process manual tags
    if (Array.isArray(manualTags)) {
      manualTags.forEach((tag: string) => {
        const formatted = formatTag(tag);
        if (formatted) tagsSet.add(formatted);
      });
    }

    // We can also extract metadata tags if supermemory yields them in future
    if (
      documentDetails.metadata &&
      typeof documentDetails.metadata === "object"
    ) {
      const meta = documentDetails.metadata as any;
      if (Array.isArray(meta.tags)) {
        meta.tags.forEach((tag: string) => {
          const formatted = formatTag(tag);
          if (formatted) tagsSet.add(formatted);
        });
      }
    }

    // Determine the normalized status
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
        "[Ingestion] Document FAILED. Full Supermemory response:",
        JSON.stringify(documentDetails, null, 2),
      );

      // Try to extract error info from raw field or other fields
      if (documentDetails.raw && typeof documentDetails.raw === "object") {
        const raw = documentDetails.raw as any;
        errorDetails =
          raw.error || raw.message || raw.reason || JSON.stringify(raw);
      } else if (typeof documentDetails.raw === "string") {
        errorDetails = documentDetails.raw;
      }

      // If no specific error found, provide a helpful message based on content type
      if (!errorDetails) {
        if (mappedType === "youtube") {
          errorDetails =
            "YouTube video processing failed. This may be due to: video access restrictions (private/unlisted), region locks, content size exceeding the 10MB fetch limit, or temporary Supermemory processing issues. Try again or check video accessibility.";
        } else {
          errorDetails =
            "Document processing failed on Supermemory. The content may be inaccessible, too large, or unsupported.";
        }
      }
    }

    const mappedThought: Record<string, any> = {
      id: documentDetails.id,
      title: documentDetails.title || new URL(url).hostname || "Unknown Title",
      url: documentDetails.url || documentDetails.metadata?.url || url || "",
      description:
        documentDetails.description ||
        documentDetails.metadata?.description ||
        documentDetails.summary ||
        "",
      type:
        documentDetails.metadata?.type || documentDetails.type || mappedType,
      thumbnail_url: documentDetails.ogImage || null,
      embed_url: embedUrl || "",
      tags: Array.from(tagsSet),
      status: normalizedStatus,
      supermemory_status: documentDetails.status, // Raw status for debugging
    };

    if (errorDetails) {
      mappedThought.error_details = errorDetails;
    }

    return NextResponse.json(mappedThought);
  } catch (error: any) {
    console.error("Ingestion Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
