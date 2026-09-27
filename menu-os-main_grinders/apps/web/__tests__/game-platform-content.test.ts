import { describe, it, expect } from "vitest";
import { allTriviaForLocale, pickTriviaQuestions, buildMcqOptions, pickVotePrompts, pickImpostorWords, pickCategorySprintPacks, isCategorySprintItemValid, SUPPORTED_LOCALES } from "@/lib/games/content";
import { GAME_REGISTRY } from "@/lib/games/registry";
import type { Locale } from "@/lib/i18n";

const CATEGORIES = ["GENERAL", "SPORTS", "ENTERTAINMENT", "SCIENCE", "GEOGRAPHY", "HISTORY", "FOOD_CULTURE", "FUN_RANDOM"] as const;

describe("supported locales", () => {
  it("supports exactly Arabic and English", () => {
    expect(new Set(SUPPORTED_LOCALES)).toEqual(new Set(["en", "ar"]));
  });
});

for (const locale of SUPPORTED_LOCALES) {
  describe(`trivia content bank (${locale})`, () => {
    it("has a large question set per category, not just 10-20 total", () => {
      const all = allTriviaForLocale(locale);
      expect(all.length).toBeGreaterThanOrEqual(200);
      for (const category of CATEGORIES) {
        const count = all.filter((q) => q.category === category).length;
        expect(count, `${locale}/${category} has too few questions`).toBeGreaterThanOrEqual(20);
      }
    });

    it("has no duplicate question ids", () => {
      const ids = allTriviaForLocale(locale).map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("every question has at least one non-empty accepted answer", () => {
      for (const q of allTriviaForLocale(locale)) {
        expect(q.acceptedAnswers.length).toBeGreaterThan(0);
        for (const a of q.acceptedAnswers) expect(a.trim().length).toBeGreaterThan(0);
      }
    });

    it("pickTriviaQuestions never returns duplicates and respects the requested count", () => {
      const picked = pickTriviaQuestions(locale, 15);
      expect(picked).toHaveLength(15);
      expect(new Set(picked.map((q) => q.id)).size).toBe(15);
    });

    it("pickTriviaQuestions can be scoped to a single category", () => {
      const picked = pickTriviaQuestions(locale, 10, { categories: ["SPORTS"] });
      expect(picked.every((q) => q.category === "SPORTS")).toBe(true);
    });

    it("pickTriviaQuestions can exclude a category", () => {
      const picked = pickTriviaQuestions(locale, 30, { excludeCategories: ["SPORTS"] });
      expect(picked.every((q) => q.category !== "SPORTS")).toBe(true);
    });
  });

  describe(`buildMcqOptions (${locale})`, () => {
    it("always returns exactly 4 distinct options including the correct one", () => {
      for (const q of pickTriviaQuestions(locale, 20)) {
        const { options, correctIndex } = buildMcqOptions(locale, q);
        expect(options).toHaveLength(4);
        expect(new Set(options.map((o) => o.toLowerCase())).size).toBe(4);
        expect(correctIndex).toBeGreaterThanOrEqual(0);
        expect(correctIndex).toBeLessThan(4);
        expect(options[correctIndex].toLowerCase()).toBe(q.acceptedAnswers[0].toLowerCase());
      }
    });
  });

  describe(`vote prompts / impostor words / category sprint packs (${locale})`, () => {
    it("has a real bank of vote prompts, not a token handful", () => {
      expect(pickVotePrompts(locale, 100).length).toBeGreaterThanOrEqual(20);
    });

    it("has a real bank of impostor words across multiple categories", () => {
      const words = pickImpostorWords(locale, 100);
      expect(words.length).toBeGreaterThanOrEqual(30);
      expect(new Set(words.map((w) => w.category)).size).toBeGreaterThanOrEqual(5);
    });

    it("has multiple category sprint packs", () => {
      expect(pickCategorySprintPacks(locale, 100).length).toBeGreaterThanOrEqual(10);
    });
  });
}

describe("no Iraq-specific content leaked into either locale's banks", () => {
  it("no trivia prompt or answer mentions Iraq/Baghdad by name", () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const q of allTriviaForLocale(locale)) {
        const haystack = `${q.prompt} ${q.acceptedAnswers.join(" ")}`.toLowerCase();
        expect(haystack, `${locale} question ${q.id} mentions Iraq/Baghdad`).not.toMatch(/iraq|baghdad|العراق|بغداد/);
      }
    }
  });
});

describe("category sprint validation", () => {
  it("is case-insensitive and rejects junk", () => {
    const pack = { id: "x", category: "Fruits", acceptedItems: ["apple", "banana"] };
    expect(isCategorySprintItemValid(pack, "Apple")).toBe(true);
    expect(isCategorySprintItemValid(pack, "  BANANA  ")).toBe(true);
    expect(isCategorySprintItemValid(pack, "car")).toBe(false);
    expect(isCategorySprintItemValid(pack, "")).toBe(false);
  });
});

describe("game registry", () => {
  const fakePlayers = [{ id: "p1" }, { id: "p2" }, { id: "p3" }];

  for (const locale of SUPPORTED_LOCALES) {
    it(`every registered game's round plan produces at least one round (${locale})`, () => {
      for (const [key, def] of Object.entries(GAME_REGISTRY)) {
        const plan = def.buildRoundPlan(fakePlayers, locale as Locale);
        expect(plan.length, `${key} (${locale}) produced an empty round plan`).toBeGreaterThan(0);
        for (const round of plan) {
          expect(round.timeLimitSeconds).toBeGreaterThan(0);
          expect(round.prompt.length).toBeGreaterThan(0);
        }
      }
    });
  }

  it("the impostor game assigns exactly one impostor per match, and every other player gets the real word", () => {
    const def = GAME_REGISTRY["impostor"];
    const players = [{ id: "p1" }, { id: "p2" }, { id: "p3" }, { id: "p4" }];
    const plan = def.buildRoundPlan(players, "en");
    const clueRounds = plan.filter((r) => r.kind === "IMPOSTOR_CLUE");
    expect(clueRounds.length).toBeGreaterThan(0);
    for (const round of clueRounds) {
      const secrets = round.secretsByPlayerId!;
      expect(Object.keys(secrets)).toHaveLength(players.length);
      const impostors = Object.values(secrets).filter((s) => (s as { role: string }).role === "IMPOSTOR");
      const crew = Object.values(secrets).filter((s) => (s as { role: string }).role === "CREW");
      expect(impostors).toHaveLength(1);
      expect(crew).toHaveLength(players.length - 1);
      const word = (crew[0] as { word: string }).word;
      expect(crew.every((c) => (c as { word: string }).word === word)).toBe(true);
      expect((impostors[0] as { word?: string }).word).toBeUndefined();
    }
  });
});
