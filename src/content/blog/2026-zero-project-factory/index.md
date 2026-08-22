---
slug: zero-project-factory
title: 'Zero: my project factory'
subtitle: How a single GitHub Actions workflow takes me from an idea on my phone to a scaffolded, deployed-ready project with a database, secrets, and Claude already building it.
date: 2026-07-08
tags:
  - side-project
  - github-actions
  - automation
---

In [my zero-to-one stack post](/blog/zero-to-one-stack) I ended with an admission: the one part of shipping side projects I hadn't cracked was the boring ceremony between "I've just had an idea" and "something is actually being built". Create a repo from a template, create a Neon project, copy secrets around, find the repo in Claude Code and explain what I want. None of it hard, all of it friction, and ideas die in that gap.

I've now cracked it. The answer is a repo called **zero**: a project factory built from a single GitHub Actions workflow. I trigger it (from my phone, usually), give it a name, an idea, and a project type, and a few seconds later there's a new private repo scaffolded from one of my starter templates, with infrastructure provisioned, secrets set, and (optionally) Claude already working on the brief.

**TL;DR**

- One `workflow_dispatch` workflow with three main inputs: `name`, `idea`, `type`
- `type: app` scaffolds from [zed-stack-starter](https://github.com/mrmartineau/zed-stack-starter) (React, TanStack, Hono, better-auth, Drizzle), provisions a [Neon](https://neon.com/signup?refcode=NK4UL5YL) Postgres database via their API, and wires up a Cloudflare Hyperdrive config in front of it
- `type: astro` scaffolds from [zed-astro-starter](https://github.com/mrmartineau/zed-astro-starter) and stops there, because a static site doesn't need anything else
- `type: package` scaffolds from [zed-package-starter](https://github.com/mrmartineau/zed-package-starter), optionally stripping the Astro docs site
- `type: ios` scaffolds from [zed-ios-app-starter](https://github.com/mrmartineau/zed-ios-app-starter) and renames the Xcode target, bundle id and `@main` struct to match the project
- Cloudflare deployment secrets are copied into the new repo automatically (except for iOS, which has nothing to deploy)
- An optional final step opens an issue with an `@claude build this` mention, so the first commit happens without me
- Full workflow source is below; take it and adapt it

## Four templates, one factory

The factory sits on top of the starter templates that make up [the Zed Stack](/zed-stack). [zed-stack-starter](https://github.com/mrmartineau/zed-stack-starter) is for interactive React applications: TanStack Router and Query, Hono on Cloudflare Workers, Postgres on Neon with Drizzle and better-auth. [zed-astro-starter](https://github.com/mrmartineau/zed-astro-starter) is for content-driven, mostly-static sites. [zed-package-starter](https://github.com/mrmartineau/zed-package-starter) is for TypeScript npm packages, with a docs site attached. And the newest one, [zed-ios-app-starter](https://github.com/mrmartineau/zed-ios-app-starter), is for native iOS apps: SwiftUI and SwiftData, iOS 18+, no third-party dependencies.

The three web templates all use [ZUI](https://zui.zander.wtf), my CSS-first UI library, but otherwise these are quite different beasts. One needs a database, auth secrets, and an API. One just needs to exist and deploy. One needs npm and release tooling. And one doesn't touch Cloudflare at all, but does need every occurrence of a placeholder name rewritten before it will even compile.

That difference is exactly what the workflow encodes. The `type` input decides which template to generate from and how much infrastructure to bother with:

- **`app`**: create the repo from zed-stack-starter, create a Neon Postgres project via their API, set `DATABASE_URL` and a freshly generated `BETTER_AUTH_SECRET` as repo secrets, add the Cloudflare deployment secrets, then provision a Hyperdrive config and commit its id into `wrangler.jsonc`.
- **`astro`**: create the repo from zed-astro-starter, add the Cloudflare secrets, and basically leave it at that.
- **`package`**: create the repo from zed-package-starter, add the Cloudflare secrets for the docs deploy, and remove `docs/` entirely if I've said I don't want it.
- **`ios`**: create the repo from zed-ios-app-starter, rename the project throughout, and skip the Cloudflare step. An iOS app has nothing to deploy to a Worker.

## The workflow

Here's the whole thing. It lives in the zero repo as `.github/workflows/create-project.yml`:

```yaml
name: 🏭 New project

on:
  workflow_dispatch:
    inputs:
      name:
        description: Repo / project name
        required: true
        type: string
      idea:
        description: What should it do?
        required: true
        type: string
      type:
        description: Project type
        required: true
        type: choice
        default: app
        options:
          - app # React + Neon (zed-stack-starter)
          - astro # Astro (zed-astro-starter)
          - package # Node package + Astro docs (zed-package-starter)
          - ios # SwiftUI iOS app (zed-ios-app-starter)
      with_docs:
        description: "Package type only: include the Astro docs site (apps/docs)"
        required: false
        type: boolean
        default: true
      kickoff_claude:
        description: Kick off Claude to build the project
        required: false
        type: boolean
        default: false

env:
  GH_TOKEN: ${{ secrets.FACTORY_GH_PAT }}
  OWNER: mrmartineau
  NAME: ${{ inputs.name }}
  IDEA: ${{ inputs.idea }}

jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - name: Pick template
        id: template
        run: |
          if [ "${{ inputs.type }}" = "astro" ]; then
            echo "repo=zed-astro-starter" >> "$GITHUB_OUTPUT"
          elif [ "${{ inputs.type }}" = "package" ]; then
            echo "repo=zed-package-starter" >> "$GITHUB_OUTPUT"
          elif [ "${{ inputs.type }}" = "ios" ]; then
            echo "repo=zed-ios-app-starter" >> "$GITHUB_OUTPUT"
          else
            echo "repo=zed-stack-starter" >> "$GITHUB_OUTPUT"
          fi

      - name: Create repo from template
        run: |
          gh api "/repos/$OWNER/${{ steps.template.outputs.repo }}/generate" \
            -f name="$NAME" \
            -f owner="$OWNER" \
            -F private=true \
            -f description="$IDEA"

      - name: Wait for repo to be ready
        run: |
          # template generation is async; poll until contents exist
          for i in $(seq 1 12); do
            if gh api "/repos/$OWNER/$NAME/contents/README.md" >/dev/null 2>&1; then
              exit 0
            fi
            sleep 5
          done
          echo "Repo never became ready" >&2
          exit 1

      - name: Strip docs site
        if: inputs.type == 'package' && !inputs.with_docs
        run: |
          set -euo pipefail
          git clone "https://x-access-token:$GH_TOKEN@github.com/$OWNER/$NAME.git" repo
          cd repo
          if [ ! -d docs ]; then
            echo "docs not found in template; nothing to strip" >&2
            exit 0
          fi
          rm -rf docs
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -am "chore: remove docs site"
          git push

      - name: Rename iOS project
        if: inputs.type == 'ios'
        id: ios
        run: |
          set -euo pipefail
          # The template ships its own scaffold.sh, but it's written for macOS
          # (`sed -i ''`) and copies to a sibling directory, so the same
          # substitutions are done in place here. These placeholders have to stay
          # in step with the ones at the top of zed-ios-app-starter/scaffold.sh.
          TEMPLATE_NAME=AppStarter
          TEMPLATE_BUNDLE_ID=wtf.zander.AppStarter
          TEMPLATE_DISPLAY_NAME="App Starter"
          TEMPLATE_REPO_NAME=zed-ios-app-starter

          # The name becomes `struct <Name>App` and an Xcode target, so it has to
          # be a valid Swift identifier — a kebab-case repo name won't compile.
          SWIFT_NAME=$(printf '%s' "$NAME" | sed -E 's/[^A-Za-z0-9]+/ /g' \
            | awk '{ for (i = 1; i <= NF; i++) $i = toupper(substr($i, 1, 1)) substr($i, 2); print }' \
            | tr -d ' ')
          case "$SWIFT_NAME" in
            '' | [0-9]*) SWIFT_NAME="App$SWIFT_NAME" ;;
          esac
          BUNDLE_ID="wtf.zander.$SWIFT_NAME"
          echo "name=$SWIFT_NAME" >> "$GITHUB_OUTPUT"
          echo "bundle_id=$BUNDLE_ID" >> "$GITHUB_OUTPUT"

          git clone "https://x-access-token:$GH_TOKEN@github.com/$OWNER/$NAME.git" repo
          cd repo

          # Paths first, deepest-first so renaming a parent never invalidates a
          # path still queued for renaming.
          find . -depth -name "*$TEMPLATE_NAME*" -not -path './.git/*' -print0 |
            while IFS= read -r -d '' path; do
              mv "$path" "$(dirname "$path")/$(basename "$path" | sed "s/$TEMPLATE_NAME/$SWIFT_NAME/g")"
            done

          # Then contents. The bundle id and display name are substituted before
          # the bare name so the generic rule doesn't half-rewrite them.
          find . -type f ! -path './.git/*' \
            ! -name '*.png' ! -name '*.jpg' ! -name '*.pdf' -print0 |
            while IFS= read -r -d '' file; do
              LC_ALL=C sed -i \
                -e "s|$TEMPLATE_REPO_NAME|$SWIFT_NAME|g" \
                -e "s|$TEMPLATE_BUNDLE_ID|$BUNDLE_ID|g" \
                -e "s|$TEMPLATE_DISPLAY_NAME|$SWIFT_NAME|g" \
                -e "s|$TEMPLATE_NAME|$SWIFT_NAME|g" \
                "$file"
            done

          # Parts of the README document the template itself; it marks those
          # regions so they can be dropped from a generated project.
          awk '/<!-- template-only:start -->/ { skip = 1; next }
               /<!-- template-only:end -->/   { skip = 0; next }
               !skip' README.md > README.tmp && mv README.tmp README.md
          # scaffold.sh has just been rewritten to refer to this project, which
          # makes it useless — the template keeps the original.
          rm -f scaffold.sh

          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "chore: rename project to $SWIFT_NAME"
          git push

      - name: Create Neon project
        if: inputs.type == 'app'
        id: neon
        run: |
          RESPONSE=$(curl -sf -X POST https://console.neon.tech/api/v2/projects \
            -H "Authorization: Bearer ${{ secrets.NEON_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d "{\"project\": {\"name\": \"$NAME\"}}")
          URI=$(echo "$RESPONSE" | jq -r '.connection_uris[0].connection_uri')
          echo "::add-mask::$URI"
          echo "uri=$URI" >> "$GITHUB_OUTPUT"
          # values needed to wire up Hyperdrive (direct host, not the -pooler endpoint)
          echo "project_id=$(echo "$RESPONSE" | jq -r '.project.id')" >> "$GITHUB_OUTPUT"
          echo "branch_id=$(echo "$RESPONSE" | jq -r '.branch.id')" >> "$GITHUB_OUTPUT"
          echo "host=$(echo "$RESPONSE" | jq -r '.endpoints[0].host')" >> "$GITHUB_OUTPUT"
          echo "db=$(echo "$RESPONSE" | jq -r '.databases[0].name')" >> "$GITHUB_OUTPUT"

      - name: Set app secrets
        if: inputs.type == 'app'
        run: |
          gh secret set DATABASE_URL -R "$OWNER/$NAME" -b "${{ steps.neon.outputs.uri }}"
          gh secret set BETTER_AUTH_SECRET -R "$OWNER/$NAME" -b "$(openssl rand -base64 32)"

      - name: Set common secrets
        # An iOS app has nothing to deploy to Cloudflare.
        if: inputs.type != 'ios'
        env:
          DEPLOY_TOKEN: ${{ secrets.CLOUDFLARE_DEPLOY_TOKEN }}
          CF_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          set -euo pipefail
          # `gh secret set -b ""` succeeds, so an unset secret would silently ship
          # an empty deploy token to the new repo.
          if [ -z "$DEPLOY_TOKEN" ] || [ -z "$CF_ACCOUNT_ID" ]; then
            echo "CLOUDFLARE_DEPLOY_TOKEN / CLOUDFLARE_ACCOUNT_ID must be set on this repo" >&2
            exit 1
          fi
          # The child deploys Workers; it never provisions Hyperdrive, so it gets a
          # deploy-scoped token rather than zero's Hyperdrive-Edit one.
          gh secret set CLOUDFLARE_API_TOKEN -R "$OWNER/$NAME" -b "$DEPLOY_TOKEN"
          gh secret set CLOUDFLARE_ACCOUNT_ID -R "$OWNER/$NAME" -b "$CF_ACCOUNT_ID"

      - name: Set up Hyperdrive
        if: inputs.type == 'app'
        id: hyperdrive
        env:
          NEON_API_KEY: ${{ secrets.NEON_API_KEY }}
          CF_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CF_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          PROJECT_ID: ${{ steps.neon.outputs.project_id }}
          BRANCH_ID: ${{ steps.neon.outputs.branch_id }}
          HOST: ${{ steps.neon.outputs.host }}
          DB: ${{ steps.neon.outputs.db }}
        run: |
          set -euo pipefail

          # 1. Create a dedicated Neon role for Hyperdrive; Neon returns its password.
          #    A freshly-created project is Locked (HTTP 423) while its init operations
          #    run, so retry until it unlocks and returns 201.
          #    No GRANT is needed afterwards: roles created via the Neon API are members
          #    of neon_superuser, which carries pg_read_all_data + pg_write_all_data.
          for i in $(seq 1 30); do
            CODE=$(curl -s -o /tmp/role.json -w '%{http_code}' -X POST \
              "https://console.neon.tech/api/v2/projects/$PROJECT_ID/branches/$BRANCH_ID/roles" \
              -H "Authorization: Bearer $NEON_API_KEY" \
              -H "Content-Type: application/json" \
              -d '{"role": {"name": "hyperdrive"}}')
            [ "$CODE" = "201" ] && break
            echo "role create attempt $i: HTTP $CODE - $(cat /tmp/role.json)"
            sleep 5
          done
          if [ "$CODE" != "201" ]; then
            echo "Neon role creation failed after retries" >&2
            exit 1
          fi
          PW=$(jq -r '.role.password' /tmp/role.json)
          echo "::add-mask::$PW"

          # 2. Create the Hyperdrive config on Cloudflare (needs Hyperdrive:Edit on the token)
          CODE=$(curl -s -o /tmp/hd.json -w '%{http_code}' -X POST \
            "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/hyperdrive/configs" \
            -H "Authorization: Bearer $CF_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
              \"name\": \"hd-$NAME\",
              \"origin\": {
                \"scheme\": \"postgres\",
                \"host\": \"$HOST\",
                \"port\": 5432,
                \"database\": \"$DB\",
                \"user\": \"hyperdrive\",
                \"password\": \"$PW\"
              }
            }")
          if [ "$CODE" != "201" ] && [ "$CODE" != "200" ]; then
            echo "Hyperdrive config creation failed: HTTP $CODE - $(cat /tmp/hd.json)" >&2
            exit 1
          fi
          HD_ID=$(jq -r '.result.id' /tmp/hd.json)
          echo "id=$HD_ID" >> "$GITHUB_OUTPUT"

      - name: Write Hyperdrive id to repo
        if: inputs.type == 'app'
        env:
          HD_ID: ${{ steps.hyperdrive.outputs.id }}
        run: |
          set -euo pipefail
          git clone "https://x-access-token:$GH_TOKEN@github.com/$OWNER/$NAME.git" repo
          cd repo
          # replace the placeholder id shipped in the zed-stack-starter template
          sed -i "s/61cb2d007c58420cad7f37a907240d32/$HD_ID/" wrangler.jsonc
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git commit -am "chore: wire up Hyperdrive id"
          git push

      - name: Kick off Claude
        if: inputs.kickoff_claude
        env:
          TYPE: ${{ inputs.type }}
          WITH_DOCS: ${{ inputs.with_docs }}
          SWIFT_NAME: ${{ steps.ios.outputs.name }}
          BUNDLE_ID: ${{ steps.ios.outputs.bundle_id }}
        run: |
          set -euo pipefail
          COMMON='Update the readme, the package.json `name` field, and any other relevant files.'
          if [ "$TYPE" = "ios" ]; then
            INSTRUCTIONS="Update the readme, the app's display name, and any other relevant files. The Xcode target is \`$SWIFT_NAME\` and the bundle id is \`$BUNDLE_ID\`. Build with \`xcodebuild -project $SWIFT_NAME.xcodeproj -scheme $SWIFT_NAME -destination 'generic/platform=iOS Simulator' build\`. The optional in-app purchases and Claude API modules are off in \`Support/AppFeatures.swift\` — turn one on or delete its folder depending on what the idea needs."
          elif [ "$TYPE" = "package" ]; then
            INSTRUCTIONS="$COMMON Make sure the package is ready to build, test, and publish to npm."
            if [ "$WITH_DOCS" = "true" ]; then
              INSTRUCTIONS="$INSTRUCTIONS The Astro docs site in \`apps/docs\` should be ready to run locally and deploy to Cloudflare Workers; update its Cloudflare project name."
            fi
          else
            INSTRUCTIONS="$COMMON Update the Cloudflare project name. Make sure the project is ready to run locally and deploy to Cloudflare Workers."
          fi
          gh issue create -R "$OWNER/$NAME" \
            --title "Build: $NAME" \
            --body "$IDEA

          @claude build this. $INSTRUCTIONS" \
            --label "claude"

      - name: Summary
        run: |
          {
            echo "### 🎉 $NAME created"
            echo "- Repo: https://github.com/$OWNER/$NAME"
            echo "- Type: ${{ inputs.type }}"
            if [ "${{ inputs.type }}" = "app" ]; then
              echo "- Hyperdrive: \`${{ steps.hyperdrive.outputs.id }}\` (dedicated \`hyperdrive\` Neon role)"
            fi
            if [ "${{ inputs.type }}" = "ios" ]; then
              echo "- Xcode target: \`${{ steps.ios.outputs.name }}\` (bundle id \`${{ steps.ios.outputs.bundle_id }}\`)"
            fi
          } >> "$GITHUB_STEP_SUMMARY"
```

A few details worth calling out:

- **Template generation is async.** The GitHub [`/generate` endpoint](https://docs.github.com/en/rest/repos/repos#create-a-repository-using-a-template) returns before the new repo actually has contents, so there's a polling step that waits for the README to exist before doing anything else. Without it, the secret-setting steps race the scaffold and lose.
- **The Neon connection string is masked.** `::add-mask::` stops the database URI from ever appearing in the workflow logs before it's passed between steps, and the Hyperdrive role's password gets the same treatment.
- **A fresh Neon project is locked.** Creating the dedicated `hyperdrive` role right after creating the project returns a 423 while Neon's own init operations run, so that step retries until it gets a 201 rather than failing on the first try.
- **`gh secret set -b ""` succeeds.** Which means an unset `CLOUDFLARE_DEPLOY_TOKEN` would silently ship an empty deploy token to every new repo, and you'd only find out at the first failed deploy. There's an explicit emptiness check before it.
- **The idea becomes the repo description.** A tiny thing, but it means the one-line brief travels with the project, so six months later I can remember what `plant-tracker-3` was supposed to be.

## Renaming an iOS project

The iOS type is the one that needed real work, because an Xcode project can't just be copied and left alone. The template's target is called `AppStarter`, and that name is baked into directory names, file names, the `@main` struct (`struct AppStarterApp`), the bundle identifier and the StoreKit product ids. Leave it and every generated app is called AppStarter.

The template ships a `scaffold.sh` that handles this locally, but it's written for macOS, with its `sed -i ''` quirk, and copies to a sibling directory, so the workflow does the same substitutions in place instead:

- The repo name is coerced into a valid Swift identifier. `my-new-app` becomes `MyNewApp`, because a hyphenated name won't compile as a type, and a name starting with a digit gets an `App` prefix.
- Paths are renamed depth-first, so renaming a parent directory never invalidates a path still queued for renaming.
- Then file contents, with the bundle id and display name substituted *before* the bare name. Otherwise the generic rule half-rewrites them and you get `wtf.zander.MyNewApp.MyNewApp`.
- The README's template-only regions, marked with `<!-- template-only:start -->` comments, are stripped out. Documentation about how to use the template is noise inside a project generated from it.
- `scaffold.sh` deletes itself, since it's just been rewritten to refer to the new project, which makes it useless.

## The Claude step

The last optional input is my favourite bit. If `kickoff_claude` is ticked, the workflow opens an issue in the freshly created repo titled `Build: <name>`, with the idea as the body and an `@claude build this` mention. I have the [Claude GitHub app](https://docs.claude.com/en/docs/claude-code/github-actions) set up, so that mention is enough to get an agent cloning the repo and making the first real commits: renaming things, updating the README, and starting on the actual idea.

The instructions attached to that mention are per-type, because "get this ready to run" means something different for each template. A package needs to build, test and publish to npm. A web app needs its Cloudflare project name updating. An iOS app needs the `xcodebuild` invocation spelled out, along with a nudge to either enable or delete the optional StoreKit and Claude API modules that ship switched off in `Support/AppFeatures.swift`.

Which means the full loop is now: idea arrives while I'm out, I open the GitHub mobile app, run the **🏭 New project** workflow with a name and a couple of sentences, and put my phone back in my pocket. By the time I'm at a computer there's a repo with a database, deployments wired up, and a first pass at the build waiting for review. That's the "one message to Claude" experience I was after, give or take a form with three fields.

## Setting it up yourself

The factory repo itself needs five Actions secrets:

| Secret                     | Purpose                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `FACTORY_GH_PAT`           | GitHub PAT with permission to create repos, push, set secrets, and open issues in the new repo     |
| `NEON_API_KEY`             | Neon API key, used to create the Postgres project and the Hyperdrive role (`app` type)             |
| `CLOUDFLARE_API_TOKEN`     | Used *by the factory* to create Hyperdrive configs, so it needs Hyperdrive:Edit                    |
| `CLOUDFLARE_DEPLOY_TOKEN`  | Passed through to the new repo for deployments; deploy-scoped only, no Hyperdrive permissions      |
| `CLOUDFLARE_ACCOUNT_ID`    | Passed through to the new repo for deployments                                                     |

Two Cloudflare tokens rather than one is deliberate. The factory needs Hyperdrive:Edit to provision a config; the child repo only ever deploys a Worker. Handing the more powerful token down to every generated project would be giving away permissions none of them use.

You can trigger it from the Actions tab in the GitHub UI (or the mobile app), or from the CLI:

```sh
gh workflow run create-project.yml \
  -f name=my-new-app \
  -f idea="A tool that tracks my houseplants' watering schedules" \
  -f type=app
```

Swap the templates, owner, and secrets for your own and the whole thing is portable. There's nothing here specific to my stack beyond which template repos it points at. If your starters are different, the factory doesn't care.

---

The thing I like most about this is how little there is to it. It's not a platform, there's no CLI to install, no service to pay for; it's a few hundred lines of YAML gluing together APIs that already existed. But it removes the exact friction that was killing ideas between the thought and the first commit. Zero to one now starts from the sofa.

If you want the rest of the picture, what each of those templates actually contains and why, I've written it all up on [the Zed Stack page](/zed-stack).
