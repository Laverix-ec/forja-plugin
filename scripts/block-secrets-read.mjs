// Brake A1 (AC-DEV-006.1): denies Read, Grep and Glob calls that point to a
// secrets file.
import { deny, readInput } from "./lib/hook.mjs";
import { pathNamesSecret, patternNamesSecret } from "./lib/secrets.mjs";

const findSecret = (toolName, input) => {
  switch (toolName) {
    case "Read":
      return pathNamesSecret(input.file_path);
    case "Grep":
      return pathNamesSecret(input.path) ?? patternNamesSecret(input.glob);
    case "Glob":
      return patternNamesSecret(input.pattern) ?? pathNamesSecret(input.path);
    default:
      return null;
  }
};

const data = await readInput();
if (data) {
  const input = data.tool_input !== null && typeof data.tool_input === "object" ? data.tool_input : {};
  const name = findSecret(data.tool_name, input);
  if (name) {
    deny("A1", `this call would read a secrets file (${name}).`);
  }
}
