# Changelog

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
