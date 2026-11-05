---
slug: update-npm-modules
title: Updating npm packages
subtitle: Exploring the myriad of options to enable you to update with ease
date: 2016-05-21
modified: 2026-11-05
---

## Update 05/11/2026

This post is ten years old. Most of the tools in it are dead, and the rest have better replacements. Here's what's current. The original post is further down, because the `npm` commands in it still work.

**TL;DR**

- Every package manager can list outdated packages: `npm outdated`, `pnpm outdated`, `bun outdated`, `deno outdated`.
- pnpm, Yarn and Bun have an interactive picker built in. npm doesn't, so use `npm-check-updates` or `taze`.
- Set a **cooldown**, so you never install a version that's only hours old.
- Add a malware blocker such as Aikido Safe Chain, Socket Firewall or npq.
- To stop doing this by hand, let Renovate or Dependabot open the PRs.

### npm

`npm outdated` lists what's behind. `npm update` moves packages inside the ranges in your `package.json`, and leaves the file alone unless you add `--save`. To jump a major version, name the package with `@latest`.

```sh
npm outdated
npm update --save
npm install lodash@latest
```

npm has no interactive picker. That's what `npm-check-updates` and `taze` are for, further down.

### pnpm

```sh
pnpm outdated

# pick what to update, jumping past the ranges in package.json
pnpm up --interactive --latest

# the short version
pnpm up -i -L
```

Add `-r` to cover every workspace in a monorepo.

### Yarn

Yarn 4 still has its interactive upgrade screen built in:

```sh
yarn upgrade-interactive
```

### Bun

```sh
bun outdated
bun update --interactive
```

In the picker, space toggles a package and `l` switches it between the newest version your range allows and the latest. Add `--recursive` for workspaces.

### Deno

```sh
deno outdated
deno update --latest
```

### npm-check-updates

[npm-check-updates](https://github.com/raineorshine/npm-check-updates) (`ncu`) is still maintained, and it works with npm, pnpm and Yarn. Run it with no flags to see what's behind. Add `-u` to write the new versions to `package.json`.

```sh
# list what's outdated
npx npm-check-updates

# pick what to update, grouped into patch, minor and major
npx npm-check-updates --interactive --format group

# minor and patch updates only, written to package.json
npx npm-check-updates --target minor -u
```

In a monorepo, add `--deep`.

### taze

[taze](https://github.com/antfu-collective/taze) only bumps versions inside the ranges you set in `package.json` by default. That's safe, and it's what `npm install` does too. It also checks the GitHub Actions in your workflows.

```sh
# bump to the latest stable versions, including majors (breaking changes)
npx taze major -w

# or bump to the latest minor changes within the same major version
npx taze minor -w

# pick by hand
npx taze major --interactive
```

### Wait before you update

A brand new version is the riskiest one. pnpm's docs point out that malicious releases are usually found and pulled from the registry within an hour. A **cooldown** makes your package manager ignore any version younger than a set age, so you skip most of them.

| Tool | Setting | Unit |
| --- | --- | --- |
| npm 11.10+ | `min-release-age=7` in `.npmrc` | days |
| pnpm | `minimumReleaseAge: 10080` in `pnpm-workspace.yaml` | minutes |
| Yarn 4.10+ | `npmMinimalAgeGate: "1w"` in `.yarnrc.yml` | duration |
| Bun | `minimumReleaseAge = 604800` under `[install]` in `bunfig.toml` | seconds |
| npm-check-updates | `--cooldown 7` | days |
| taze | `--maturity-period 7` | days |

The units are easy to mix up: npm counts days, pnpm counts minutes. npm's setting is off until you set it. pnpm already defaults to one day (1440 minutes) from version 11. `ncu` reads your package manager's setting if you don't pass `--cooldown`.

### Block malware at install time

A cooldown skips new versions. These tools go further and check each package against a malware list before it lands on your machine. They wrap your package manager, so you keep typing the same commands.

I use [Aikido Safe Chain](https://github.com/AikidoSec/safe-chain). It's free and needs no token. It sets up shell aliases for `npm`, `npx`, `yarn`, `pnpm`, `bun` and a few Python tools, then runs a local proxy that checks every download against Aikido's malware feed, deep dependencies included. It has its own cooldown too, 48 hours by default. Urgent security patches that Aikido has checked skip that wait.

Run the install script from the README, restart your terminal, then check it works:

```sh
npm safe-chain-verify

# blocked on purpose, because it's a test package flagged as malware
npm install safe-chain-test
```

Two other tools do a similar job:

- [Socket Firewall Free](https://docs.socket.dev/docs/socket-firewall-overview) (`sfw`) is free for everyone and blocks known malware. You run it as a prefix, like `sfw npm install`, after `npm install -g sfw`. The paid Enterprise tier adds custom policies.
- [npq](https://github.com/lirantal/npq) audits a package before install. It checks Snyk's vulnerability database, the package's age and download count, whether it has a README and a LICENSE, and whether it runs install scripts. Install it with `npm install -g npq` and run `npq install express`. Set `NPQ_PKG_MGR` to hand the install to pnpm or Yarn. If it only finds warnings, it waits 15 seconds and carries on, so add `--disable-auto-continue` if you want it strict.

Safe Chain and Socket check a threat feed. npq uses heuristics. Its own README says a malicious package can still pass its checks. None of these catch everything, so use them with a cooldown, not instead of one.

### Let a bot do it

Greenkeeper shut down in 2020. [Renovate](https://docs.renovatebot.com/) and [Dependabot](https://docs.github.com/en/code-security/dependabot) do the same job: they open a PR for every new version, your tests run, and you only look at the ones that matter. Both have a cooldown too.

```json
{
  "extends": ["config:recommended"],
  "minimumReleaseAge": "7 days",
  "internalChecksFilter": "strict"
}
```

That's `renovate.json`. The `strict` filter stops Renovate from opening a PR until the version is old enough. For Dependabot, use `cooldown` in `.github/dependabot.yml`. It applies to version updates only, so security updates still arrive straight away.

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    cooldown:
      default-days: 7
```

---

> Everything below is the original 2016 post. The `npm` commands still work. Most of the third-party tools don't.

The [npm](http://npmjs.org) cli by itself already offers users a number of different ways to update local and global packages, and for the most part I will focus on working with local packages because that is where I often spend my time; updating and installing them.

## npm update

npm update does exactly as you'd expect, give it a package as the argument and it will update, like so:

```sh
npm update lodash
```

This however, will crucially not update your package.json file, so to do that, add the `--save` flag (or `--save-dev` etc), like so:

```sh
npm update lodash --save
```

This is useful if you know there are updates, but what would do to find out if there were any updates needed?

### Updating npm itself

You might not be aware that npm can update itself. Just run `npm update -g npm`.

## npm outdated

npm outdated will check the npm registry to see if any (or, specific) installed packages are currently outdated. Some example output might look like this:

```sh
$ npm outdated
Package              Current  Wanted  Latest  Location
babel-preset-es2015    6.6.0   6.9.0   6.9.0  kickoff
cssnano                3.5.2   3.6.2   3.6.2  kickoff
eslint                2.10.1  2.10.2  2.10.2  kickoff
imagemin-gifsicle      4.2.0   4.2.0   5.0.1  kickoff
imagemin-mozjpeg       5.1.0   5.1.0   6.0.0  kickoff
imagemin-optipng       4.3.0   4.3.0   5.1.0  kickoff
imagemin-pngquant      4.2.2   4.2.2   5.0.0  kickoff
imagemin-svgo          4.2.1   4.2.1   5.1.0  kickoff
opn                    4.0.1   4.0.2   4.0.2  kickoff
```

It is extremely useful at telling you what is out of date but the only way to update each of these packages is to run npm update on them individually or as a group, which isn't ideal; see below:

```sh
npm update babel-preset-es2015 cssnano eslint imagemin-gifsicle imagemin-mozjpeg imagemin-optipng imagemin-pngquant imagemin-svgo opn --save
```

You can see I used the `--save` flag, but what if some were in `devDependencies` or `optionalDependencies`? I would have to run the command a few times with different flags to ensure that my package.json was updated correctly.

## More tools to check and update your dependencies

As you can see, while the built-in commands are useful, there's gotta be a better way. There is/are and below I will show a few of them

### david

Update: this one is dead. The last release was in 2022.

david is the cli for the popular [david-dm](https://david-dm.org/) service. It offers a very simple cli for checking and updating you dependencies?

- Install: `npm i -g david`
- Run: `david`
- Run and update package.json: `david update`
- More info: [libraries.io/npm/david](https://libraries.io/npm/david)

```sh
$ david
devDependencies

┌───────────────────┬─────────┬────────┐
│ Name              │ Package │ Latest │
├───────────────────┼─────────┼────────┤
│ imagemin-optipng  │ 4.3.0   │ 5.1.0  │
├───────────────────┼─────────┼────────┤
│ imagemin-pngquant │ 4.2.2   │ 5.0.0  │
├───────────────────┼─────────┼────────┤
│ imagemin-mozjpeg  │ 5.1.0   │ 6.0.0  │
├───────────────────┼─────────┼────────┤
│ imagemin-gifsicle │ 4.2.0   │ 5.0.1  │
├───────────────────┼─────────┼────────┤
│ imagemin-svgo     │ 4.2.1   │ 5.1.0  │
└───────────────────┴─────────┴────────┘

npm install --save-dev imagemin-optipng@5.1.0 imagemin-pngquant@5.0.0 imagemin-mozjpeg@6.0.0 imagemin-gifsicle@5.0.1 imagemin-svgo@5.1.0
```

---

### npm-check-updates

npm-check-updates is a command-line tool that allows you to upgrade your package.json or bower.json dependencies to the latest versions, regardless of existing version constraints.

npm-check-updates maintains your existing semantic versioning policies, i.e., it will upgrade your `"express": "^4.11.2"` dependency to `"express": "^5.0.0"` when express 5.0.0 is released.

- Install: `npm i -g npm-check-updates`
- Run: `ncu`
- Run and update package.json: `ncu -u`
- More info: [libraries.io/npm/npm-check-updates](https://libraries.io/npm/npm-check-updates)

```sh
$ ncu

 imagemin-gifsicle  4.2.0  →  5.0.1
 imagemin-mozjpeg   5.1.0  →  6.0.0
 imagemin-optipng   4.3.0  →  5.1.0
 imagemin-pngquant  4.2.2  →  5.0.0
 imagemin-svgo      4.2.1  →  5.1.0

The following dependencies are satisfied by their declared version range, but the installed versions are behind. You can install the latest versions without modifying your package file by using npm update. If you want to update the dependencies in your package file anyway, use -a/--upgradeAll.

 babel-preset-es2015  ^6.3.13  →   ^6.9.0
 cssnano               ^3.5.2  →   ^3.6.2
 eslint               ^2.10.0  →  ^2.10.2
 opn                   ^4.0.1  →   ^4.0.2

Run with -u to upgrade package.json
```

---

### npm-dview

Update: this one is dead too. The last release was in 2022.

npm-dview is a command line tool for comparing a package.json file's dependency version numbers with the latest remote version number. It compares both "dependencies" and/or "devDependencies".

- Install: `npm i -g npm-dview`
- Run: `npm-dview`
- Run and update package.json: `npm-dview --update`
- More info: [libraries.io/npm/npm-dview](https://libraries.io/npm/npm-dview)

```sh
$ npm-dview
Processing: /Users/mrmartineau/htdocs/trykickoff/kickoff/package.json
Processing: dependencies 3 of 3 [===] 100% 0.2s


Processing: devDependencies 22 of 22 [======================] 100% 0.9s



Regular Dependencies
┌───────────────────────────┬──────────────────┬────────┬────────┬──────────┐
│ Module Name               │ Requested        │ Local  │ Remote │ Current? │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ console                   │ ^0.5.2           │ 0.5.2  │ 0.5.2  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ double-dollar             │ ^1.0.0           │ 1.0.0  │ 1.0.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ lite-ready                │ ^1.0.4           │ 1.0.4  │ 1.0.4  │ ✓        │
└───────────────────────────┴──────────────────┴────────┴────────┴──────────┘

Dev Dependencies
┌───────────────────────────┬──────────────────┬────────┬────────┬──────────┐
│ Module Name               │ Requested        │ Local  │ Remote │ Current? │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ autoprefixer              │ ^6.3.6           │ 6.3.6  │ 6.3.6  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ babel-plugin-transform-o… │ ^6.8.0           │ 6.8.0  │ 6.8.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ babel-preset-es2015       │ ^6.3.13          │ 6.6.0  │ 6.9.0  │ ✖        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ babelify                  │ ^7.3.0           │ 7.3.0  │ 7.3.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ cssnano                   │ ^3.5.2           │ 3.5.2  │ 3.6.2  │ ✖        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ grunt                     │ ^1.0.1           │ 1.0.1  │ 1.0.1  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ grunt-browserify          │ ^5.0.0           │ 5.0.0  │ 5.0.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ grunt-contrib-clean       │ ^1.0.0           │ 1.0.0  │ 1.0.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ grunt-contrib-copy        │ ^1.0.0           │ 1.0.0  │ 1.0.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ grunt-contrib-imagemin    │ ^1.0.0           │ 1.0.0  │ 1.0.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ grunt-newer               │ ^1.2.0           │ 1.2.0  │ 1.2.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ grunt-shimly              │ ^1.0.2           │ 1.0.2  │ 1.0.2  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ imagemin-gifsicle         │ 4.2.0            │ 4.2.0  │ 5.0.1  │ ✖        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ imagemin-mozjpeg          │ 5.1.0            │ 5.1.0  │ 6.0.0  │ ✖        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ imagemin-optipng          │ 4.3.0            │ 4.3.0  │ 5.1.0  │ ✖        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ imagemin-pngquant         │ 4.2.2            │ 4.2.2  │ 5.0.0  │ ✖        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ imagemin-svgo             │ 4.2.1            │ 4.2.1  │ 5.1.0  │ ✖        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ load-grunt-configs        │ ^1.0.0           │ 1.0.0  │ 1.0.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ load-grunt-tasks          │ ^3.5.0           │ 3.5.0  │ 3.5.0  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ minifyify                 │ ^7.3.3           │ 7.3.3  │ 7.3.3  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ postscss                  │ ^1.4.1           │ 1.4.1  │ 1.4.1  │ ✓        │
├───────────────────────────┼──────────────────┼────────┼────────┼──────────┤
│ time-grunt                │ ^1.3.0           │ 1.3.0  │ 1.3.0  │ ✓        │
└───────────────────────────┴──────────────────┴────────┴────────┴──────────┘

Peer Dependencies
┌────────────────────────────────────────────────┐
│ Warning                                        │
├────────────────────────────────────────────────┤
│ No dependencies found in the package.json file │
└────────────────────────────────────────────────┘
```

---

### npm-check

Update: it still works, and the last release was in September 2025. `ncu --interactive` gives you the same picker and gets updated more often.

npm-check is very similar to the others in this category, with one exception: it has an interactive interface that allows you to choose which packages you want updated. This is extremely useful if you don't want to update some packages for example. It can also be used on global packages too/

- Install: `npm i -g npm-check`
- Run: `npm-check`
- Run and update package.json: `npm-check -u` This presents an interactive package update chooser. Use `npm-check -g -u`
- More info: [libraries.io/npm/npm-check](https://libraries.io/npm/npm-check)

```sh
$ npm-check -u
? Choose which packages to update.

 Minor Update New backwards-compatible features.
 ◯ babel-preset-es2015 devDep  6.6.0  ❯  6.9.0  https://babeljs.io/
 ◯ cssnano devDep              3.5.2  ❯  3.6.2  https://github.com/ben-eb/cssnano

 Major Update Potentially breaking API changes. Use caution.
 ◯ imagemin-gifsicle devDep  4.2.0  ❯  5.0.1  https://github.com/imagemin/imagemin-gifsicle#readme
 ◯ imagemin-mozjpeg devDep   5.1.0  ❯  6.0.0  https://github.com/imagemin/imagemin-mozjpeg#readme
 ◯ imagemin-optipng devDep   4.3.0  ❯  5.1.0  https://github.com/imagemin/imagemin-optipng#readme
 ◯ imagemin-pngquant devDep  4.2.2  ❯  5.0.0  https://github.com/imagemin/imagemin-pngquant#readme
 ◯ imagemin-svgo devDep      4.2.1  ❯  5.1.0  https://github.com/imagemin/imagemin-svgo#readme

 Space to select. Enter to start upgrading. Control-C to cancel.
```

---

## Is there another way?

Update: Greenkeeper shut down in 2020, so the advice below is out of date. Use Renovate or Dependabot, as shown at the top.

Yes there is. Using services like [Greenkeeper.io](https://greenkeeper.io/), Dependabot or Renovate which tracks your dependencies and applies an update to a branch for every new version coming in. Your test suite runs behind the scenes, and only if a dependency update breaks your software, we let you know in a Pull Request, including all the information you need to make an informed decision.

---

If you work on an open-source Github repo, [Greenkeeper.io](https://greenkeeper.io/) is a brilliant choice. It is free for public repos and 1 private repo, and very affordable if you have more private repos. We use it on [Kickoff](http://github.com/TryKickoff/kickoff) and it is brilliant.

For all other use cases, I recommend [npm-check](https://libraries.io/npm/npm-check). The interactive tool is so useful, it not only shows you which packages need updating but provides more information about the package too.

If I have missed any others, please let me know [on Twitter](http://twitter.com/MrMartineau).

It is also worth noting that you might not want to update your dependencies. This is a much more tricky subject that is best left for another post, but if you're interested right now, I recommend reading Nicolás Bevacqua's [post on the subject](https://ponyfoo.com/articles/immutable-npm-dependencies)
