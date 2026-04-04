export interface ParsedSearchQuery {
  cleanedQuery: string;
  tags: string[];
  type: string | null;
}

export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  if (!rawQuery || typeof rawQuery !== "string") {
    return { cleanedQuery: "", tags: [], type: null };
  }

  const tags: string[] = [];
  let type: string | null = null;

  // Extract all >type and /tag modifiers, even if consecutive
  const modifiers = rawQuery.match(/(>[\w-]+|\/[\w-]+)/g) || [];

  for (const modifier of modifiers) {
    if (modifier.startsWith("/")) {
      tags.push(modifier.substring(1));
    } else if (modifier.startsWith(">")) {
      type = modifier.substring(1).toLowerCase();
    }
  }

  // Remove all modifiers to get the cleaned query
  const cleanedQuery = rawQuery
    .replace(/(>[\w-]+|\/[\w-]+)/g, "")
    .trim()
    .replace(/\s+/g, " ");

  return {
    cleanedQuery,
    tags,
    type,
  };
}
