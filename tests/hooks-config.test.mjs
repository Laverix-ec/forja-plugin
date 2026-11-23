import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readJson, root } from "./helpers.mjs";

test("src/hooks/hooks.json declares the two PreToolUse brakes", () => {
  const config = readJson("src/hooks/hooks.json");
  const entries = config.hooks.PreToolUse;
  assert.equal(entries.length, 2);
  assert.deepEqual(
    entries.map((entry) => entry.matcher),
    ["Read|Grep|Glob", "Bash|PowerShell"]
  );
  const command = /^node "\$\{CLAUDE_PLUGIN_ROOT\}\/scripts\/([a-z-]+\.mjs)"$/;
  for (const entry of entries) {
    assert.ok(entry.hooks.length > 0);
    for (const hook of entry.hooks) {
      assert.equal(hook.type, "command");
      const match = command.exec(hook.command);
      assert.ok(match, `unexpected command ${hook.command}`);
      assert.ok(
        existsSync(join(root, "src", "hooks", "scripts", match[1])),
        `missing script ${match[1]}`
      );
    }
  }
});

test("the Claude Code manifest does not declare hooks (hooks/hooks.json loads by itself)", () => {
  assert.equal("hooks" in readJson(".claude-plugin/plugin.json"), false);
});
