---
title: Git worktrees with Graphite
tags:
  - dev
  - ai
date: 2026-01-27
---

Using worktrees with [Graphite](https://graphite.dev) is a bit painful, so I made some shell scripts that integrate with [Worktrunk](https://worktrunk.dev/) to make the process a lot easier

## Fishshell script

`gt-wt-create.fish`

```sh
# gt-wt-create: Create a new Graphite-tracked branch and switch to its worktree
#
# Requirements:
# - Graphite CLI (gt): https://graphite.dev/
# - Worktrunk CLI (wt): https://worktrunk.dev/
#
# Usage: gt-wt-create <branchName>
#
# Development Workflow:
# 1. Run this function to create and switch to a new worktree branch
# 2. Use `gt modify` to make your initial changes (not `gt create`, branch is already checked out)
# 3. Use normal gt operations for submitting and stacking (`gt submit`, `gt create` for stacks, etc.)
#
# When done with a stack:
# 1. Run `gt sync`
# 2. Do NOT accept deleting your worktree branches when prompted
# 3. Checkout your worktree branch and rebase it to main
# 4. Proceed with new work from there

function gt-wt-create
    if test (count $argv) -ne 1
        echo "Usage: gt-wt-create <branchName>"
        return 1
    end

    set branchName $argv[1]

    git branch $branchName
    git switch $branchName
    gt track
    git switch main
    wt switch $branchName
end
```

## Bash script

`gt-wt-create.sh`

```sh
# gt-wt-create: Create a new Graphite-tracked branch and switch to its worktree
#
# Requirements:
# - Graphite CLI (gt): https://graphite.dev/
# - Worktrunk CLI (wt): https://worktrunk.dev/
#
# Usage: gt-wt-create <branchName>
#
# Development Workflow:
# 1. Run this function to create and switch to a new worktree branch
# 2. Use `gt modify` to make your initial changes (not `gt create`, branch is already checked out)
# 3. Use normal gt operations for submitting and stacking (`gt submit`, `gt create` for stacks, etc.)
#
# When done with a stack:
# 1. Run `gt sync`
# 2. Do NOT accept deleting your worktree branches when prompted
# 3. Checkout your worktree branch and rebase it to main
# 4. Proceed with new work from there

gt-wt-create() {
    if [ -z "$1" ]; then
        echo "Usage: gt-wt-create <branchName>"
        return 1
    fi

    branchName="$1"

    git branch "$branchName"
    git switch "$branchName"
    gt track
    git switch main
    wt switch "$branchName"
}

```
