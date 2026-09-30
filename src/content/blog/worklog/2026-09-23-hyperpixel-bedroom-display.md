---
slug: 2026-09-23-hyperpixel-bedroom-display
title: "A bedside screen for the time, my trains and the weather"
subtitle: "A Raspberry Pi Zero W and a round 480×480 touch screen by the bed, showing the time, my next trains, the weather and the sun."
date: 2026-09-23
worklog: true
tags:
  - raspberry-pi
  - side-project
---

I had a Pimoroni HyperPixel 2.1 Round and an original Pi Zero W doing nothing, so now they're a bedroom display. Tap the screen to move through the views: a Swiss railway clock face with a Rolex-style date window, a digital clock, the next four trains on two routes I use from [Realtime Trains](https://www.realtimetrains.co.uk/), the weather from [Open-Meteo](https://open-meteo.com/), sunrise and sunset on an arc, and a system screen. After five minutes without a tap it goes back to the clock.

The Zero W has one ARMv6 core and 512MB of RAM, so there's no browser and no desktop. One Python program draws straight to the screen with pygame. I started with Docker, then found that Docker releases after 24.0 crash with "Illegal instruction" on ARMv6, so it runs as a systemd service instead.
