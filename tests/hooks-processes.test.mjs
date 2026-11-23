import { test } from "node:test";
import { assertAllowed, assertDenied } from "./hook-assert.mjs";
import { runHook } from "./helpers.mjs";

const SCRIPT = "block-process-search.mjs";

test("pkill and pgrep with -f or --full are denied (AC-DEV-006.3)", () => {
  const denied = [
    "pkill -f x",
    "pgrep --full x",
    "pkill -fa x",
    "pkill -9f x",
    "sudo pkill -f x",
    "/usr/bin/pkill --full x",
    "ps aux | pkill -f x",
    "echo $(pgrep -f x)",
    "cd /tmp && pkill -f x",
  ];
  for (const tool of ["Bash", "PowerShell"]) {
    for (const command of denied) {
      assertDenied(runHook(SCRIPT, tool, { command }), "A4", `${tool}: ${command}`);
    }
  }
});

test("the other uses of pkill, pgrep and kill are allowed (AC-DEV-006.3)", () => {
  const allowed = [
    "pkill x",
    "pkill -x node",
    "pgrep -a x",
    "pgrep x",
    "kill 123",
    "killall x",
    "grep -f patrones.txt archivo",
  ];
  for (const command of allowed) {
    assertAllowed(runHook(SCRIPT, "Bash", { command }), command);
  }
  assertAllowed(runHook(SCRIPT, "Bash", {}), "no command");
});

test("the message gives the rule and does not echo the command (AC-DEV-006.5)", () => {
  const result = runHook(SCRIPT, "Bash", { command: "pkill -f unique-marker" });
  assertDenied(result, "A4", "message");
  if (result.stderr.includes("unique-marker")) {
    throw new Error("the message carries the whole command");
  }
});
