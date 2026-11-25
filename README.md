# Forja plugin

The Forja method for the coding agents of developers. It gives your agent one
way to start, execute, verify, integrate and report a Forja Work Order through
the Forja MCP server: a router skill (`forja`), six guides (five for the steps of a Work Order and one with
safety rules) and a checklist.

The plugin does not carry the rules of your Project (Git, linter, commands,
language). Those come from the Project's skills in Forja, which the agent reads
with `read_skill`, so a change in Forja applies on the next read without
reinstalling anything.

## Requirements

Connect the Forja MCP server of your Project first (Forja shows how in Work
Orders, "MCP"). The plugin needs these 13 tools and stops if one is missing:
`get_work_order`, `claim_work_order`, `release_work_order`, `record_test_run`,
`create_evidence_upload`, `deliver_work_order`, `list_findings`,
`report_finding`, `link_pull_request`, `comment_work_order`, `list_skills`,
`read_skill` and `search_project`.

## Install

Claude Code:

```
/plugin marketplace add Laverix-ec/forja-plugin
/plugin install forja@forja-plugin
```

or with the skills CLI (Node 22.20 or later):

```
npx skills add Laverix-ec/forja-plugin --skill forja -a claude-code
```

Cursor (no marketplace yet):

```
npx skills add Laverix-ec/forja-plugin --skill forja -a cursor
```

or copy this repository to `~/.cursor/plugins/local/forja` and reload the window.

Codex:

```
codex plugin marketplace add Laverix-ec/forja-plugin
```

then install `forja` from the Plugins Directory. Or with the skills CLI:

```
npx skills add Laverix-ec/forja-plugin --skill forja -a codex
```

Antigravity (no plugin system; it reads skills):

```
npx skills add Laverix-ec/forja-plugin --skill forja -a antigravity
```

or copy `skills/forja` to `.agents/skills/forja` of your project.

## Brakes (Claude Code only)

Rules written in a guide depend on the agent obeying them. In Claude Code the
plugin also ships brakes (`PreToolUse` hooks) that deny the action before it
runs. A denied action returns the rule that applied and tells the agent to stop
and tell you what was blocked.

| Brake | What it denies | Rule |
|---|---|---|
| Secrets, file tools | `Read`, `Grep` and `Glob` on a secrets file (by path, or by a glob that names one) | A1 |
| Secrets, shell | a `Bash` or `PowerShell` command that has a secrets file name in it | A1 |
| Process search | `pkill` or `pgrep` with `-f` or `--full` (also grouped, as in `-fa`) | A4 |

Secrets files are `.env` and `.env.*` (except `.env.example`, `.env.sample` and
`.env.template`), `id_rsa*`, `id_ed25519*`, `id_ecdsa*`, `*.pem`, `*.key`,
`*.p12`, `*.pfx`, `.npmrc`, `.netrc`, `.pypirc`, `*.tfvars`, `*.tfvars.json`,
`*.tfstate`, `*.tfstate.backup` and `credentials.json`, in any directory and in
any case. The list lives in `src/hooks/scripts/lib/secrets.mjs` and copies the
one in Forja: if it changes there, update it by hand.

Know what they are:

- **They exist only if you install the plugin from the Claude Code marketplace**
  (`/plugin marketplace add`). `npx skills add` copies the skill only, and the
  other tools keep the written rule only.
- **They need Node on the `PATH`.** If it is missing, Claude Code shows a hook
  error and lets the action go on: the brake does not act.
- **They block more than they need, on purpose.** A command that only mentions a
  secrets file name is denied too, for example `grep -n ".env" README.md`. The
  one exception is `*.key`, which is also the end of common code: in a shell
  command, a word ending in `.key` counts as a key file only if it has a path
  (`certs/server.key`), starts with `~` or is a file that exists in the working
  directory. So code such as `event.key` or `dataset.key`, and a Next dynamic
  segment such as `app/[...key]/route.ts`, pass. The working directory is the
  one before the command runs: a `cd` inside the same command is not followed
  (`cd keys && cat server.key` passes; `cd keys && cat ./server.key` is denied
  by its path).
- **They are a barrier, not a wall.** They do not see what a script builds
  (`python -c`), a variable, a path built on the fly, a pipe such as
  `ps | grep | kill` (rule A4 forbids it, but no brake checks it), or a search of
  a whole directory that never names the file.
- Whether the brakes still deny in the mode that skips permissions was not
  verified. Do not rely on them there; use the `deny` rules below, which
  Claude Code applies in every mode.

For a stronger guarantee, put deny rules in your own settings
(`~/.claude/settings.json` or `.claude/settings.json`). A plugin cannot impose
them. A `Read` rule also blocks `Edit` and `Write` on that path, and applies to
the shell commands Claude Code recognizes (`cat`, `head`, `tail`, `sed`, `tee`,
redirections), but not to a script that opens the file by itself:

```json
{
  "permissions": {
    "deny": [
      "Read(.env)", "Read(.env.*)", "Read(!.env.example)", "Read(!.env.sample)", "Read(!.env.template)",
      "Read(*.pem)", "Read(*.key)", "Read(id_rsa*)", "Read(id_ed25519*)", "Read(.netrc)"
    ]
  }
}
```

## Contribute

Edit only `src/forja/`, `src/hooks/`, `plugin.config.json` and `package.json`
(the only place of the version). Then run `npm run build` and `npm test`, and
commit the generated files (`skills/`, `hooks/`, `scripts/`, `.claude-plugin/`,
`.cursor-plugin/`, `.codex-plugin/`, `.agents/`). CI fails if they are not up to
date.

## License

MIT. See [LICENSE](LICENSE).
