// Famous Last Words: The Funniest Epitaph
// make.fun bounty: u-riidzhsn-famous-last-words-the-funniest-epitaph-ff177406
//
// Writes one epitaph to /output/entry.txt: a single line of famous last
// words, at most 150 characters, carved as if on a tombstone. The program
// keeps three hand-written candidates, scores each against the judge's own
// rubric, and writes the winner.
//
// Judge rubric (most important first):
//   1. On-subject: a one-line tombstone epitaph of famous last words,
//      a single line of dying speech carved in stone.
//   2. Earns a real laugh on one read, from a genuine joke rather than a
//      mild pun or a sad sentiment.
//   3. Turns on a surprise, a twist or a double meaning that lands cleanly.
//   4. Reads like something carved on a stone: one short line, no stage
//      directions, no explanation.
//   5. Stays in the head after reading, quotable enough to repeat to a
//      friend.
//
// Deterministic, stdlib only, no network. Run: node main.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  // Rubric scores, 0-5 each, in the judge's own order. Hand-scored with a
  // one-line reason per candidate so the pick is auditable, not magic.
  scores: { subject: number; funny: number; twist: number; stone: number; memory: number };
  why: string;
};

const CANDIDATES: Candidate[] = [
  {
    text: "I can see the light. It's just the fridge — someone left it open again.",
    scores: { subject: 5, funny: 5, twist: 5, stone: 5, memory: 5 },
    why: "The dying cliché 'I can see the light' collapses into a fridge light left open: a real laugh, a clean twist, and a line anyone can repeat.",
  },
  {
    text: "Tell the cat I won. She knows what she did.",
    scores: { subject: 5, funny: 4, twist: 4, stone: 5, memory: 4 },
    why: "A lifelong rivalry settled in the final breath is charming and quotable, but the joke is a shrug, not a punchline.",
  },
  {
    text: "I spent my whole life saving for a rainy day. It never rained. Spend it all.",
    scores: { subject: 5, funny: 3, twist: 4, stone: 4, memory: 4 },
    why: "Last-words advice with a twist — a lifetime of saving undone in three short beats — but the laugh is warm, not sharp, and it reads like advice, not dying speech.",
  },
];

// The judge weighs its criteria in order, so the weights fall in that order.
const WEIGHTS = { subject: 5, funny: 4, twist: 3, stone: 2, memory: 1 };

function total(c: Candidate): number {
  const s = c.scores;
  return (
    s.subject * WEIGHTS.subject +
    s.funny * WEIGHTS.funny +
    s.twist * WEIGHTS.twist +
    s.stone * WEIGHTS.stone +
    s.memory * WEIGHTS.memory
  );
}

function pick(): Candidate {
  // Highest weighted total wins; ties break toward the smaller text in
  // bytes, which is also the final tie-break the bounty itself uses.
  return [...CANDIDATES].sort(
    (a, b) =>
      total(b) - total(a) ||
      Buffer.byteLength(a.text, "utf8") - Buffer.byteLength(b.text, "utf8"),
  )[0];
}

const winner = pick();
const text = winner.text;
// Count characters as code points, not UTF-16 units, so the gate matches
// how the bounty counts the 1-150 character limit.
const charCount = [...text].length;

// Gate (from the bounty rules): UTF-8 text of 1 to 150 characters, not
// only white space. Refuse to write anything that fails it.
if (charCount < 1 || charCount > 150 || text.trim().length === 0) {
  throw new Error(`Gate failed: entry is ${charCount} characters`);
}
if (text.includes("\n")) {
  throw new Error("Gate failed: entry must be a single line");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, "utf8");

// Read it back: the file the judge sees must be byte-for-byte the winner.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("Gate failed: /output/entry.txt does not match the winner");
}

console.log(`Winner (${total(winner)} pts): ${winner.why}`);
console.log(
  `Wrote /output/entry.txt (${charCount} chars, ${Buffer.byteLength(text, "utf8")} bytes):`,
);
console.log(text);
