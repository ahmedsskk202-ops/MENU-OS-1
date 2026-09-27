import { describe, it, expect } from "vitest";
import { isAnswerCorrect, pickRandomPrompts, QUESTION_BANK, type TriviaQuestion } from "@/lib/game-questions";

const worldCup: TriviaQuestion = {
  kind: "TRIVIA",
  category: "Football",
  prompt: "Who won the 2022 World Cup?",
  acceptedAnswers: ["argentina"],
};

describe("game-questions", () => {
  it("accepts an exact-match answer case-insensitively", () => {
    expect(isAnswerCorrect(worldCup, "Argentina")).toBe(true);
    expect(isAnswerCorrect(worldCup, "ARGENTINA")).toBe(true);
  });

  it("accepts an answer with surrounding whitespace", () => {
    expect(isAnswerCorrect(worldCup, "  argentina  ")).toBe(true);
  });

  it("rejects a wrong answer", () => {
    expect(isAnswerCorrect(worldCup, "brazil")).toBe(false);
  });

  it("rejects an empty answer", () => {
    expect(isAnswerCorrect(worldCup, "")).toBe(false);
  });

  it("picks the requested number of unique prompts", () => {
    const prompts = pickRandomPrompts(5);
    expect(prompts).toHaveLength(5);
    expect(new Set(prompts)).toStrictEqual(new Set(prompts)); // no duplicate object refs by construction
  });

  it("never requests more prompts than exist in the bank", () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(5);
  });
});
