import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE_TITLE } from '../consts'
import sanitizeHtml from 'sanitize-html'
import MarkdownIt from 'markdown-it'
const parser = new MarkdownIt()

export async function get(context) {
  const posts = (await getCollection('blog')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  )

  return rss({
    title: SITE_TITLE,
    description: 'Longer thoughts and ramblings from Zander Martineau',
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
      pubDate: post.data.date,
      content: sanitizeHtml(parser.render(post.body)),
    })),
    stylesheet: '/blog.rss.xsl',
  })
}
