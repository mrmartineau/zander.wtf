---
title: Disallow AI bots
emoji: 🤖
date: 2023-10-11
---

Add this to your robots.txt file to disallow AI bots from crawling your site:

```
User-agent: CCBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Omgilibot
Disallow: /

User-Agent: FacebookBot
Disallow: /
```
