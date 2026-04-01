'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupermemoryClient } from '@/lib/supermemory';

// Helper to clean tags — preserves digits per project rules
function formatTag(tag: string): string {
  const cleaned = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned ? `#${cleaned}` : '';
}

export async function getSidebarTags() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const supermemory = getSupermemoryClient();
    
    // Use documents.list() — does NOT require a search query (q),
    // unlike search.memories() which requires q >= 1 char.
    const results = await supermemory.documents.list({
      containerTags: [user.id],
      limit: 100
    });

    let rawDocuments: any[] = [];
    if (results && Array.isArray((results as any).memories)) {
      rawDocuments = (results as any).memories;
    }

    // Count tag frequencies across all completed documents
    const tagCounts: Record<string, number> = {};

    rawDocuments
      .filter((doc: any) => doc.status === 'done')
      .forEach((doc: any) => {
        const meta = (doc.metadata && typeof doc.metadata === 'object' && !Array.isArray(doc.metadata))
          ? doc.metadata as Record<string, any>
          : {};
        
        const currentDocTags = new Set<string>();
        
        if (Array.isArray(meta.manualTags)) {
          meta.manualTags.forEach((t: string) => {
            const f = formatTag(t);
            if (f) currentDocTags.add(f);
          });
        }

        if (Array.isArray(meta.tags)) {
          meta.tags.forEach((t: string) => {
            const f = formatTag(t);
            if (f) currentDocTags.add(f);
          });
        }

        // Add to master count
        currentDocTags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

    // Sort by descending frequency and take the top 10
    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // highest frequency first
      .slice(0, 10)
      .map(entry => entry[0]); // return just the string tag

    return sortedTags;

  } catch (error: any) {
    console.error('getSidebarTags Action Error:', error);
    return []; // Return empty array gracefully on failure 
  }
}
