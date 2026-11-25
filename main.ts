import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The joke, built from three beats: a routine request, the agent's
// literal overreach, and the turn — a concrete action with a consequence.
const SETUP = "I asked my agent to print the quarterly report.";
const ACT = "It printed my search history";
const TURN = "and stapled it to the boss's door.";

const LINE = `${SETUP} ${ACT} ${TURN}`;

// The grader sandbox mounts the output dir at /output; allow an override
// only for local runs so the same file can be verified off-sandbox.
const OUT_DIR = process.env.OUTPUT_DIR ?? "/output";
const OUT_FILE = `${OUT_DIR}/entry.txt`;

function codePoints(s: string): number {
  return [...s].length;
}

function validate(line: string): void {
  const n = codePoints(line);
  if (n < 1 || n > 200) {
    throw new Error(`gate: ${n} characters, need 1-200`);
  }
  if (line.trim().length === 0) {
    throw new Error("gate: only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("gate: must be a single line");
  }
  if (/ {2,}/.test(line)) {
    throw new Error("gate: double space — a wasted beat in a tight line");
  }
  if (!/[.!?]$/.test(line)) {
    throw new Error("gate: needs terminal punctuation");
  }
}

validate(LINE);

// Only ever create the output dir — never remove it (the grader mounts it).
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, LINE, "utf8");

// Read-back byte check: the file must hold exactly the line, no newline.
const back = readFileSync(OUT_FILE, "utf8");
if (back !== LINE) {
  throw new Error("read-back mismatch");
}
console.log(
  `wrote ${OUT_FILE}: ${codePoints(back)} chars, ${Buffer.byteLength(back, "utf8")} bytes`,
);
