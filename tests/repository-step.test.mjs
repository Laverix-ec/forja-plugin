import assert from "node:assert/strict";
import { test } from "node:test";
import { read } from "./helpers.mjs";

const start = read("src/forja/guides/start.md");
const index = (text) => start.indexOf(text);
const s3 = start.slice(index("**S3**"), index("**S4**"));

test("S3 sits after S2 and before the step that lists skills", () => {
  assert.ok(index("**S2**") !== -1);
  assert.ok(index("**S3**") > index("**S2**"));
  assert.ok(index("**S3**") < index("list_skills"));
  assert.ok(index("**S4**") > index("**S3**"));
  assert.ok(index("**S3**") < index("**S5**"));
});

test("S3 names the comparison", () => {
  for (const text of [
    "git remote get-url origin",
    "repository",
    "null",
    ".git",
    "case",
    "https://",
    "git@github.com:",
  ]) {
    assert.ok(s3.includes(text), text);
  }
});

test("S3 forbids taking the Work Order and skips without repository", () => {
  assert.match(s3, /do not call `claim_work_order`/);
  assert.match(s3, /\*\*stop\*\*/);
  assert.ok(s3.includes("[SKIP] no repository"));
});

test("S3 deletes the checklist folder whenever it stops", () => {
  const deletes = s3.match(/delete the `\.forja\/WO-N\/`/gi) ?? [];
  assert.equal(deletes.length, 2);
});

test("the checklist has the S3 line naming the repository", () => {
  assert.match(read("src/forja/templates/checklist.md"), /- \[ \] S3 .*repository/);
});
