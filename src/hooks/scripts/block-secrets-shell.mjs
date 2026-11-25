// Brake A1 (AC-DEV-006.2): denies a shell command that names a secrets file.
import { deny, readInput } from "./lib/hook.mjs";
import { commandNamesSecret } from "./lib/secrets.mjs";

const data = await readInput();
if (data) {
  const command = data.tool_input?.command;
  const name = commandNamesSecret(command, data.cwd);
  if (name) {
    deny("A1", `this command names a secrets file (${name}).`);
  }
}
