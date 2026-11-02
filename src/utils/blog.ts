import { type CollectionEntry, getCollection } from 'astro:content';

type Entry = CollectionEntry<'blog'>;

/** The blog collection. Drafts are already out of it, except in dev. */
export const getBlog = (filter?: (entry: Entry) => boolean) =>
  getCollection('blog', filter);
