export const prerender = true;

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export const GET = async (context) => {
  const posts = (await getCollection('worklog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: `Zander's Worklog Feed`,
    description: `This is a place where I write what I built, what I made or what I worked on. It's the changelog.md of my work life.`,
    site: `${context.site}/worklog`,
    items: posts.map((post) => ({
      ...post.data,
      link: `/worklog#${post.slug}/`,
      pubDate: post.data.date,
      description: sanitizeHtml(parser.render(post.body)),
      content: sanitizeHtml(parser.render(post.body)),
      author: 'Zander Martineau',
    })),
    stylesheet: '/worklog.rss.xsl',
  });
};
