import { describe, it, expect } from "vitest";
import { scoreMcq, scoreCategorySprint, tallyVotes } from "@/lib/game-scoring";

describe("scoreMcq", () => {
  it("awards points for the correct option, decaying with response time", () => {
    const fast = scoreMcq(2, 2, 100);
    const slow = scoreMcq(2, 2, 6000);
    expect(fast.isCorrect).toBe(true);
    expect(slow.isCorrect).toBe(true);
    expect(fast.points).toBeGreaterThan(slow.points);
  });

  it("floors correct-answer points at 50 regardless of how slow", () => {
    expect(scoreMcq(0, 0, 999999).points).toBe(50);
  });

  it("awards zero for the wrong option", () => {
    const scored = scoreMcq(1, 2, 500);
    expect(scored.isCorrect).toBe(false);
    expect(scored.points).toBe(0);
  });

  it("awards zero for a non-numeric or out-of-range submission", () => {
    expect(scoreMcq(0, NaN, 500).isCorrect).toBe(false);
    expect(scoreMcq(0, 99, 500).isCorrect).toBe(false);
  });
});

describe("scoreCategorySprint", () => {
  const isFruit = (item: string) => ["apple", "banana", "mango"].includes(item.toLowerCase());

  it("counts each distinct valid item once", () => {
    const scored = scoreCategorySprint("apple, banana, mango", isFruit);
    expect(scored.validCount).toBe(3);
    expect(scored.points).toBe(75);
    expect(scored.isCorrect).toBe(true);
  });

  it("ignores invalid items without counting them", () => {
    const scored = scoreCategorySprint("apple, car, banana", isFruit);
    expect(scored.validCount).toBe(2);
    expect(scored.points).toBe(50);
  });

  it("does not double-count a duplicate item", () => {
    const scored = scoreCategorySprint("apple, apple, apple", isFruit);
    expect(scored.validCount).toBe(1);
  });

  it("is case-insensitive on duplicates", () => {
    const scored = scoreCategorySprint("Apple, apple, APPLE", isFruit);
    expect(scored.validCount).toBe(1);
  });

  it("supports newline-separated lists, not just commas", () => {
    const scored = scoreCategorySprint("apple\nbanana\nmango", isFruit);
    expect(scored.validCount).toBe(3);
  });

  it("scores an all-empty or all-invalid submission as zero, not correct", () => {
    expect(scoreCategorySprint("", isFruit).isCorrect).toBe(false);
    expect(scoreCategorySprint("car, plane", isFruit).isCorrect).toBe(false);
  });
});

describe("tallyVotes", () => {
  it("picks the single player with the most votes", () => {
    const { winners, maxVotes } = tallyVotes([
      { gamePlayerId: "p1", answer: "p2" },
      { gamePlayerId: "p3", answer: "p2" },
      { gamePlayerId: "p4", answer: "p1" },
    ]);
    expect(winners).toEqual(["p2"]);
    expect(maxVotes).toBe(2);
  });

  it("returns every tied player on a tie", () => {
    const { winners } = tallyVotes([
      { gamePlayerId: "p1", answer: "p2" },
      { gamePlayerId: "p3", answer: "p4" },
    ]);
    expect(new Set(winners)).toEqual(new Set(["p2", "p4"]));
  });

  it("ignores null answers (no-shows/timeouts) entirely", () => {
    const { winners, tally } = tallyVotes([
      { gamePlayerId: "p1", answer: "p2" },
      { gamePlayerId: "p3", answer: null },
    ]);
    expect(winners).toEqual(["p2"]);
    expect(tally.size).toBe(1);
  });

  it("returns no winners when nobody voted", () => {
    const { winners, maxVotes } = tallyVotes([{ gamePlayerId: "p1", answer: null }]);
    expect(winners).toEqual([]);
    expect(maxVotes).toBe(0);
  });
});
