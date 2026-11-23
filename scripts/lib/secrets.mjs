// What a secrets file is. One list, one core: both secrets brakes use it.
// It mirrors the list of the Forja product (the safety rule A1 of the guide
// safety.md). If that list changes in Forja, update this one by hand.
import { realpathSync } from "node:fs";

const PREFIXES = [".env", "id_rsa", "id_ed25519", "id_ecdsa"];
const NAMES = [".npmrc", ".netrc", ".pypirc", "credentials.json"];
const SUFFIXES = [
  ".pem",
  ".key",
  ".p12",
  ".pfx",
  ".tfvars",
  ".tfvars.json",
  ".tfstate",
  ".tfstate.backup",
];
const READABLE = [".env.example", ".env.sample", ".env.template"];

// Compares the file name (any directory, any case).
export const isSecretName = (name) => {
  const lower = String(name).toLowerCase();
  if (READABLE.includes(lower)) {
    return false;
  }
  return (
    PREFIXES.some((prefix) => lower.startsWith(prefix)) ||
    NAMES.includes(lower) ||
    SUFFIXES.some((suffix) => lower.endsWith(suffix))
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

// Returns the first word of a shell command that is the name of a secrets
// file, or null. The shell is not interpreted: a name quoted in a text counts.
export const commandNamesSecret = (command) => {
  if (typeof command !== "string") {
    return null;
  }
  const words = command.split(/[\s'"`;&|<>()$=,:{}[\]/\\]+/);
  return words.find((word) => word !== "" && isSecretName(word)) ?? null;
};
