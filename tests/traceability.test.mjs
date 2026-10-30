import assert from "node:assert/strict";
import { test } from "node:test";
import { GUIDES, read } from "./helpers.mjs";

const CRITERIA = {
  start: ["002.1", "002.2", "002.3", "002.4", "002.5", "002.6", "002.7"],
  execute: ["003.1", "003.2"],
  verify: ["003.3", "003.4"],
  integrate: ["004.1", "004.2", "004.3", "004.4"],
  report: ["004.5"],
};
const STEPS = { start: "S", execute: "E", verify: "V", integrate: "I", report: "R" };

const files = ["SKILL", "templates/checklist", ...GUIDES.map((g) => `guides/${g}`)];

test("each of the 16 criteria has its marker in its guide and only there", () => {
  let total = 0;
  for (const [guide, ids] of Object.entries(CRITERIA)) {
    for (const id of ids) {
      total += 1;
      const marker = `<!-- AC-DEV-${id} -->`;
      for (const file of files) {
        const has = read(`src/forja/${file}.md`).includes(marker);
        assert.equal(has, file === `guides/${guide}`, `${marker} in ${file}`);
      }
    }
  }
  assert.equal(total, 16);
});

test("each checklist step is in its guide and in the template", () => {
  const template = read("src/forja/templates/checklist.md");
  for (const guide of GUIDES) {
    const text = read(`src/forja/guides/${guide}.md`);
    const ids = [...text.matchAll(new RegExp(`\\*\\*(${STEPS[guide]}\\d)\\*\\*`, "g"))].map(
      (m) => m[1]
    );
    assert.ok(ids.length > 0, guide);
    for (const id of ids) {
      assert.match(template, new RegExp(`\\] ${id} `), `${id} not in template`);
    }
  }
  const templateIds = [...template.matchAll(/\] ([SEVIR]\d) /g)].length;
  assert.equal(templateIds, 28);
});

test("guides are in English", () => {
  for (const file of files) {
    assert.doesNotMatch(read(`src/forja/${file}.md`), /[áéíóúñ¿¡]/i, file);
  }
});
