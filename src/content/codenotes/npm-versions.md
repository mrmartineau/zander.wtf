---
title: npm package versions
tags:
  - devops
date: 2023-05-16
emoji: 📦
---

## Update all packages interactively

Using [npm-check](https://github.com/dylang/npm-check):

```sh
npm-check -u
# or (if it doesn't detect the package manager correctly)
NPM_CHECK_INSTALLER=npm npm-check -u
```
