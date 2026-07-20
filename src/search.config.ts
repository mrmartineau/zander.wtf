/**
 * Search ranking configuration. All tuning knobs in one place.
 *
 * Results are ranked by: bm25 relevance × recency multiplier.
 * bm25 scores are negative (more negative = more relevant), so a
 * multiplier > 1 pushes a result up the list.
 */
export const SEARCH_CONFIG = {
  /**
   * bm25 per-column relevance weights. Higher = a match in that column
   * counts for more. Order matters: must match the FTS table column order
   * (see migrations/0001_search_index.sql).
   */
  weights: {
    title: 10,
    description: 5,
    content: 1,
    tags: 3,
  },

  /**
   * Recency boost. A document published today gets its relevance
   * multiplied by (1 + boost); the boost falls off linearly to zero for
   * documents older than `windowDays`. Undated documents get no boost.
   *
   * - boost: 0 disables recency entirely. 0.25 is a gentle tie-breaker,
   *   0.5 noticeably favours recent content, 1+ lets recency dominate.
   * - windowDays: how far back the boost reaches. 1095 = 3 years.
   */
  recency: {
    boost: 0.35,
    windowDays: 1095,
  },

  /** Max search terms taken from the query; the rest are ignored. */
  maxTerms: 8,

  /** Approximate token count of the highlighted result snippet. */
  snippetTokens: 24,
} as const;
