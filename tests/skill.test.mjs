import assert from "node:assert/strict";
import { test } from "node:test";
import { listFiles, read, readJson } from "./helpers.mjs";

test("SKILL.md has only name and description in its frontmatter", () => {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(read("src/forja/SKILL.md"));
  assert.ok(match, "frontmatter missing");
  const lines = match[1].split("\n");
  assert.equal(lines.length, 2);
  const name = /^name: (.+)$/.exec(lines[0]);
  const description = /^description: (.+)$/.exec(lines[1]);
  assert.ok(name && description);
  assert.equal(name[1], "forja");
  assert.ok(name[1].length <= 64 && /^[a-z-]+$/.test(name[1]));
  assert.ok(description[1].length >= 1 && description[1].length <= 1024);
});

test("skills/forja is an exact copy of src/forja plus the versioned tools", () => {
  const source = listFiles("src/forja");
  const output = listFiles("skills/forja");
  assert.deepEqual(output, source);
  for (const file of source) {
    if (file === "required-tools.json") {
      continue;
    }
    assert.equal(read(`skills/forja/${file}`), read(`src/forja/${file}`), file);
  }
  const tools = readJson("skills/forja/required-tools.json");
  assert.equal(tools.version, readJson("package.json").version);
  assert.deepEqual(tools.tools, readJson("src/forja/required-tools.json").tools);
});
