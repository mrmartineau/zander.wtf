import { resolveConfig } from '../../packages/astro-d1-search/src/config';
import {
  type SearchResult as CoreSearchResult,
  searchIndex as coreSearchIndex,
  type D1Like,
  type SearchOptions,
  toFtsQuery,
} from '../../packages/astro-d1-search/src/core';
import searchConfig from '../../search.config';

const config = resolveConfig(searchConfig);

export const SEARCH_TYPES = [
  'blog',
  'note',
  'project',
  'worklog',
  'page',
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export type SearchResult = Omit<CoreSearchResult, 'type'> & {
  type: SearchType;
};

export { toFtsQuery };

/** Site-configured search: the package core bound to this site's ranking. */
export function searchIndex(
  db: D1Like,
  options: SearchOptions,
): Promise<SearchResult[]> {
  return coreSearchIndex(db, options, config) as Promise<SearchResult[]>;
}
