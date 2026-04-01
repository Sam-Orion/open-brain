export interface ParsedSearchQuery {
  cleanedQuery: string;
  tags: string[];
  type: string | null;
}

export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  if (!rawQuery || typeof rawQuery !== 'string') {
    return { cleanedQuery: '', tags: [], type: null };
  }

  const tokens = rawQuery.trim().split(/\s+/);
  const tags: string[] = [];
  let type: string | null = null;
  const semanticTokens: string[] = [];

  for (const token of tokens) {
    if (token.startsWith('/') && token.length > 1) {
      // e.g. /react -> react
      tags.push(token.substring(1));
    } else if (token.startsWith('>') && token.length > 1) {
      // e.g. >youtube -> youtube
      type = token.substring(1).toLowerCase();
    } else {
      semanticTokens.push(token);
    }
  }

  return {
    cleanedQuery: semanticTokens.join(' ').trim(),
    tags,
    type,
  };
}
