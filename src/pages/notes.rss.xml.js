import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { excerpt } from '~/utils/excerpt';
import { SITE_METADATA } from '../consts';

const parser = new MarkdownIt();

export const GET = async (context) => {
  // Newest first; a note without a date goes last
  const notes = (await getCollection('codenotes')).sort(
    (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
  );

  return rss({
    title: `Zander's ${SITE_METADATA.notes.title}`,
    description: SITE_METADATA.notes.subtitle,
    site: context.site,
    items: notes.map((note) => ({
      title: note.data.title,
      link: `/notes/${note.id}/`,
      pubDate: note.data.date,
      // Notes have no subtitle, so the opening prose stands in
      description: excerpt(note.body ?? ''),
      categories: note.data.tags,
      content: sanitizeHtml(parser.render(note.body ?? '')),
      author: 'Zander Martineau',
    })),
    stylesheet: '/notes.rss.xsl',
  });
};
