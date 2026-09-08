---
slug: four-flavours
title: This site now comes in four flavours
subtitle: The same pages served as an ordinary website, a classic-Mac desktop, a keyboard-only terminal and plain text with no stylesheets, picked by a URL prefix.
date: 2026-09-08
tags:
  - astro
  - solid
  - side-project
  - css
---

Every few years I get the itch to redesign this site, and every time I do it the content is the boring bit. The words don't change much. What changes is the box they sit in. So this time I skipped the redesign and built three more boxes instead.

The site now has four front ends and they all serve the exact same pages:

- **[Website](/)**, the ordinary one you're probably reading this in
- **[Desktop](/desktop/)**, a classic-Mac style desktop with windows, a menu bar and Spotlight
- **[Terminal](/tui/)**, a keyboard-driven menu that looks like `raspi-config`
- **[Plain text](/txt/)**, every stylesheet stripped out and nothing but the browser defaults left

Same content, same URLs, same build. The prefix on the URL is the only thing that picks which one you get. `/cv` is the website, `/desktop/cv` opens the CV in a window, `/tui/cv` puts it in the terminal and `/txt/cv` gives you the raw thing. There's a card on the home page and in the footer to hop between them, and each shell has its own switch too.

## Why

I've had a soft spot for TUIs for a while. Earlier this year I built [an ASCII version of the home page](/ascii) that renders the site's data into boxes and borders, and I started (and haven't finished) [an SSH version](/blog/ai-side-projects#ssh-site) you'd connect to from a terminal. Both were fun but both were dead ends, because they were snapshots. A separate page that reads the same data is still a separate page.

What I actually wanted was the whole site in a different outfit. Every blog post, every note, every project page, available in each mode, without maintaining four sets of templates. That constraint shaped everything else.

## One page, four bodies

Pages stay ordinary Astro pages. There's one `BaseLayout.astro` and it renders the header, the greeting, a `<main id="page">` and the footer, exactly as before. Nothing in the content collections knows the other modes exist.

The trick is at the edges. On Cloudflare a few lines in `public/_redirects` rewrite `/desktop/*`, `/tui/*` and `/txt/*` to the plain page with a 200, so `/desktop/cv` serves the HTML of `/cv` while keeping the prefix in the address bar. A tiny integration in `astro.config.mjs` does the same rewrite in dev.

```
/desktop/* /:splat/ 200
/tui/*     /:splat/ 200
/txt/*     /:splat/ 200
```

Then an inline script at the top of `<head>` reads the prefix before first paint and adds `desktop`, `tui`, `txt` or `classic` to the `<html>` element. That class is the whole switch. CSS hides the header and footer in desktop and terminal mode, and the two Solid islands check it before they mount. If the class isn't theirs, they return `null` and get out of the way.

Because every URL still resolves to real HTML, the site works with JavaScript off in every mode. A `<noscript>` nav replaces the header on the desktop, and the terminal falls back to the classic page underneath it.

## The desktop

The desktop is a Solid island mounted with `client:only`. When it boots it doesn't fetch anything. It adopts the `<main>` that's already on the page and puts it in the first window, so the first paint is the server-rendered content and the shell grows around it.

The home page needed a bit more thought. It's made of `[data-window]` sections, and in desktop mode each one becomes its own window, cascaded across the screen. `/#about` opens just the about section. The greeting drops behind the windows as the wallpaper.

Clicking a link inside a window is where it gets interesting. The click is intercepted, the target page is fetched, and its `<main>`, its stylesheets and its hoisted Astro scripts are pulled out of the response and dropped into a new window. That logic lives in one file, `page.ts`, and the terminal reuses it wholesale. Stylesheets are deduplicated against what's already in the document, so opening ten blog posts loads the blog CSS once.

A store keeps every window's position, size, z-order and URL, and it keeps `history` and `document.title` pointing at whichever window is in front. Bring the CV forward and the address bar says `/desktop/cv`. Close it and the URL falls back to the window behind. Reload and you get that page in a window. Deep links survive, back and forward work, and nothing is stuck in JavaScript state you can't get to.

The rest is set dressing, and I enjoyed all of it:

- **Spotlight**, on ⌘K, talks to the same [`/api/search`](/blog/astro-d1-search-package) endpoint the ordinary site uses
- **A Files folder** with a pretend file system, so `cv.pdf` and a photo of me open in windows like everything else
- **A Z menu** with the mode switches, the recent-windows list and the sound toggle
- **Sounds**, all synthesised with Web Audio so there are no audio files to ship. Off by default, because a website that makes noise at you is a website you close

The styles are [ZUI](/projects/zui) with its semantic tokens pointed at this site's palette, and `--radius-scale` set to zero. Hard corners are non-negotiable on a classic Mac.

## The terminal

Terminal mode is the second island, a menu in the style of `whiptail` and `raspi-config`. There's a title, a list of rows, a row of buttons at the bottom, and a highlight you move with the keyboard:

| Key | Does |
| --- | --- |
| ↑ / ↓ | move the highlight |
| Tab | hop between the list and the buttons |
| ← / → | move between buttons |
| Enter | choose |
| Esc | go back |

Taps work too, but the keyboard is the point.

The home screen is the nav. Choosing a page fetches it with the same `page.ts` as the desktop and shows the content, and every link inside that page becomes a row you can move through. So a blog post is a screen, and the links in it are its menu. There's a search screen wired to the search API and a Display screen that carries the mode switches, because a terminal should let you change its display settings.

The hardest part was making the site's actual CSS look right inside a text UI. Code blocks got a solid pale grey background and lost their border, icon glyphs are hidden, the tag sidebar on notes is gone. It's a surprisingly long list of small decisions to make a page that was designed for a browser feel like it was designed for a terminal.

## Plain text

Plain text was the last one and the simplest. The inline script that reads the prefix does one extra thing under `/txt`. It removes every `<link rel="stylesheet">` and `<style>` from the document, then a `MutationObserver` removes any that turn up later, so a page script can't sneak one back in. It also rewrites every internal link to keep the `/txt` prefix, so you stay in plain text as you move around.

That's it. No stylesheets, ever. What you get is the browser's own defaults, which for a site that's just headings, paragraphs, lists and links is more readable than I expected. I dropped the big name from the header, shrank the avatar and turned the nav into a list. Everything else is left alone.

I like it more than I should. It's the version that proves the HTML is sound.

## What I learned

Building the boxes after the content, rather than around it, turned out to be the right order. Because the pages don't know about the shells, every shell is optional and every shell is deletable. If the desktop stops being fun I can remove the island and the site is back to normal in one commit.

The other thing is how much work an ordinary URL does for you. Rewriting at the host rather than routing in the client meant every mode got deep links, back and forward, and a no-JavaScript fallback for free. I spent almost no time on navigation and most of it on windows and menus, which is the fun bit.

The [code is on GitHub](https://github.com/mrmartineau/zander.wtf-astro). Go and open a few windows.
