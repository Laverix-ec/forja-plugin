// AC-DEV-001.1: valid manifests for Claude Code, Cursor and Codex.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readJson, root } from "./helpers.mjs";

// Keep in sync with PLUGIN_NAME / PLUGIN_MARKETPLACE of src/lib/mcp/plugin-install.ts in Forja.
const PLUGIN_NAME = "forja";
const PLUGIN_MARKETPLACE = "forja-plugin";

const { version } = readJson("package.json");
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const RESERVED = /^(claude|anthropic)(-|$)/;

const only = (value, allowed, label) => {
  for (const key of Object.keys(value)) {
    assert.ok(allowed.includes(key), `${label}: unexpected field ${key}`);
  }
};

test("Claude Code plugin manifest", () => {
  const manifest = readJson(".claude-plugin/plugin.json");
  only(
    manifest,
    ["name", "version", "description", "author", "repository", "license", "keywords"],
    "claude plugin.json"
  );
  assert.equal(manifest.name, PLUGIN_NAME);
  assert.equal(manifest.version, version);
  assert.ok(manifest.description);
});

test("Cursor plugin manifest", () => {
  const manifest = readJson(".cursor-plugin/plugin.json");
  only(manifest, ["name", "description", "version", "author"], "cursor plugin.json");
  assert.equal(manifest.name, PLUGIN_NAME);
  assert.equal(manifest.version, version);
});

test("Codex plugin manifest", () => {
  const manifest = readJson(".codex-plugin/plugin.json");
  only(manifest, ["name", "version", "description", "skills"], "codex plugin.json");
  assert.equal(manifest.name, PLUGIN_NAME);
  assert.equal(manifest.version, version);
  assert.ok(existsSync(join(root, manifest.skills)), "skills folder must exist");
});

test("names are kebab-case and not reserved", () => {
  for (const name of [PLUGIN_NAME, PLUGIN_MARKETPLACE]) {
    assert.match(name, KEBAB);
    assert.doesNotMatch(name, RESERVED);
  }
});

test("Claude Code marketplace", () => {
  const marketplace = readJson(".claude-plugin/marketplace.json");
  only(marketplace, ["name", "owner", "description", "plugins"], "claude marketplace.json");
  assert.equal(marketplace.name, PLUGIN_MARKETPLACE);
  assert.ok(marketplace.owner.name);
  assert.equal(marketplace.plugins.length, 1);
  const [entry] = marketplace.plugins;
  assert.equal(entry.name, PLUGIN_NAME);
  assert.ok(existsSync(join(root, entry.source, "skills", "forja", "SKILL.md")));
});

test("Codex marketplace", () => {
  const marketplace = readJson(".agents/plugins/marketplace.json");
  only(marketplace, ["name", "interface", "plugins"], "codex marketplace.json");
  assert.equal(marketplace.name, PLUGIN_MARKETPLACE);
  const [entry] = marketplace.plugins;
  assert.equal(entry.name, PLUGIN_NAME);
  assert.equal(entry.source.source, "local");
  assert.match(entry.source.path, /^\.\//);
  assert.ok(existsSync(join(root, entry.source.path, "skills", "forja", "SKILL.md")));
  assert.ok(entry.policy.installation);
  assert.ok(entry.policy.authentication);
  assert.ok(entry.category);
});
