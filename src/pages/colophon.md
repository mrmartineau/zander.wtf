---
title: Colophon
subtitle: What's up with this site?
date: 2023-09-02
layout: ../layouts/MarkdownLayout.astro
---

The **2023** version of my digital abode is built with [Astro](https://astro.build). I had originally I started making it with [Eleventy](https://www.11ty.dev/) (11ty) as I had used 11ty successfully for version 2 of my [Code Notes](https://notes.zander.wtf) project and loved its simplicity and speed, but whilst building the 11ty site I became more and more interested in Astro. After trying out the Astro blog example I decided to rebuild the site with it - even though I still hadn't released the 11ty version 😬.

Astro is great because, like 11ty, it's a static site generator, but `.astro` components use JSX syntax, which I'm very familiar with – I write React apps for a living so it was a natural fit. The component and data fetching model was extremely easy to pick up and I was able to rebuild the site in a few days.

Type is set in **Mona Sans** and **Hubot Sans** from [GitHub](https://github.com/mona-sans).

For styling I use PostCSS with Astro's component

Spacing and type sizes use the custom properties defined by [Utopia.fyi](https://utopia.fyi). If you haven't used Utopia before, I highly recommend it. My Utopia config for this site can be found [here](https://github.com/mrmartineau/zander.wtf/blob/main/src/styles/global/utopia.css).

n.b. The code for the 11ty version is on the [`eleventy-version`](https://github.com/mrmartineau/zander.wtf/tree/eleventy-version) branch on the [zander.wtf](https://github.com/mrmartineau/zander.wtf/) repo.
