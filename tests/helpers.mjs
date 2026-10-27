import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));

export const read = (path) => readFileSync(join(root, path), "utf8");

export const listFiles = (directory) => {
  const base = join(root, directory);
  const files = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else {
        files.push(relative(base, full));
      }
    }
  };
  walk(base);
  return files.sort();
};

export const GUIDES = ["start", "execute", "verify", "integrate", "report"];
