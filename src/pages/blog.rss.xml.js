import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { SITE_METADATA } from '../consts';

const parser = new MarkdownIt();

export const GET = async (context) => {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: SITE_METADATA.home.title,
    description: SITE_METADATA.blog.subtitle,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
      pubDate: post.data.date,
      content: sanitizeHtml(parser.render(post.body)),
      author: 'Zander Martineau',
    })),
    stylesheet: '/blog.rss.xsl',
  });
};
