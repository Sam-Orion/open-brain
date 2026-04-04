import { ThoughtGrid } from "@/components/dashboard/thought-grid";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { Thought } from "@/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  // Parse search params
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined;
  const tag = typeof resolvedSearchParams.tag === 'string' ? resolvedSearchParams.tag : undefined;
  const type = typeof resolvedSearchParams.type === 'string' ? resolvedSearchParams.type : undefined;

  // Resolving Next.js async headers()
  const headersList = await headers();

  // Construct URL for internal fetch
  const host = headersList.get("host");   
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  let url = `${baseUrl}/api/thoughts`;
  
  if (q) {
    url = `${baseUrl}/api/thoughts/search?q=${encodeURIComponent(q)}`;
    if (tag) url += `&tag=${encodeURIComponent(tag)}`;
    if (type) url += `&type=${encodeURIComponent(type)}`;
  } else {
    // Use standard fetch if no semantic query
    url = `${baseUrl}/api/thoughts?`;
    if (tag) url += `tag=${encodeURIComponent(tag)}&`;
    if (type) url += `type=${encodeURIComponent(type)}`;
  }

  let thoughts: Thought[] = [];
  try {
    // Need to pass the cookie to our own API route for auth check inside
    const cookieHeader = headersList.get('cookie') || '';
    
    // Log info for debugging
    console.log(`[Dashboard] Fetching thoughts from: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store' // Always fresh for dashboard
    });

    if (res.ok) {
      const data = await res.json();
      
      // If we hit the semantic search route, it returns { results: [...] }
      if (q) {
        thoughts = (data.results || []).map((result: any) => {
          const doc = result.documents?.[0] || result || {};
          const meta = result.metadata || doc.metadata || {};
          
          return {
            id: result.id || doc.id,
            title: doc.title || "Unknown Title",
            url: doc.url || meta.url || "",
            description: doc.summary || result.memory || "",
            type: meta.type || doc.type || "article",
            thumbnail_url: doc.ogImage || meta.thumbnail_url || null,
            embed_url: meta.embed_url || null,
            tags: meta.manualTags || meta.tags || [],
          };
        });
      } else {
        // If we hit the standard list route, it returns Thought[]
        thoughts = data;
      }
    } else {
      console.error("Failed to fetch thoughts", await res.text());
    }
  } catch (error) {
    console.error("Error fetching thoughts:", error);
  }

  return (
    <ThoughtGrid 
      initialThoughts={thoughts} 
      q={q} 
      tag={tag} 
      type={type} 
    />
  );
}