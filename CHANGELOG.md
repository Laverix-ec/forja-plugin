# Changelog

## 0.3.0

- Guide `safety` (new): rules that apply at every step: do not read secrets
  files, do not get around a block, add files to a commit by exact path, stop
  only your own processes (Forja WO-300).
- Guide `verify` V7: run again the tests of what changed after the complete
  verification and say so in the delivery report.
- Guide `execute` E5: in a Fix, the first commit is the test that fails.
- Claude Code brakes (hooks/PreToolUse): deny reading secrets files with Read,
  Grep, Glob and shell commands, and pkill/pgrep with -f (Forja WO-302).
- Shell brake: a word ending in the key-file suffix is denied only if it has a
  path, starts with ~ or is a file in the working directory, so code such as
  event.key passes (Forja WO-343).

## 0.2.0

- Guide `start`: before taking a Work Order, compare its `repository` with the
  `origin` of the checkout; if they differ, do not take it and tell the
  developer where it goes (Forja WO-140). A Work Order without `repository`
  goes on as before.

## 0.1.1

- Guide `start`: a skill listed with `triggerDescription: null` (no "Use when"
  section in its current version, Forja WO-136) is read to decide whether it
  applies.

## 0.1.0

- First version: router skill `forja`, guides `start`, `execute`, `verify`,
  `integrate` and `report`, and the checklist.
- Manifests for Claude Code, Cursor and Codex generated from one source;
  Antigravity reads the same `skills/forja` folder.
- CI that validates manifests, links and traceability to the criteria.
- MIT license.
