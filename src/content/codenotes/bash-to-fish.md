---
title: Bash to Fish (and back)
emoji: 🔁
tags:
  - cli
link: https://fishshell.com/docs/current/fish_for_bash_users.html
date: git Last Modified
---

Fish is not POSIX compatible. Bash snippets from the internet often fail in fish. Use these rules to translate them. See [Fish shell](/notes/fish-shell/) for setup.

Official guide: https://fishshell.com/docs/current/fish_for_bash_users.html

## Quick option: run it in Bash

No need to translate a one-off command:

```sh
bash -c 'some bash command'
```

## Bash to Fish

| Task                | Bash                        | Fish                              |
| ------------------- | --------------------------- | --------------------------------- |
| Set a variable      | `FOO=bar`                   | `set foo bar`                     |
| Export a variable   | `export FOO=bar`            | `set -gx FOO bar`                 |
| Unset a variable    | `unset FOO`                 | `set -e FOO`                      |
| Env for one command | `FOO=bar cmd`               | `env FOO=bar cmd`                 |
| Command substitution | `$(cmd)`                   | `(cmd)` (also `$(cmd)` in fish 3.4+) |
| Last exit code      | `$?`                        | `$status`                         |
| All arguments       | `$@`                        | `$argv`                           |
| First argument      | `$1`                        | `$argv[1]`                        |
| Chain on success    | `a && b`                    | `a; and b` (`a && b` works in 3.0+) |
| Chain on failure    | `a \|\| b`                  | `a; or b` (`a \|\| b` works in 3.0+) |
| Negate              | `! cmd`                     | `not cmd` (`! cmd` works too)     |
| Redirect both       | `cmd &> file`               | `cmd &> file` or `cmd > file 2>&1` |
| Process substitution | `<(cmd)`                   | `(cmd \| psub)`                   |
| Source a file       | `source file`               | `source file` (only for fish code) |
| Alias               | `alias gs='git status'`     | `abbr -a gs git status`           |
| Run last command    | `!!`                        | no `!!`, press `↑` or use `abbr`  |
| Home directory      | `~`                         | `~` (same)                        |

### Rules

- **Variables have no `=`.** Use `set name value`.
- **Scope flags matter.** `-l` local, `-g` global, `-x` export, `-U` universal (saved across sessions).
- **Lists are native.** `set fruits apple pear` makes a list. Read with `$fruits[1]`. Fish counts from 1, not 0.
- **`$PATH` is a list.** Use `fish_add_path /some/dir` and not `export PATH=...`.
- **No word splitting.** `$var` is never split on spaces, so quotes are rarely needed around variables.
- **No `export` keyword.** Use `set -gx`.
- **Blocks end with `end`.** No `then`, `fi`, `do`, `done` or `esac`.
- **No heredocs.** Use `printf` or `echo` with `\n`, or pipe from `string`.
- **No `$((...))` maths.** Use `math 1 + 2`.
- **No `${var:-default}` or `${var%suffix}`.** Use `string replace`, `string match`, `string sub`, or `set -q`.
- **No `${var}`.** Write `$var`. To join text right after it, write `{$var}text`.
- **Globs that match nothing are an error** in fish, not passed through.
- **Quotes:** single quotes are literal. Double quotes expand variables but not `$(...)` before fish 3.4.

### Syntax side by side

If / else:

```sh
# bash
if [ -f file ]; then
  echo yes
else
  echo no
fi
```

```fish
# fish
if test -f file
    echo yes
else
    echo no
end
```

For loop:

```sh
# bash
for f in *.md; do
  echo "$f"
done
```

```fish
# fish
for f in *.md
    echo $f
end
```

While loop:

```sh
# bash
while read -r line; do
  echo "$line"
done < file
```

```fish
# fish
while read -l line
    echo $line
end < file
```

Function:

```sh
# bash
greet() {
  echo "hi $1"
}
```

```fish
# fish
function greet
    echo "hi $argv[1]"
end
```

Case:

```sh
# bash
case "$x" in
  a) echo A ;;
  *) echo other ;;
esac
```

```fish
# fish
switch $x
    case a
        echo A
    case '*'
        echo other
end
```

Check a variable is set:

```sh
# bash
[ -n "$FOO" ]
```

```fish
# fish
set -q FOO
test -n "$FOO"
```

String work:

```fish
string replace foo bar $str
string match -r '^v(\d+)' $str
string split , $str
string join , $list
string upper $str
```

## Fish to Bash

| Task              | Fish                | Bash                      |
| ----------------- | ------------------- | ------------------------- |
| Set a variable    | `set foo bar`       | `foo=bar`                 |
| Export a variable | `set -gx FOO bar`   | `export FOO=bar`          |
| Unset a variable  | `set -e FOO`        | `unset FOO`               |
| Command substitution | `(cmd)`          | `$(cmd)`                  |
| Last exit code    | `$status`           | `$?`                      |
| All arguments     | `$argv`             | `"$@"`                    |
| First argument    | `$argv[1]`          | `$1`                      |
| Chain on success  | `a; and b`          | `a && b`                  |
| Chain on failure  | `a; or b`           | `a \|\| b`                |
| Negate            | `not cmd`           | `! cmd`                   |
| Maths             | `math 1 + 2`        | `$((1 + 2))`              |
| Add to PATH       | `fish_add_path /x`  | `export PATH="/x:$PATH"`  |
| Abbreviation      | `abbr -a gs git status` | `alias gs='git status'` |
| Process substitution | `(cmd \| psub)`  | `<(cmd)`                  |
| Check var is set  | `set -q FOO`        | `[ -n "${FOO+x}" ]`       |

### Rules

- **Add `=` and drop `set`.** `set foo bar` becomes `foo=bar`. No spaces around `=`.
- **Lists become arrays.** `set l a b c` becomes `l=(a b c)`. Read with `${l[0]}` (Bash counts from 0) or `"${l[@]}"` for all.
- **Quote variables.** Bash splits unquoted variables on spaces. Write `"$var"`.
- **Close blocks the Bash way.** `end` becomes `fi`, `done` or `esac`. Add `then` after `if` and `do` after `for` or `while`.
- **`test` becomes `[ ]` or `[[ ]]`.** `test -f x` becomes `[ -f x ]`.
- **`string` has no Bash twin.** Use parameter expansion (`${var//foo/bar}`), `sed`, `tr` or `cut`.
- **`switch` / `case` become `case ... esac`** with `;;` after each branch and `*)` as the default.
- **`function name` becomes `name() { ...; }`.**
- **`$status` after a pipe** becomes `${PIPESTATUS[@]}` in Bash.
- **Fish has no `export -f`.** Bash functions can be exported, fish functions cannot.

## Tips

- Never `source` a bash script in fish. It fails, or worse, half-works. Run it with `bash script.sh`.
- For tools that write shell setup code (`nvm`, `conda`, `pyenv`, `direnv`), look for a `fish` option or a fish plugin. Most have one.
- To use a bash-only environment script, try [`bass`](https://github.com/edc/bass): `bass source ~/.nvm/nvm.sh`.
- Write fish scripts with `#!/usr/bin/env fish`. Write portable scripts with `#!/usr/bin/env bash`.
