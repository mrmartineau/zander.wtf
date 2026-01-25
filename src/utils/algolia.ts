import { algoliasearch } from 'algoliasearch';

export type AlgoliaSearchResult = {
  objectID: string;
  title: string;
  slug: string;
  date?: string;
  tags?: string[];
  emoji?: string;
};

export async function searchNotes(
  query: string,
): Promise<AlgoliaSearchResult[]> {
  if (!query || !query.trim()) {
    return [];
  }

  const appId = import.meta.env.ALGOLIA_APP;
  const searchKey = import.meta.env.ALGOLIA_SEARCH_KEY;
  const indexName = import.meta.env.ALGOLIA_INDEX;

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
