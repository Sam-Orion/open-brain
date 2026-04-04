import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupermemoryClient } from "@/lib/supermemory";
import { parseSearchQuery } from "@/lib/search-parser";

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
    const rawQuery = searchParams.get("q") || "";

    // Parse our custom syntax: /tag >type semantic query text
    const { cleanedQuery, tags, type } = parseSearchQuery(rawQuery);
    const supermemory = getSupermemoryClient();

    // Build metadata filters
    const andFilters: any[] = [];

    // Helper to format tag with '#' to match DB
    function cleanTagForFilter(tag: string): string {
      const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleaned ? `#${cleaned}` : "";
    }

    // Add tag filters — match the '#' formatted string stored in Supermemory
    for (const tag of tags) {
      const dbTag = cleanTagForFilter(tag);
      if (dbTag) {
        andFilters.push({
          key: "metadata.manualTags",
          value: dbTag,
          filterType: "array_contains",
        });
      }
    }

    // Add type filter
    if (type) {
      andFilters.push({
        key: "metadata.type",
        value: type,
        filterType: "metadata",
        // Added back filterType: 'metadata' to fix silent SDK validation failures for string matching
      });
    }

    const hasSemanticQuery = cleanedQuery.length > 0;
    const hasFilters = andFilters.length > 0;

    // Branching logic:
    // 1. cleanedQuery non-empty + filters     → search.memories() with q + filters (semantic search scoped by filters)
    // 2. cleanedQuery non-empty + no filters  → search.memories() with q only (normal semantic search)
    // 3. cleanedQuery empty + has filters     → documents.list() with filters only (filter-only listing)
    // 4. cleanedQuery empty + no filters      → 400 error

    if (!hasSemanticQuery && !hasFilters) {
      return NextResponse.json(
        {
          error:
            "Please provide a search query or filters (e.g. /tagname >typename search terms)",
        },
        { status: 400 },
      );
    }

    if (hasSemanticQuery) {
      // Cases 1 & 2: Use search.memories() — semantic search with optional filters
      const searchOptions: any = {
        q: cleanedQuery,
        containerTag: user.id,
        limit: 100, // Fetch up to 100 to allow local filtering
      };

      const searchResponse = await supermemory.search.memories(searchOptions);
      let rawResults = searchResponse?.results || [];

      // Perform local JavaScript filtering if needed
      if (hasFilters) {
        rawResults = rawResults.filter((doc: any) => {
          let matchesType = true;
          let matchesTags = true;

          // Check type match
          const docType = doc.metadata?.type || doc.type;
          if (type && docType !== type) {
            matchesType = false;
          }

          // Check tag match
          if (tags.length > 0) {
            let docTags: string[] = [];
            const rawTags = doc.metadata?.manualTags || doc.tags;

            if (Array.isArray(rawTags)) {
              docTags = rawTags.map((t: any) =>
                typeof t === "string" ? t.toLowerCase() : "",
              );
            } else if (typeof rawTags === "string") {
              try {
                const parsed = JSON.parse(rawTags);
                if (Array.isArray(parsed)) {
                  docTags = parsed.map((t: any) =>
                    typeof t === "string" ? t.toLowerCase() : "",
                  );
                } else {
                  docTags = [rawTags.toLowerCase()];
                }
              } catch {
                docTags = [rawTags.toLowerCase()];
              }
            }

            const docTagsSet = new Set(docTags);

            for (const expectedTag of tags) {
              const formattedTag = cleanTagForFilter(expectedTag);
              if (formattedTag && !docTagsSet.has(formattedTag)) {
                matchesTags = false;
                break;
              }
            }
          }

          return matchesType && matchesTags;
        });
      }

      return NextResponse.json({
        results: rawResults.slice(0, 15), // Return top 15 matches after filtering
        timing: searchResponse?.timing || 0,
        total: rawResults.length,
      });
    } else {
      // Case 3: Filter-only — use documents.list() without filters to avoid SDK bug, filter in JS
      const listOptions: any = {
        containerTags: [user.id],
        limit: 100,
      };

      const results = await supermemory.documents.list(listOptions);

      // Normalize documents.list() response to match search.memories() shape
      let rawDocuments: any[] = [];
      if (results && Array.isArray((results as any).memories)) {
        rawDocuments = (results as any).memories;
      }

      const filteredDocuments = rawDocuments.filter((doc: any) => {
        if (doc.status !== "done") return false;

        // Type filter
        if (type) {
          const docType = doc.metadata?.type || doc.type || "article";
          if (docType !== type) return false;
        }

        // Tag filter
        if (tags.length > 0) {
          const docTags = new Set<string>();
          const meta = doc.metadata || {};

          if (Array.isArray(meta.manualTags)) {
            meta.manualTags.forEach((t: string) => docTags.add(t));
          }
          if (Array.isArray(meta.tags)) {
            meta.tags.forEach((t: string) => docTags.add(t));
          }

          const matchesAllTags = tags.every((tag) => {
            const dbTag = cleanTagForFilter(tag);
            return dbTag && docTags.has(dbTag);
          });

          if (!matchesAllTags) return false;
        }

        return true;
      });

      const normalizedResults = filteredDocuments.map((doc: any) => {
        const meta =
          doc.metadata &&
          typeof doc.metadata === "object" &&
          !Array.isArray(doc.metadata)
            ? (doc.metadata as Record<string, any>)
            : {};

        return {
          id: doc.id,
          metadata: meta,
          memory:
            doc.title ||
            doc.description ||
            meta.description ||
            doc.summary ||
            "",
          similarity: 1, // Exact filter match, not semantic
          updatedAt: doc.updatedAt || "",
          documents: [
            {
              id: doc.id,
              title: doc.title,
              type: doc.type,
              summary: doc.description || meta.description || doc.summary,
              createdAt: doc.createdAt,
              updatedAt: doc.updatedAt,
              metadata: meta,
            },
          ],
        };
      });

      return NextResponse.json({
        results: normalizedResults,
        timing: 0,
        total: normalizedResults.length,
      });
    }
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
