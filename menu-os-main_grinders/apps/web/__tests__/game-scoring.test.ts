import { describe, it, expect } from "vitest";
import { scoreReaction, scoreTap, scoreMemory, parseMemoryAnswer } from "@/lib/game-scoring";

describe("scoreReaction", () => {
  it("scores a fast reaction after reveal highly", () => {
    const startedAt = 1000;
    const revealDelayMs = 3000;
    const scored = scoreReaction(startedAt, revealDelayMs, startedAt + revealDelayMs + 50);
    expect(scored.isCorrect).toBe(true);
    expect(scored.responseTimeMs).toBe(50);
    expect(scored.points).toBe(250); // 300 - 50
  });

  it("floors points at 10 for a slow-but-legitimate reaction", () => {
    const scored = scoreReaction(0, 3000, 3000 + 1000);
    expect(scored.isCorrect).toBe(true);
    expect(scored.points).toBe(10);
  });

  it("scores a false start (tapped before reveal) as zero, not negative", () => {
    const scored = scoreReaction(0, 3000, 2000);
    expect(scored.isCorrect).toBe(false);
    expect(scored.points).toBe(0);
  });

  it("treats tapping exactly at the reveal instant as a legitimate reaction", () => {
    const scored = scoreReaction(0, 3000, 3000);
    expect(scored.isCorrect).toBe(true);
    expect(scored.responseTimeMs).toBe(0);
  });
});

describe("scoreTap", () => {
  it("awards points equal to the tap count", () => {
    expect(scoreTap("42").points).toBe(42);
    expect(scoreTap("42").isCorrect).toBe(true);
  });

  it("clamps an absurd count instead of trusting the client unbounded", () => {
    expect(scoreTap("999999").points).toBe(200);
    expect(scoreTap("999999").count).toBe(999);
  });

  it("treats zero taps as not correct but not an error", () => {
    expect(scoreTap("0").isCorrect).toBe(false);
    expect(scoreTap("0").points).toBe(0);
  });

  it("never lets a malformed count crash or go negative", () => {
    expect(scoreTap("not a number").points).toBe(0);
    expect(scoreTap("-5").points).toBe(0);
    expect(scoreTap("").points).toBe(0);
  });
});

describe("scoreMemory", () => {
  it("awards full credit plus the bonus for an exact match", () => {
    const scored = scoreMemory([1, 2, 3, 4], [1, 2, 3, 4]);
    expect(scored.isCorrect).toBe(true);
    expect(scored.matched).toBe(4);
    expect(scored.points).toBe(4 * 20 + 50);
  });

  it("awards partial credit for a correct prefix", () => {
    const scored = scoreMemory([1, 2, 3, 4], [1, 2, 9, 9]);
    expect(scored.isCorrect).toBe(false);
    expect(scored.matched).toBe(2);
    expect(scored.points).toBe(40);
  });

  it("awards zero for a wrong first element", () => {
    const scored = scoreMemory([1, 2, 3], [9, 2, 3]);
    expect(scored.matched).toBe(0);
    expect(scored.points).toBe(0);
  });

  it("a too-short submission is not marked correct even if the prefix matches", () => {
    const scored = scoreMemory([1, 2, 3, 4], [1, 2, 3]);
    expect(scored.isCorrect).toBe(false);
    expect(scored.matched).toBe(3);
  });

  it("a too-long submission is not marked correct even if the prefix matches", () => {
    const scored = scoreMemory([1, 2], [1, 2, 3]);
    expect(scored.isCorrect).toBe(false);
  });
});

describe("parseMemoryAnswer", () => {
  it("parses a comma-joined sequence", () => {
    expect(parseMemoryAnswer("1,2,3,4")).toEqual([1, 2, 3, 4]);
  });

  it("tolerates whitespace", () => {
    expect(parseMemoryAnswer(" 1 , 2 , 3 ")).toEqual([1, 2, 3]);
  });

  it("drops non-numeric junk instead of crashing", () => {
    expect(parseMemoryAnswer("1,x,3")).toEqual([1, 3]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseMemoryAnswer("")).toEqual([]);
  });
});
