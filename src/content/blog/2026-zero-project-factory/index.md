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

- One `workflow_dispatch` workflow with three inputs: `name`, `idea`, `type`
- `type: app` scaffolds from [zed-stack-starter](https://github.com/mrmartineau/zed-stack-starter) (React, TanStack, Hono, better-auth, Drizzle) and provisions a [Neon](https://neon.com/signup?refcode=NK4UL5YL) Postgres database via their API
- `type: astro` scaffolds from [zed-astro-starter](https://github.com/mrmartineau/zed-astro-starter) and stops there, because a static site doesn't need anything else
- Cloudflare deployment secrets are copied into the new repo automatically
- An optional final step opens an issue with an `@claude build this` mention, so the first commit happens without me
- Full workflow source is below — take it and adapt it

## Two templates, one factory

The factory sits on top of the two starter templates I've written about before. [zed-stack-starter](https://github.com/mrmartineau/zed-stack-starter) is for interactive React applications: TanStack Router and Query, Hono on Cloudflare Workers, Postgres on Neon with Drizzle and better-auth. [zed-astro-starter](https://github.com/mrmartineau/zed-astro-starter) is for content-driven, mostly-static sites. Both use [ZUI](https://zui.zander.wtf), my CSS-first UI library, but otherwise they're quite different beasts — one needs a database, auth secrets, and an API; the other just needs to exist and deploy.

That difference is exactly what the workflow encodes. The `type` input decides which template to generate from and how much infrastructure to bother with:

- **`app`** — create the repo from zed-stack-starter, create a Neon Postgres project via their API, set `DATABASE_URL` and a freshly generated `BETTER_AUTH_SECRET` as repo secrets, then add the Cloudflare deployment secrets.
- **`astro`** — create the repo from zed-astro-starter, add the Cloudflare secrets, and basically leave it at that.

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

      - name: Set app secrets
        if: inputs.type == 'app'
        run: |
          gh secret set DATABASE_URL -R "$OWNER/$NAME" -b "${{ steps.neon.outputs.uri }}"
          gh secret set BETTER_AUTH_SECRET -R "$OWNER/$NAME" -b "$(openssl rand -base64 32)"

      - name: Set common secrets
        run: |
          gh secret set CLOUDFLARE_API_TOKEN -R "$OWNER/$NAME" -b "${{ secrets.CLOUDFLARE_API_TOKEN }}"
          gh secret set CLOUDFLARE_ACCOUNT_ID -R "$OWNER/$NAME" -b "${{ secrets.CLOUDFLARE_ACCOUNT_ID }}"

      - name: Kick off Claude
        if: inputs.kickoff_claude
        run: |
          gh issue create -R "$OWNER/$NAME" \
            --title "Build: $NAME" \
            --body "$IDEA

          @claude build this. Update the readme, the Cloudflare project name, the package.json `name` field, and any other relevant files. Make sure the project is ready to run locally and deploy to Cloudflare Pages." \
            --label "claude"

      - name: Summary
        run: |
          {
            echo "### 🎉 $NAME created"
            echo "- Repo: https://github.com/$OWNER/$NAME"
            echo "- Type: ${{ inputs.type }}"
          } >> "$GITHUB_STEP_SUMMARY"
```

A few details worth calling out:

- **Template generation is async.** The GitHub [`/generate` endpoint](https://docs.github.com/en/rest/repos/repos#create-a-repository-using-a-template) returns before the new repo actually has contents, so there's a polling step that waits for the README to exist before doing anything else. Without it, the secret-setting steps race the scaffold and lose.
- **The Neon connection string is masked.** `::add-mask::` stops the database URI from ever appearing in the workflow logs before it's passed between steps.
- **The idea becomes the repo description.** A tiny thing, but it means the one-line brief travels with the project, so six months later I can remember what `plant-tracker-3` was supposed to be.

## The Claude step

The last optional input is my favourite bit. If `kickoff_claude` is ticked, the workflow opens an issue in the freshly created repo titled `Build: <name>`, with the idea as the body and an `@claude build this` mention. I have the [Claude GitHub app](https://docs.claude.com/en/docs/claude-code/github-actions) set up, so that mention is enough to get an agent cloning the repo and making the first real commits: renaming things, updating the README, and starting on the actual idea.

Which means the full loop is now: idea arrives while I'm out, I open the GitHub mobile app, run the **🏭 New project** workflow with a name and a couple of sentences, and put my phone back in my pocket. By the time I'm at a computer there's a repo with a database, deployments wired up, and a first pass at the build waiting for review. That's the "one message to Claude" experience I was after, give or take a form with three fields.

## Setting it up yourself

The factory repo itself needs four Actions secrets:

| Secret                  | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `FACTORY_GH_PAT`        | GitHub PAT with permission to create repos, set secrets, and open issues in the new repo |
| `NEON_API_KEY`          | Neon API key, used to create the Postgres project (`app` type)                           |
| `CLOUDFLARE_API_TOKEN`  | Passed through to the new repo for deployments                                           |
| `CLOUDFLARE_ACCOUNT_ID` | Passed through to the new repo for deployments                                           |

You can trigger it from the Actions tab in the GitHub UI (or the mobile app), or from the CLI:

```sh
gh workflow run create-project.yml \
  -f name=my-new-app \
  -f idea="A tool that tracks my houseplants' watering schedules" \
  -f type=app
```

Swap the templates, owner, and secrets for your own and the whole thing is portable. There's nothing here specific to my stack beyond which template repos it points at — if your starters are different, the factory doesn't care.

---

The thing I like most about this is how little there is to it. It's not a platform, there's no CLI to install, no service to pay for; it's ~100 lines of YAML gluing together APIs that already existed. But it removes the exact friction that was killing ideas between the thought and the first commit. Zero to one now starts from the sofa.
