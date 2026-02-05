import { algoliasearch } from 'algoliasearch';

export type AlgoliaSearchResult = {
  objectID: string;
  title: string;
  slug: string;
  date?: string;
  tags?: string[];
  emoji?: string;
};

type AlgoliaEnv = {
  ALGOLIA_APP: string;
  ALGOLIA_SEARCH_KEY: string;
  ALGOLIA_INDEX: string;
};

export async function searchNotes(
  query: string,
  env?: AlgoliaEnv,
): Promise<AlgoliaSearchResult[]> {
  if (!query || !query.trim()) {
    return [];
  }

  const appId = env?.ALGOLIA_APP || import.meta.env.ALGOLIA_APP;
  const searchKey = env?.ALGOLIA_SEARCH_KEY || import.meta.env.ALGOLIA_SEARCH_KEY;
  const indexName = env?.ALGOLIA_INDEX || import.meta.env.ALGOLIA_INDEX;

  if (!appId || !searchKey || !indexName) {
    console.error('Algolia environment variables not configured');
    return [];
  }

  try {
    const client = algoliasearch(appId, searchKey);
    const results = await client.searchSingleIndex({
      indexName,
      searchParams: {
        query,
        attributesToRetrieve: ['title', 'slug', 'date', 'tags', 'emoji'],
        attributesToHighlight: [],
        hitsPerPage: 50,
      },
    });

    return results.hits as AlgoliaSearchResult[];
  } catch (error) {
    console.error('Algolia search error:', error);
    return [];
  }
}
