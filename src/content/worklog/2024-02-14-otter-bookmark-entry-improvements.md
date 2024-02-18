---
title: Otter Bookmark entry improvements
date: 2024-02-14
---

When adding or editing a bookmark, Otter checks the contents of the `title`, `description` and `note` fields to see if they match existing tags. If a match is found, it is shown below the tag input field. Since the addition of collections recently, the tag matching logic needed improveing because it would only match tags exactly, for example if the tag was `web:dev` and the user typed `dev`, it wouldn't match. In this update I improved the matching logic to match tags that contain the user input. For example, if the user types `dev`, it will match `web:dev` and `dev:ops`.

Various other UI improvements were made to the app to make it better on mobile devices.
