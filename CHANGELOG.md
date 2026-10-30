# Changelog

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
