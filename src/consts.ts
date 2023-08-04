// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'My personal website.'
export const SITE_DESCRIPTION = 'Welcome to my website!'

export const SITE_META = {
  title: 'Code Notes',
  showTitleInSidebar: false,
  description: 'TILs, snippets—my digital code garden 🌱. By Zander Martineau',
  lang: 'en',
  siteUrl: 'https://zander.wtf',
}

export const SITE_FEED = {
  // used in feed.xml.njk
  subtitle: 'TILs, snippets—my digital code garden 🌱. By Zander Martineau',
  filename: 'atom.xml',
  path: '/atom.xml',
  id: 'https://zander.wtf/',
}

export const SITE_NAV_ITEMS = [
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
    text: 'Hire me',
    url: '/hire-me',
  },
]

export const SITE_FOOTER_ITEMS = [
  {
    text: 'Notes ↗',
    url: 'https://notes.zander.wtf',
    external: true,
  },
  {
    text: 'Colophon',
    url: '/colophon',
  },
  {
    text: 'Uses',
    url: '/uses',
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
]

export const ABOUT_ME = {
  bio: 'I am a contract front-end specialist / product engineer with over 15 years of experience across a range of business sectors.',
  cv: 'https://read.cv/mrmartineau',
}

export const JOBS = {
  current: {
    name: 'Fathom',
    description:
      'Multiple projects: Cryptocurrency exchange (Tradeblock), Investment banking app (Commerzbank), Legacy React app rebrand (Cappitech), Clearwater Analytics',
    type: 'contract',
    url: 'https://www.fathomlondon.com/',
  },
  previous: [
    {
      name: 'Utopia Music',
      description: 'Rostr 2.0',
      type: 'contract',
      url: 'https://utopiamusic.com/',
    },
    {
      name: 'Babylon Health',
      description: '',
      type: 'contract',
      url: 'https://babylonhealth.com',
    },
    {
      name: 'Digital Futures',
      description: '',
      type: 'contract',
      url: 'https://digitalfutures.com',
    },
    {
      name: 'Heights',
      description: '',
      type: 'contract',
      url: 'https://www.yourheights.com',
    },
    {
      name: 'Curve',
      description: '',
      type: 'contract',
      url: 'https://curve.com',
    },
    {
      name: 'FairFX',
      description: '',
      type: 'contract',
      url: 'https://fairfx.com',
    },
    {
      name: 'Nimbletank',
      description: '',
      type: 'employed',
      url: 'https://nimbletank.com',
    },
    {
      name: 'TMW Unlimited',
      description: '',
      type: 'employed',
      url: 'https://tmwunlimited.com',
    },
  ],
}

export const sideProjects = [
  {
    name: 'Journal',
    description: 'Personal bookmarking app',
    status: 'active',
  },
  {
    name: 'Otter',
    description: 'Personal bookmarking app',
    status: 'active',
  },
  {
    name: 'Raycast extensions',
    description: 'A collection of Raycast extensions',
    status: 'active',
  },
  {
    name: 'Code Notes',
    description: 'TILs, snippets—my digital code garden 🌱',
    repo: 'https://github.com/mrmartineau/notes.zander.wtf',
    status: 'active',
  },
  {
    name: 'Code Notes (Gatsby Theme)',
    description: 'Gatsby theme for your digital garden (archived)',
    repo: 'https://github.com/mrmartineau/gatsby-theme-code-notes',
    status: 'archived',
  },
  {
    name: 'Design System Utils',
    description:
      'Design System Utils is a micro framework that standardises your design-system and provide helpful utilities to access its information. It can be used with styled-components, emotion, glamorous or any other CSS-in-JS framework.',
    repo: 'https://github.com/mrmartineau/design-system-utils',
    status: 'inactive',
  },
  {
    name: 'prismic-reactjs-custom',
    description:
      'This is an opinionated fork of prismic-reactjs that allows you to use custom React components instead of standard HTML tags.',
    repo: 'https://github.com/mrmartineau/prismic-reactjs-custom',
    status: 'inactive',
  },
  {
    name: 'Kickoff',
    description:
      'Kickoff is a lightweight, flexible and robust Sass-based front-end framework that is a great starting point for any web site. Developed for projects at TMW, but it grew way beyond internal projects into something that many other companies and developers use on projects of all sizes.      ',
    repo: 'https://trykickoff.com',
    status: 'inactive',
  },
  {
    name: 'trak.js',
    description:
      'Kickoff is a lightweight, flexible and robust Sass-based front-end framework that is a great starting point for any web site. Developed for projects at TMW, but it grew way beyond internal projects into something that many other companies and developers use on projects of all sizes.      ',
    repo: 'https://trykickoff.com',
    status: 'inactive',
  },
]
