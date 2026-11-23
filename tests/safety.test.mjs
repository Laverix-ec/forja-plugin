import assert from "node:assert/strict";
import { test } from "node:test";
import { read } from "./helpers.mjs";

const safety = read("src/forja/guides/safety.md");
const verify = read("src/forja/guides/verify.md");
const execute = read("src/forja/guides/execute.md");
const skill = read("src/forja/SKILL.md");
const checklist = read("src/forja/templates/checklist.md");

const between = (text, from, to) => {
  const start = text.indexOf(from);
  assert.ok(start !== -1, from);
  const end = to ? text.indexOf(to, start) : text.length;
  assert.ok(end !== -1, to);
  return text.slice(start, end).replace(/\s+/g, " ");
};

const a1 = between(safety, "**A1**", "**A2**");
const a2 = between(safety, "**A2**", "**A3**");
const a3 = between(safety, "**A3**", "**A4**");
const a4 = between(safety, "**A4**");
const v7 = between(verify, "**V7**");
const e5 = between(execute, "**E5**");

const includesAll = (text, expressions) => {
  for (const expression of expressions) {
    assert.ok(text.includes(expression), expression);
  }
};

test("the router links the safety guide in the rules that always apply", () => {
  const heading = skill.indexOf("## Rules that always apply");
  assert.ok(heading !== -1);
  const rules = skill.slice(heading);
  assert.ok(rules.includes("](guides/safety.md)"));
  assert.ok(rules.includes("Before step S1"));
});

test("A1 names the tools, the secrets files and the allowed examples", () => {
  includesAll(a1, [
    "`cat`",
    "`grep`",
    "`sed`",
    "`head`",
    "`wc`",
    "editor",
    "file search",
    "names of its variables",
    "`.env`",
    "`.env.*`",
    "`*.pem`",
    "`id_rsa*`",
    "`.netrc`",
    "`*.tfstate`",
    "`credentials.json`",
    "You may read `.env.example`",
    "what the contract says is",
    "ask the developer",
  ]);
});

test("A2 stops, waits and forbids getting around the block", () => {
  includesAll(a2, ["**stop**", "wait for their decision", "another command", "permissions"]);
});

test("A3 forbids adding directories and asks to check the staged files", () => {
  includesAll(a3, ["git add <path>", "git add .", "git add -A", "git diff --cached --name-only"]);
});

test("A4 forbids finding processes by their own text", () => {
  includesAll(a4, ["pkill -f", "pgrep -f", "ps | grep | kill", "process id", "process group"]);
});

test("V7 asks to run again the affected tests and to say it", () => {
  includesAll(v7, ["run again the tests", "delivery report", "V2"]);
});

test("E5 puts the failing test first in a Fix", () => {
  includesAll(e5, ["`fix`", "first commit", "fails", "get_work_order"]);
});

test("the checklist has E5 and V7 and no safety rule", () => {
  assert.match(checklist, /- \[ \] E5 /);
  assert.match(checklist, /- \[ \] V7 /);
  assert.doesNotMatch(checklist, /^- \[ \] A[1-4] /m);
});

test("the safety guide names no Forja tool", () => {
  assert.doesNotMatch(safety, /`[a-z]+(_[a-z]+)+`/);
});
