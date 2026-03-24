/**
 * Search and filter logic with prefix support.
 *
 * Prefixes:
 *   @python, @r, @julia, @all  — filter by code language (overrides kernel)
 *   #tag                       — filter by topic tag
 *   !locale                    — filter by content language
 *   (no prefix)                — text search on title and description
 */

export interface IParsedQuery {
  text: string;
  langOverride: string | null; // @python, @r, @julia
  showAll: boolean; // @all
  tagFilter: string | null; // #tag
  localeFilter: string | null; // !locale
}

/**
 * Parse a raw search string into structured query parts.
 */
export function parseSearchQuery(raw: string): IParsedQuery {
  const result: IParsedQuery = {
    text: '',
    langOverride: null,
    showAll: false,
    tagFilter: null,
    localeFilter: null
  };

  const parts = raw.trim().split(/\s+/);
  const textParts: string[] = [];

  for (const part of parts) {
    if (part.toLowerCase() === '@all') {
      result.showAll = true;
    } else if (part.startsWith('@')) {
      result.langOverride = part.slice(1).toLowerCase();
    } else if (part.startsWith('#')) {
      result.tagFilter = part.slice(1).toLowerCase();
    } else if (part.startsWith('!')) {
      result.localeFilter = part.slice(1).toLowerCase();
    } else {
      textParts.push(part);
    }
  }

  result.text = textParts.join(' ').toLowerCase();
  return result;
}

/**
 * Check if a code item matches the parsed query.
 */
export function matchesCodeItem(
  item: {
    title: string;
    description: string;
    code_lang: string;
    tags: string[];
    _content_lang?: string;
    _resolved_locale?: string;
  },
  query: IParsedQuery,
  activeCodeLang: string | null
): boolean {
  // Language filter (@ prefix overrides kernel filter)
  if (query.langOverride) {
    if (item.code_lang !== query.langOverride) {
      return false;
    }
  } else if (!query.showAll && activeCodeLang) {
    if (item.code_lang !== activeCodeLang) {
      return false;
    }
  }

  // Tag filter (#prefix)
  if (query.tagFilter) {
    const hasTag = item.tags.some(t => t.toLowerCase() === query.tagFilter);
    if (!hasTag) {
      return false;
    }
  }

  // Locale filter (!prefix)
  if (query.localeFilter) {
    const contentLang = item._resolved_locale || item._content_lang || 'en';
    if (contentLang.toLowerCase() !== query.localeFilter) {
      return false;
    }
  }

  // Text search
  if (query.text) {
    const haystack = `${item.title} ${item.description}`.toLowerCase();
    if (!haystack.includes(query.text)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a snippet matches the parsed query.
 */
export function matchesSnippet(
  snippet: {
    title: string;
    description?: string;
    code_lang: string;
    tags: string[];
    lang?: string;
  },
  query: IParsedQuery,
  activeCodeLang: string | null
): boolean {
  // Language filter
  if (query.langOverride) {
    if (snippet.code_lang !== query.langOverride) {
      return false;
    }
  } else if (!query.showAll && activeCodeLang) {
    if (snippet.code_lang !== activeCodeLang) {
      return false;
    }
  }

  // Tag filter
  if (query.tagFilter) {
    const hasTag = snippet.tags.some(t => t.toLowerCase() === query.tagFilter);
    if (!hasTag) {
      return false;
    }
  }

  // Locale filter
  if (query.localeFilter) {
    const lang = snippet.lang || 'en';
    if (lang.toLowerCase() !== query.localeFilter) {
      return false;
    }
  }

  // Text search
  if (query.text) {
    const haystack =
      `${snippet.title} ${snippet.description || ''}`.toLowerCase();
    if (!haystack.includes(query.text)) {
      return false;
    }
  }

  return true;
}
