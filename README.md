# Forja plugin

The Forja method for the coding agents of developers. It gives your agent one
way to start, execute, verify, integrate and report a Forja Work Order through
the Forja MCP server: a router skill (`forja`), five guides and a checklist.

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

## Contribute

Edit only `src/forja/`, `plugin.config.json` and `package.json` (the only place
of the version). Then run `npm run build` and `npm test`, and commit the
generated files (`skills/`, `.claude-plugin/`, `.cursor-plugin/`,
`.codex-plugin/`, `.agents/`). CI fails if they are not up to date.

## License

MIT. See [LICENSE](LICENSE).
