---
title: My setup
subtitle: An overview of my hardware and software setup
date: 2019-02-11
modified: 2022-12-05
layout: ../layouts/MarkdownLayout.astro
---

I work almost exclusively from my home office and I like to use good quality products that make my working life more comfortable.

ℹ️ I change aspects of my setup fairly often so this page will serve as a living document and a place to point curious developers to when I get asked.

## Hardware

### Computer

14" Apple M1 MacBook Pro 💻. I love this little thing. It should last a while.

### Monitor

[MSI Prestige PS341WU Creator Monitor 34"](https://www.msi.com/Content-Creation-Monitor/Prestige-PS341WU). Great wide-screen monitor without being too pricey.

### Keyboard

[Keychron Q1 version 2](https://keychron.in/product/keychron-q1-qmk-custom-mechanical-keyboard/) Keyboard. I bought the barebones ISO version and some Gateron Oil King switches from [Mech Mods](https://www.mechmods.co.uk/). What's not to love.

### Mouse

I alternate between the [Logitech MX Master 3](http://amzn.eu/iGzdIg0) and the [Logitech Vertical mouse](https://www.logitech.com/en-us/product/mx-vertical-ergonomic-mouse).

### Desk and chair

[Autonomous Smart Desk 2](https://www.autonomous.ai/standing-desks/smartdesk-2-home). An amazing and affordable standing desk and the [Herman Miller Aeron](https://www.hermanmiller.com/en_gb/products/seating/office-chairs/aeron-chairs/). You need to invest in a good chair if you're going to be sitting in it for hours on end.

## Software

### IDE

[VS Code Insiders](https://code.visualstudio.com/) with the [Rosé Pine Moon](https://github.com/rose-pine/vscode#readme) colour theme and [Comic Code](https://tosche.net/fonts/comic-code) font. As much as I hate Comic Sans, I happen to LOVE Comic Code for coding.. who knew.

#### Extensions

##### Surround

<details>
  <summary>Surround settings</summary>

```json
{
  "surround.custom": {
    "console-log": {
      "description": "console.log( ... )",
      "disabled": false,
      "label": "console.log",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "astro"
      ],
      "snippet": "console.log(`$TM_SELECTED_TEXT`, $TM_SELECTED_TEXT)"
    },
    "describe": {
      "description": "describe('${1:name}', () => { ... })",
      "disabled": false,
      "label": "describe",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
      ],
      "snippet": "describe('${1:name}', () => {\n\t$TM_SELECTED_TEXT\n})$0"
    },
    "errorBoundary": {
      "description": "<ErrorBoundary>",
      "disabled": false,
      "label": "errorBoundary",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
      ],
      "snippet": "<ErrorBoundary>$TM_SELECTED_TEXT</ErrorBoundary>"
    },
    "es6StringSubstition": {
      "description": "${...}",
      "disabled": false,
      "label": "es6StringSubstition",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "astro"
      ],
      "snippet": "${$TM_SELECTED_TEXT}"
    },
    "function": {
      "description": "$( ... )",
      "disabled": false,
      "label": "function",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "astro"
      ],
      "snippet": "$1($TM_SELECTED_TEXT)$0"
    },
    "jsxConditional": {
      "description": "{x && ( ... )}",
      "disabled": false,
      "label": "jsxConditional",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "{$0 && ($TM_SELECTED_TEXT)}"
    },
    "jsxConditional2": {
      "description": "{x ? ( ... ) : null}",
      "disabled": false,
      "label": "better jsxConditional",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "{$0 ? ($TM_SELECTED_TEXT) : null}"
    },
    "markdown-link": {
      "description": "[]( ... )",
      "disabled": false,
      "label": "Markdown link [url]",
      "snippet": "[$0]($TM_SELECTED_TEXT)"
    },
    "markdown-link-alt": {
      "description": "[ ... ]()",
      "disabled": false,
      "label": "Markdown link [text]",
      "snippet": "[$TM_SELECTED_TEXT]($0)"
    },
    "number": {
      "description": "Number( ... )",
      "disabled": false,
      "label": "Number",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "astro"
      ],
      "snippet": "Number($TM_SELECTED_TEXT)"
    },
    "parse": {
      "description": "JSON.parse( ... )",
      "disabled": false,
      "label": "JSON.parse",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "astro"
      ],
      "snippet": "JSON.parse($TM_SELECTED_TEXT)$0"
    },
    "reactFragment": {
      "description": "<Fragment>",
      "disabled": false,
      "label": "fragment",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "<Fragment>$TM_SELECTED_TEXT</Fragment>"
    },
    "reactFragment2": {
      "description": "<>",
      "disabled": false,
      "label": "fragment (simple)",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "<>$TM_SELECTED_TEXT</>"
    },
    "reactUseMemo": {
      "description": "useMemo",
      "disabled": false,
      "label": "useMemo",
      "languageIds": ["javascriptreact", "typescriptreact"],
      "snippet": "useMemo(() => $TM_SELECTED_TEXT, [])"
    },
    "reactUseCallback": {
      "description": "useCallback",
      "disabled": false,
      "label": "useCallback",
      "languageIds": ["javascriptreact", "typescriptreact"],
      "snippet": "useCallback(() => $TM_SELECTED_TEXT, [])"
    },
    "reactForwardRef": {
      "description": "forwardRef",
      "disabled": false,
      "label": "forwardRef",
      "languageIds": ["javascriptreact", "typescriptreact"],
      "snippet": "forwardRef<$1>($TM_SELECTED_TEXT)"
    },
    "stringify": {
      "description": "JSON.stringify( ... )",
      "disabled": false,
      "label": "JSON.stringify",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact",
        "svelte",
        "html",
        "astro"
      ],
      "snippet": "JSON.stringify($TM_SELECTED_TEXT)$0"
    },
    "suspense": {
      "description": "<Suspense>",
      "disabled": false,
      "label": "suspense",
      "languageIds": ["javascriptreact", "typescriptreact"],
      "snippet": "<Suspense fallback={<Loader />}>$TM_SELECTED_TEXT</Suspense>"
    },
    "svelteIf": {
      "description": "{#if}{/if}",
      "disabled": false,
      "label": "{#if}",
      "languageIds": ["svelte"],
      "snippet": "{#if $1}$TM_SELECTED_TEXT{/if}"
    },
    "svelteIfElse": {
      "description": "{#if}{:else}{/if}",
      "disabled": false,
      "label": "{#if}{:else}",
      "languageIds": ["svelte"],
      "snippet": "{#if $1}$TM_SELECTED_TEXT{:else}$2{/if}"
    },
    "JSXBox": {
      "description": "<Box>",
      "disabled": false,
      "label": "box",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "<Box>$TM_SELECTED_TEXT</Box>"
    },
    "JSXContainer": {
      "description": "<Container>",
      "disabled": false,
      "label": "container",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "<Container>$TM_SELECTED_TEXT</Container>"
    },
    "JSXFlex": {
      "description": "<Flex>",
      "disabled": false,
      "label": "flex",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "<Flex>$TM_SELECTED_TEXT</Flex>"
    },
    "JSXGrid": {
      "description": "<Grid>",
      "disabled": false,
      "label": "grid",
      "languageIds": ["javascriptreact", "typescriptreact", "astro"],
      "snippet": "<Grid>$TM_SELECTED_TEXT</Grid>"
    },
    "TSGeneric": {
      "description": "Generic<>",
      "disabled": false,
      "label": "TS Generic",
      "languageIds": ["typescript", "typescriptreact", "astro"],
      "snippet": "$1<$TM_SELECTED_TEXT, $0>"
    },
    "rem-polished": {
      "description": "${rem($)}",
      "disabled": false,
      "label": "rem",
      "languageIds": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
      ],
      "snippet": "${rem($TM_SELECTED_TEXT)}"
    }
  }
}
```

</details>

A copy of my `settings.json` can be found [here](https://gist.github.com/mrmartineau/ea3b428124bc1e31cd46dfa55469d781) and a full list of my installed extensions can be found [here](https://gist.github.com/mrmartineau/28ef03c53275ea468e470532d6d20449).

### Browser

[Arc](https://arc.net/) by The Browser Company. Arc has been my main browser for a while now. It is a fantastic Chromium-based browser so all my favourite Chrome extensions still work.

### Other apps

#### [Raycast](https://raycast.com/)

I use it in nearly every aspect of my work. I use it for searching the web with its custom web searches (e.g. npm, JIRA, bundlephobia, MDN and many more); searching npm with the [npm extension](https://www.raycast.com/mrmartineau/search-npm) (that I created) workflow and loads more. It truly is a massive productivity booster.

FYI I also created the [GitHub Stars extension](https://www.raycast.com/mrmartineau/search-github-stars).

#### [1Password](https://1password.com/) 🔒

I never need to worry about passwords anymore. It integrates with my browser (via their extension) and it copies one-time passwords to the clipboard automatically. It's also great on the iPhone; since iOS 12 was released, the integration with the OS is massively improved.

#### [DevUtils](https://devutils.app/?ref=zander)

This app is a recent addition and is an indispensible tool for my workflow.

#### [Notion](https://notion.so/)

I moved to Notion a while back and haven't looked back. It has most of what I want for a note-taking app with a healthy free-tier and Markdown-like input method.

#### [iTerm2](https://www.iterm2.com/) with [Fish Shell](https://fishshell.com/)

See my config [here](https://github.com/mrmartineau/fish/blob/master/config.fish). I also use the excellent [TIDE](https://github.com/IlanCosman/tide) prompt to improve my shell.

I also use [Fig](https://fig.io) which adds IDE-style autocomplete to my terminal.

#### [Tower](https://www.git-tower.com/mac)

An excellent git client for Mac.

#### [NextDNS](https://www.nextdns.io/)

A cloud-based private DNS service that gives you full control over what is allowed and what is blocked on the Internet. There are Mac and iPhone apps that essentially block ads, malicious code and more.

### And the rest:

- [Things](https://culturedcode.com/things/): The best Mac/iPhone-based task list/productivity app I know.
- [Superkey](https://superkey.app/): "Keyboard superpower on macOS". I use this mainly for its "hyperkey" functionality (where caps lock is converted to a "hyper key", with all these four modifiers combined: `⌃⌥⌘⇧`)
- [Rectangle Pro](https://rectangleapp.com/): Window snapping and positioning
- [Dash](https://kapeli.com/dash): Dash is an API Documentation Browser and Code Snippet Manager. Devdocs.io or the [Devdocs app](https://devdocs.egoist.rocks/) are free alternatives.
- [NordVPN](https://nordvpn.com/): The best personal VPN service in my opinion. Great apps for Mac and iPhone.
- [Bartender](https://www.macbartender.com/): Hide some of those pesky menubar items.
- [iStat Menus](https://bjango.com/mac/istatmenus/): Monitor and display pretty much everything in my Mac's menubar
- [Shottr](https://shottr.cc) - Shottr is a small, fast, human-sized screenshot app built for those who care about pixels. It was crafted with Swift, optimized for M1, and is completely free at the moment.
- [AudioSwitcher](https://apps.apple.com/gb/app/audioswitcher/id561712678) - AudioSwitcher is a menu bar that allows you to switch quickly between all available input and output devices.
- [Mumu X](https://getmumu.com) - AI driven emoji picker. Even though Raycast has a brilliant emoji picker, I use this one when I'm not sure what emoji I want to use.
- [Vivid](https://www.getvivid.app/) - Double brightness system-wide

This page is featured on [uses.tech](https://uses.tech/). If you're reading this and want to see others like it, head on over there to find out more.

---

You can also see this list on [Kit.co](https://kit.co/TheZand/gear)
