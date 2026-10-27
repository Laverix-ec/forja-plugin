import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { GUIDES, listFiles, read, root } from "./helpers.mjs";

const LINK = /\]\(([^)]+)\)/g;

test("every relative link of src/forja resolves", () => {
  for (const file of listFiles("src/forja").filter((f) => f.endsWith(".md"))) {
    for (const [, target] of read(`src/forja/${file}`).matchAll(LINK)) {
      if (/^[a-z]+:/.test(target) || target.startsWith("#")) {
        continue;
      }
      const path = target.split("#")[0];
      assert.ok(
        existsSync(join(root, "src/forja", dirname(file), path)),
        `${file} links to a missing ${target}`
      );
    }
  }
});

test("SKILL.md links every guide and no missing one", () => {
  const skill = read("src/forja/SKILL.md");
  for (const guide of GUIDES) {
    assert.ok(skill.includes(`](guides/${guide}.md)`), `${guide} not linked`);
  }
  for (const [, target] of skill.matchAll(LINK)) {
    assert.ok(existsSync(join(root, "src/forja", target)), target);
  }
});
