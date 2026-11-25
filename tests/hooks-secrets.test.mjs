import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { assertAllowed, assertDenied } from "./hook-assert.mjs";
import { root, runHook } from "./helpers.mjs";

const READ = "block-secrets-read.mjs";
const SHELL = "block-secrets-shell.mjs";

test("Read denies secrets files and allows the others (AC-DEV-006.1)", () => {
  const denied = [
    "/r/.env",
    "/r/.env.local",
    "/r/.ENV",
    "/r/keys/id_rsa",
    "/r/ssl/server.pem",
    "/r/a/.netrc",
    "/r/.envrc",
    "/r/.npmrc",
    "/r/a/prod.tfvars",
    "/r/terraform.tfstate.backup",
    "/r/id_ecdsa",
    "/r/keys/cert.p12",
    "C:\\proj\\.env",
    "/r/certs/server.key",
    "/r/keys/dataset.key",
  ];
  for (const file of denied) {
    assertDenied(runHook(READ, "Read", { file_path: file }), "A1", file);
  }
  const allowed = [
    "/r/.env.example",
    "/r/.env.sample",
    "/r/.env.template",
    "/r/src/app.ts",
  ];
  for (const file of allowed) {
    assertAllowed(runHook(READ, "Read", { file_path: file }), file);
  }
});

test("Grep denies a secrets path or glob (AC-DEV-006.1)", () => {
  const denied = [
    { pattern: "X", path: "/r/.env" },
    { pattern: "X", glob: ".env*" },
    { pattern: "X", glob: "**/.env*" },
    { pattern: "X", glob: "*.pem" },
    { pattern: "X", path: "/r", glob: "{a,.env.local}" },
  ];
  for (const input of denied) {
    assertDenied(runHook(READ, "Grep", input), "A1", JSON.stringify(input));
  }
  const allowed = [
    { pattern: "X", glob: "**/*.ts", path: "/r/src" },
    { pattern: "X" },
    { pattern: ".env", path: "/r/README.md" },
  ];
  for (const input of allowed) {
    assertAllowed(runHook(READ, "Grep", input), JSON.stringify(input));
  }
});

test("Glob denies a secrets pattern or path (AC-DEV-006.1)", () => {
  for (const input of [{ pattern: "**/.env*" }, { pattern: "*", path: "/r/.env" }]) {
    assertDenied(runHook(READ, "Glob", input), "A1", JSON.stringify(input));
  }
  assertAllowed(runHook(READ, "Glob", { pattern: "src/**/*.ts" }), "src glob");
});

test("a symbolic link to a secrets file is denied (AC-DEV-006.1)", () => {
  const directory = mkdtempSync(join(tmpdir(), "forja-hooks-"));
  try {
    writeFileSync(join(directory, ".env"), "");
    symlinkSync(join(directory, ".env"), join(directory, "link.txt"));
    assertDenied(
      runHook(READ, "Read", { file_path: join(directory, "link.txt") }),
      "A1",
      "symlink"
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("a tool that does not read is not touched (AC-DEV-006.1)", () => {
  assertAllowed(runHook(READ, "Edit", { file_path: "/r/.env" }), "Edit");
});

test("the shell brake denies a command that names a secrets file (AC-DEV-006.2)", () => {
  const denied = [
    "cat .env",
    "grep X .env.local",
    "sed -n 1p .env",
    "echo hola > .env",
    'cat "$(pwd)/.env"',
    "cat C:\\proj\\.env",
    'grep -n ".env" README.md',
    "cat deploy.pem",
    "cat id_rsa",
  ];
  for (const tool of ["Bash", "PowerShell"]) {
    for (const command of denied) {
      assertDenied(runHook(SHELL, tool, { command }), "A1", `${tool}: ${command}`);
    }
    for (const command of ["cat README.md", "cat .env.example", "ls -la"]) {
      assertAllowed(runHook(SHELL, tool, { command }), `${tool}: ${command}`);
    }
  }
  assertAllowed(runHook(SHELL, "Bash", {}), "no command");
  assertAllowed(runHook(SHELL, "Bash", { command: 5 }), "command that is not text");
});

test("the shell brake counts the key-file suffix only on a file (AC-DEV-006.2)", () => {
  const allowed = [
    'node -e "console.log(x.dataset.key)"',
    "node -e \"window.addEventListener('keydown', (event) => event.key)\"",
    "echo e.target.dataset.key",
    'echo "dice .key y nada más"',
    "cat server.key",
    "cat src/app/api/files/local/[...key]/route.ts",
    "ls app/[key]",
  ];
  const denied = [
    "cat certs/server.key",
    "cat ~/deploy.key",
    "cat ./server.key",
    "cat C:\\proj\\server.key",
    'cat "$(pwd)/server.key"',
  ];
  for (const tool of ["Bash", "PowerShell"]) {
    for (const command of allowed) {
      assertAllowed(runHook(SHELL, tool, { command }), `${tool}: ${command}`);
    }
    for (const command of denied) {
      assertDenied(runHook(SHELL, tool, { command }), "A1", `${tool}: ${command}`);
    }
  }
  const result = runHook(SHELL, "Bash", {
    command: "cat certs/server.key && echo unique-marker",
  });
  assertDenied(result, "A1", "key-file message");
  assert.match(result.stderr, /server\.key/);
  if (result.stderr.includes("unique-marker")) {
    throw new Error("the message carries the whole command");
  }
});

test("the shell brake denies a key file that exists in the working directory (AC-DEV-006.2)", () => {
  const directory = mkdtempSync(join(tmpdir(), "forja-hooks-"));
  try {
    writeFileSync(join(directory, "server.key"), "");
    mkdirSync(join(directory, "dir.key"));
    for (const tool of ["Bash", "PowerShell"]) {
      const result = runHook(SHELL, tool, { command: "cat server.key" }, directory);
      assertDenied(result, "A1", `${tool}: existing key file`);
      assert.match(result.stderr, /server\.key/);
      assertAllowed(
        runHook(SHELL, tool, { command: "cat server.key" }),
        `${tool}: key file in another working directory`
      );
      assertAllowed(
        runHook(SHELL, tool, { command: "ls dir.key" }, directory),
        `${tool}: a directory is not a key file`
      );
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("the shell brake uses the process directory when the input has no cwd (AC-DEV-006.2)", () => {
  const directory = mkdtempSync(join(tmpdir(), "forja-hooks-"));
  try {
    writeFileSync(join(directory, "server.key"), "");
    const result = spawnSync(
      process.execPath,
      [join(root, "src", "hooks", "scripts", SHELL)],
      {
        cwd: directory,
        encoding: "utf8",
        input: JSON.stringify({
          hook_event_name: "PreToolUse",
          tool_name: "Bash",
          tool_input: { command: "cat server.key" },
        }),
      }
    );
    assertDenied(result, "A1", "no cwd in the input");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("the shell brake allows Next dynamic segments, also when they exist (AC-DEV-006.2)", () => {
  const directory = mkdtempSync(join(tmpdir(), "forja-hooks-"));
  try {
    const route = join(directory, "src", "app", "api", "files", "local", "[...key]");
    mkdirSync(route, { recursive: true });
    writeFileSync(join(route, "route.ts"), "");
    mkdirSync(join(directory, "app", "[key]"), { recursive: true });
    for (const tool of ["Bash", "PowerShell"]) {
      for (const command of [
        "cat src/app/api/files/local/[...key]/route.ts",
        "ls app/[key]",
        "ls src/app/api/files/local/[...key]",
      ]) {
        assertAllowed(runHook(SHELL, tool, { command }, directory), `${tool}: ${command}`);
      }
      assertDenied(
        runHook(SHELL, tool, { command: "cat app/[id]/server.key" }, directory),
        "A1",
        `${tool}: key file inside a dynamic segment`
      );
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("the message names the file and never the whole command (AC-DEV-006.5)", () => {
  const result = runHook(SHELL, "Bash", { command: "cat .env && echo unique-marker" });
  assertDenied(result, "A1", "message");
  if (result.stderr.includes("unique-marker")) {
    throw new Error("the message carries the whole command");
  }
});

test("unreadable input exits 1, which does not block", () => {
  for (const script of [READ, SHELL, "block-process-search.mjs"]) {
    const result = spawnSync(
      process.execPath,
      [join(root, "src", "hooks", "scripts", script)],
      { encoding: "utf8", input: "not json" }
    );
    assert.equal(result.status, 1, script);
    assert.match(result.stderr, /unreadable input/, script);
  }
});
