import assert from "node:assert/strict";
import { test } from "node:test";
import { GUIDES, read, readJson } from "./helpers.mjs";

// The 16 tools Forja registers: copy of KNOWN_TOOLS in
// src/app/api/mcp/execution-contract.test.ts of Forja.
const KNOWN_TOOLS = [
  "claim_work_order",
  "comment_work_order",
  "create_evidence_upload",
  "deliver_work_order",
  "get_work_order",
  "link_pull_request",
  "list_findings",
  "list_my_work_orders",
  "list_skills",
  "read_skill",
  "record_test_run",
  "release_work_order",
  "report_finding",
  "search_project",
  "set_work_order_status",
  "suggest_document_change",
];

const required = readJson("src/forja/required-tools.json").tools;
const texts = ["SKILL", ...GUIDES.map((g) => `guides/${g}`)].map((f) =>
  read(`src/forja/${f}.md`)
);
const guides = texts.slice(1);

test("required-tools.json has exactly the 13 tools", () => {
  assert.equal(required.length, 13);
  assert.equal(new Set(required).size, 13);
  for (const tool of required) {
    assert.ok(KNOWN_TOOLS.includes(tool), tool);
  }
});

test("tools named in backticks are in the required list", () => {
  for (const text of texts) {
    for (const [, name] of text.matchAll(/`([a-z]+(?:_[a-z]+)+)`/g)) {
      if (KNOWN_TOOLS.includes(name)) {
        assert.ok(required.includes(name), `${name} is not required`);
      }
    }
  }
});

test("record_verification is not used", () => {
  for (const text of texts) {
    assert.ok(!text.includes("record_verification"));
  }
});

test("every required tool is cited by a guide", () => {
  for (const tool of required) {
    assert.ok(
      guides.some((g) => g.includes(`\`${tool}\``)),
      `${tool} is not cited`
    );
  }
});
