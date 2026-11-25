// What a secrets file is. One list, one core: both secrets brakes use it.
// It mirrors the list of the Forja product (the safety rule A1 of the guide
// safety.md). If that list changes in Forja, update this one by hand.
import { realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";

const PREFIXES = [".env", "id_rsa", "id_ed25519", "id_ecdsa"];
const NAMES = [".npmrc", ".netrc", ".pypirc", "credentials.json"];
// The key-file suffix is kept apart from the other suffixes: in a shell
// command it is also the end of common code (a property called key), so the
// shell brake only counts it when the word looks like a file.
const KEY_SUFFIX = ".key";
const SUFFIXES = [
  ".pem",
  ".p12",
  ".pfx",
  ".tfvars",
  ".tfvars.json",
  ".tfstate",
  ".tfstate.backup",
];
const READABLE = [".env.example", ".env.sample", ".env.template"];

// Compares the file name (any directory, any case). The key-file suffix counts
// unless includeKeySuffix is false (the shell brake checks it on its own).
export const isSecretName = (name, { includeKeySuffix = true } = {}) => {
  const lower = String(name).toLowerCase();
  if (READABLE.includes(lower)) {
    return false;
  }
  return (
    PREFIXES.some((prefix) => lower.startsWith(prefix)) ||
    NAMES.includes(lower) ||
    SUFFIXES.some((suffix) => lower.endsWith(suffix)) ||
    (includeKeySuffix && lower.endsWith(KEY_SUFFIX))
  );
};

const lastSegment = (path) => {
  const parts = String(path).split(/[/\\]/).filter(Boolean);
  return parts.length > 0 ? parts.at(-1) : "";
};

// Returns the name of the secrets file a path points to, or null. It checks
// the name as given and, if the file exists, the name of its real path (a
// symbolic link to a secrets file is denied).
export const pathNamesSecret = (path) => {
  if (typeof path !== "string" || path === "") {
    return null;
  }
  const given = lastSegment(path);
  if (isSecretName(given)) {
    return given;
  }
  try {
    const real = lastSegment(realpathSync(path));
    if (isSecretName(real)) {
      return real;
    }
  } catch {
    // The file does not exist or cannot be resolved: only the given name counts.
  }
  return null;
};

// Returns the name a glob pattern names (the family, as in `.env*`), or null.
export const patternNamesSecret = (pattern) => {
  if (typeof pattern !== "string" || pattern === "") {
    return null;
  }
  for (const segment of pattern.split(/[/\\{},]/)) {
    const lower = segment.toLowerCase();
    if (
      isSecretName(segment) ||
      PREFIXES.some((prefix) => lower.startsWith(prefix))
    ) {
      return segment;
    }
  }
  return null;
};

// A word of a command that ends in the key-file suffix is a key file only if
// it looks like a file: it has a path, starts with ~ or is a file that exists
// in the working directory. Otherwise it is code or text (event.key).
const isKeyFileWord = (word, cwd) => {
  if (!word.toLowerCase().endsWith(KEY_SUFFIX)) {
    return false;
  }
  if (word.includes("/") || word.includes("\\") || word.startsWith("~")) {
    return true;
  }
  try {
    return statSync(resolve(cwd, word)).isFile();
  } catch {
    // It does not exist (or cannot be read): it is not a file here.
    return false;
  }
};

// Returns the name of the first secrets file a shell command names, or null.
// The shell is not interpreted: a name quoted in a text counts. Two passes:
// the first splits paths into segments and checks the whole list except the
// key-file suffix; the second keeps paths (and Next dynamic segments such as
// [key]) inside the word and checks only the key-file suffix, against the
// working directory of the command (cwd, or the one of this process).
export const commandNamesSecret = (command, cwd) => {
  if (typeof command !== "string") {
    return null;
  }
  const words = command.split(/[\s'"`;&|<>()$=,:{}[\]/\\]+/);
  const named = words.find(
    (word) => word !== "" && isSecretName(word, { includeKeySuffix: false })
  );
  if (named) {
    return named;
  }
  const directory =
    typeof cwd === "string" && cwd !== "" ? cwd : process.cwd();
  const keyWord = command
    .split(/[\s'"`;&|<>()$=,:{}]+/)
    .find((word) => word !== "" && isKeyFileWord(word, directory));
  return keyWord ? lastSegment(keyWord) : null;
};
