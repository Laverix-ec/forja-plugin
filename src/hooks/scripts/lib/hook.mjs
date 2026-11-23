// Shared plumbing of the Forja brakes (PreToolUse hooks of Claude Code).
// Reads the hook input from stdin and denies a tool call with exit code 2.
// No dependencies: only node: modules available since Node 18.

// Reads all of stdin and parses it as a JSON object.
// On unreadable input it writes to stderr and sets exit code 1 (an error that
// does not block, but is visible) and returns null.
export const readInput = async () => {
  let text = "";
  try {
    process.stdin.setEncoding("utf8");
    for await (const chunk of process.stdin) {
      text += chunk;
    }
    const parsed = JSON.parse(text);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed;
  } catch {
    process.stderr.write("forja-plugin hook: unreadable input\n");
    process.exitCode = 1;
    return null;
  }
};

// Denies the tool call: the message goes to stderr and the exit code is 2.
// The message never carries file content or the whole command, and it does not
// suggest an alternative that would get around the rule.
export const deny = (rule, reason) => {
  process.stderr.write(
    `Blocked by the Forja plugin (rule ${rule}): ${reason} ` +
      "Stop and tell the developer what was blocked; do not retry it with another " +
      "command or another tool. This check blocks more than it strictly needs on " +
      "purpose: it can also block a command that only mentions the name. " +
      "The rule is written in the Forja guide safety.md.\n"
  );
  process.exitCode = 2;
};
