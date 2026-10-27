// Generates skills/forja/ and the manifests from src/forja/,
// plugin.config.json and package.json. Nobody edits the output by hand.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const fail = (message) => {
  throw new Error(`build: ${message}`);
};

const readJson = (path) => {
  if (!existsSync(path)) {
    fail(`missing file ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
};

const writeJson = (root, relativePath, value) => {
  const target = join(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};

export const build = (root) => {
  const source = join(root, "src", "forja");
  for (const file of [
    "SKILL.md",
    "required-tools.json",
    join("templates", "checklist.md"),
  ]) {
    if (!existsSync(join(source, file))) {
      fail(`missing source file src/forja/${file}`);
    }
  }
  const config = readJson(join(root, "plugin.config.json"));
  const { version } = readJson(join(root, "package.json"));
  if (typeof version !== "string" || !SEMVER.test(version)) {
    fail(`version "${version}" of package.json is not SemVer`);
  }
  const tools = readJson(join(source, "required-tools.json"));

  const output = join(root, "skills", config.name);
  rmSync(join(root, "skills"), { force: true, recursive: true });
  cpSync(source, output, { recursive: true });
  writeJson(root, join("skills", config.name, "required-tools.json"), {
    version,
    tools: tools.tools,
  });

  const author = { name: config.author };
  const license = config.license ? { license: config.license } : {};

  writeJson(root, join(".claude-plugin", "plugin.json"), {
    name: config.name,
    version,
    description: config.description,
    author,
    repository: config.repository,
    ...license,
    keywords: config.keywords,
  });
  writeJson(root, join(".claude-plugin", "marketplace.json"), {
    name: config.marketplace,
    owner: author,
    description: config.description,
    plugins: [
      { name: config.name, source: ".", description: config.description },
    ],
  });
  writeJson(root, join(".cursor-plugin", "plugin.json"), {
    name: config.name,
    description: config.description,
    version,
    author,
  });
  writeJson(root, join(".codex-plugin", "plugin.json"), {
    name: config.name,
    version,
    description: config.description,
    skills: "./skills/",
  });
  writeJson(root, join(".agents", "plugins", "marketplace.json"), {
    name: config.marketplace,
    interface: { displayName: "Forja" },
    plugins: [
      {
        name: config.name,
        source: { source: "local", path: "./" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Developer Tools",
      },
    ],
  });
};

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  build(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
}
