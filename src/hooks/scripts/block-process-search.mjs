// Brake A4 (AC-DEV-006.3): denies pkill/pgrep that search by the full text of
// the command line (-f, --full).
import { deny, readInput } from "./lib/hook.mjs";

const SEGMENT_SEPARATORS = /[;&|\n()`]/;
const FULL_LONG = ["--full", "--ful", "--fu", "--f"];
const SHORT_GROUP_WITH_F = /^-[A-Za-z0-9]*f[A-Za-z0-9]*$/;

const cleanWord = (word) => word.replace(/['"]/g, "").replace(/^\\/, "");

const searchesFullText = (command) => {
  for (const segment of command.split(SEGMENT_SEPARATORS)) {
    const words = segment.split(/\s+/).filter(Boolean).map(cleanWord);
    const isTool = (word) => ["pkill", "pgrep"].includes(word.split("/").at(-1));
    if (words.some(isTool)) {
      const others = words.filter((word) => !isTool(word));
      if (
        others.some(
          (word) => FULL_LONG.includes(word) || SHORT_GROUP_WITH_F.test(word)
        )
      ) {
        return true;
      }
    }
  }
  return false;
};

const data = await readInput();
if (data) {
  const command = data.tool_input?.command;
  if (typeof command === "string" && searchesFullText(command)) {
    deny(
      "A4",
      "pkill/pgrep with -f or --full matches the text of every command line, including this one, so it can kill your own command or a process you did not start. Rule A4 allows stopping only the processes you launched, by the PID or process group you saved."
    );
  }
}
