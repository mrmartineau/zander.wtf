require('dotenv').config()
const { DateTime } = require('luxon')
const rssPlugin = require('@11ty/eleventy-plugin-rss')
const slugify = require('@alexcarpenter/slugify')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItCopyCode = require('markdown-it-copy')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const { Client } = require('@notionhq/client')
const axios = require('axios')
const urlJoin = require('proper-url-join')
const letterboxd = require('letterboxd')

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(rssPlugin)
  // eleventyConfig.addPlugin(torchlight)
  eleventyConfig.addPlugin(syntaxHighlight, {
    preAttributes: {
      tabindex: 0,
      // Added in 4.1.0 you can use callback functions too
      'data-language': function ({ language, content, options }) {
        return language
      },
    },
  })

  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
    })
  )
  eleventyConfig.amendLibrary('md', (mdLib) =>
    mdLib.use(markdownItAnchor, {
      permalink: true,
      safariReaderFix: true,
      permalink: markdownItAnchor.permalink.linkInsideHeader({
        symbol: `
        <span class="visually-hidden">Jump to heading</span>
        <span aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon inline-block" width="20"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" /></svg>
        </span>
      `,
        placement: 'after',
      }),
      slugify: (s) => slugify(s),
    })
  )
  eleventyConfig.amendLibrary('md', (mdLib) =>
    mdLib.use(markdownItCopyCode, {
      successText: `<svg xmlns="http://www.w3.org/2000/svg" class="icon inline-block" width="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    `,
      btnText: `<svg xmlns="http://www.w3.org/2000/svg" class="icon inline-block" width="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>`,
    })
  )

  // Filters
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-LL-dd')
  })
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'dd LLL, yyyy'
    )
  })
  eleventyConfig.addFilter('dateFromISO', (timestamp) => {
    return DateTime.fromISO(timestamp, { zone: 'utc' }).toJSDate()
  })

  // Collections
  // TV
  eleventyConfig.addCollection('tv', async () => {
    const tvShowsFromNotion = await notion.databases.query({
      database_id: '88c86996386045a0af9c69c0e1a448f4',
      filter: {
        and: [
          {
            property: 'Type',
            multi_select: { contains: 'TV' },
          },
          {
            property: 'Status',
            select: {
              equals: 'Now',
            },
          },
        ],
      },
    })
    const simplifiedTvShows = tvShowsFromNotion.results.map((tvShow) => {
      const id = tvShow.properties.ID.rich_text[0].plain_text
      return {
        title: tvShow.properties.Name.title[0].plain_text,
        id,
      }
    })

    const mapper = async (tvShow) => {
      const { data } = await axios.get(
        `https://api.tvmaze.com/lookup/shows?thetvdb=${tvShow.id}`
      )
      return {
        title: data.name,
        images: data.image,
        type: data.type,
        summary: data.summary,
        id: tvShow.id,
        genres: data.genres,
        name: tvShow.name,
      }
    }
    const shows = await Promise.all(simplifiedTvShows.map(mapper))
    return shows
  })
  // Music
  eleventyConfig.addCollection('music', async () => {
    const topArtistsPath = urlJoin('https://ws.audioscrobbler.com/2.0/', {
      query: {
        method: 'user.gettopartists',
        user: 'martineau',
        api_key: process.env.LASTFM_API_KEY,
        format: 'json',
        limit: 5,
        period: '1month',
      },
    })
    const topArtists = await axios.get(topArtistsPath)

    const topAlbumsPath = urlJoin('https://ws.audioscrobbler.com/2.0/', {
      query: {
        method: 'user.gettopalbums',
        user: 'martineau',
        api_key: process.env.LASTFM_API_KEY,
        format: 'json',
        limit: 5,
        period: '1month',
      },
    })
    const topAlbums = await axios.get(topAlbumsPath)
    // console.log(
    //   `🚀 ~ eleventyConfig.addCollection ~ topAlbums:`,
    //   JSON.stringify(topAlbums.data.topalbums.album, null, 2)
    // )
    return {
      topArtists: topArtists.data.topartists.artist,
      topAlbums: topAlbums.data.topalbums.album,
    }
  })
  // Words
  eleventyConfig.addCollection('words', (collection) => {
    return collection
      .getFilteredByGlob('src/content/words/**/*.md')
      .filter((item) => {
        return !item.data.draft
      })
  })
  // Links
  eleventyConfig.addCollection('links', async () => {
    const linksPath = urlJoin('https://otter.zander.wtf/api/tag/zm:link', {
      query: {
        limit: 150,
      },
    })
    const linksData = await axios.get(linksPath, {
      headers: {
        Authorization: `Bearer ${process.env.OTTER_API_KEY}`,
      },
    })
    return linksData.data.data
  })
  // Films
  eleventyConfig.addCollection('movies', async () => {
    const rawMovieData = await letterboxd('mrmartineau')
    const movieDiaryData = rawMovieData
      .filter((item) => item.type === 'diary')
      .slice(0, 3)

    return movieDiaryData
  })

  // favicon
  eleventyConfig.addShortcode('favicon', function (url) {
    if (!url) {
      return ``
    }
    const domain = new URL(url).host.replace('www.', '')
    return `<img src="https://icons.duckduckgo.com/ip3/${domain}.ico" width="16" height="16" class="self-center grow-0 shrink-0"/>`
  })
  // link type
  eleventyConfig.addShortcode('linkType', function (type, extraClass = '') {
    if (!type) {
      return ``
    }
    let icon = 'link-simple-horizontal'
    let label = 'Link'
    switch (type) {
      case 'article':
        icon = 'newspaper-clipping'
        label = 'Article'
        break
      case 'video':
        icon = 'video-camera'
        label = 'Video'
        break
      case 'audio':
        icon = 'headphones'
        label = 'Audio'
        break
      case 'image':
        icon = 'image'
        label = 'Image'
        break
      case 'recipe':
        icon = 'hamburger'
        label = 'Recipe'
        break
      case 'document':
        icon = 'files'
        label = 'Document'
        break
      case 'product':
        icon = 'barbell'
        label = 'Product'
        break
      case 'game':
        icon = 'game-controller'
        label = 'Game'
        break
      case 'note':
        icon = 'notepad'
        label = 'Note'
        break
      case 'event':
        icon = 'calendar'
        label = 'Event'
        break
    }

    return `<i class="ph-duotone ph-${icon} zm-icon ${extraClass}" aria-label="${label}"></i>`
  })

  // Short url
  eleventyConfig.addShortcode('shortUrl', function (url) {
    if (!url) {
      return ``
    }
    const domain = new URL(url).host.replace('www.', '')
    return domain
  })

  eleventyConfig.addPassthroughCopy('public')

  eleventyConfig.setServerOptions({
    // The starting port number
    // Will increment up to (configurable) 10 times if a port is already in use.
    port: 3456,

    // Additional files to watch that will trigger server updates
    // Accepts an Array of file paths or globs (passed to `chokidar.watch`).
    // Works great with a separate bundler writing files to your output folder.
    // e.g. `watch: ["_site/**/*.css"]`
    watch: ['_site/css/**/*.css'],
  })

  return {
    markdownTemplateEngine: false,
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
    },
  }
}
