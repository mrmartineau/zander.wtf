module.exports = {
  meta: {
    title: 'Code Notes',
    showTitleInSidebar: false,
    description:
      'TILs, snippets—my digital code garden 🌱. By Zander Martineau',
    lang: 'en',
    siteUrl: 'https://notez.zander.wtf/',
  },
  feed: {
    // used in feed.xml.njk
    subtitle: 'TILs, snippets—my digital code garden 🌱. By Zander Martineau',
    filename: 'atom.xml',
    path: '/atom.xml',
    id: 'https://zander.wtf/',
  },
  nav: {
    header: [
      {
        text: 'Home',
        url: '/',
      },
      {
        text: 'Blog',
        url: '/blog',
      },
      {
        text: 'Links',
        url: '/links',
      },
      {
        text: 'Notes ↗',
        url: 'https://notes.zander.wtf',
        external: true,
      },
    ],
    footer: [
      {
        text: 'Hire me',
        url: 'mailto:hi+jobs@zander.wtf?subject=I%20would%20like%20to%20hire%20you&body=Hi%20Zander%2C%0D%0A%0D%0A%F0%9F%91%8B',
      },
      {
        text: 'GitHub',
        url: 'https://github.com/mrmartineau',
      },
      {
        text: 'Mastodon',
        url: 'https://toot.cafe/@zander',
        rel: 'me',
      },
      {
        text: 'CV',
        url: 'https://read.cv/mrmartineau',
      },
      {
        text: 'RSS',
        url: '/atom.xml',
      },
      {
        text: '/uses',
        url: '/blog/uses',
      },
    ],
  },
}
