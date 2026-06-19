---
title: spotify-fave-artists
date: 2026-06-16
---

Built [spotify-fave-artists](https://github.com/mrmartineau/spotify-fave-artists) to answer a question Spotify gets wrong: who are my *actual* favourite artists and albums? Put one song on repeat for a week and Spotify will happily call that artist your favourite. This disagrees.

Instead of counting plays, it ranks by **album engagement** — how many *distinct* tracks of each album you've worked through, breadth first and depth as the tie-breaker. One track played 400 times counts for nothing; steadily making your way through whole albums counts for everything. It runs locally from a Spotify data export, works fully offline, and can enrich with the Spotify Web API for true album coverage plus cover art.

There's a [live preview of my own results](https://lab.zander.wtf/spotify).
