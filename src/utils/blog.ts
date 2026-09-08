import { type CollectionEntry, getCollection } from 'astro:content';

type Entry = CollectionEntry<'blog'>;

/** The blog collection without drafts. Drafts still show in dev. */
export const getBlog = (filter?: (entry: Entry) => boolean) =>
  getCollection(
    'blog',
    (entry) =>
      (import.meta.env.DEV || !entry.data.draft) && (filter?.(entry) ?? true),
  );
