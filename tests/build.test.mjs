import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { build } from "../build/build.mjs";
import { listFiles, read, root } from "./helpers.mjs";

const GENERATED = [".claude-plugin", ".cursor-plugin", ".codex-plugin", ".agents", "skills"];

test("the build is deterministic and idempotent", () => {
  const copy = mkdtempSync(join(tmpdir(), "forja-plugin-"));
  try {
    for (const entry of ["src", "plugin.config.json", "package.json"]) {
      cpSync(join(root, entry), join(copy, entry), { recursive: true });
    }
    const committed = GENERATED.flatMap((dir) =>
      listFiles(dir).map((file) => `${dir}/${file}`)
    );
    assert.ok(committed.length > 0);
    // Two runs in a row leave the same bytes, equal to the committed output.
    for (let run = 0; run < 2; run += 1) {
      build(copy);
      for (const file of committed) {
        assert.equal(
          readFileSync(join(copy, file), "utf8"),
          read(file),
          `${file} differs after run ${run + 1}`
        );
      }
    }
  } finally {
    rmSync(copy, { force: true, recursive: true });
  }
});
