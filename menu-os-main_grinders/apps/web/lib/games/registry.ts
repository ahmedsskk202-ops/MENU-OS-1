// The Game Platform registry — one entry per NEW game (the original 30-Second
// Challenge stays entirely on its own path in lib/game.ts, untouched). Adding another
// game later means adding one more entry here (plus a content pack if it needs fresh
// questions); lib/games/engine.ts never needs to change. Every entry's buildRoundPlan
// receives the session's locale (resolved once, server-side, from the table's brand —
// see lib/games/engine.ts) and must draw only from that locale's content pack.
import type { Locale } from "@/lib/i18n";
import { pickTriviaQuestions, pickVotePrompts, pickImpostorWords, pickCategorySprintPacks, buildMcqOptions, type ContentCategory } from "./content";

export type NewGameRoundKind = "TRIVIA" | "VOTE" | "REACTION" | "TAP" | "MEMORY" | "MCQ" | "IMPOSTOR_CLUE" | "IMPOSTOR_VOTE" | "CATEGORY_SPRINT";

export interface RoundBlueprint {
  kind: NewGameRoundKind;
  category: string;
  prompt: string;
  meta: Record<string, unknown>;
  timeLimitSeconds: number;
  /** Impostor only: gamePlayerId -> private data for that round, written to
   *  GameRoundSecret when the round is created. Never included in `meta`. */
  secretsByPlayerId?: Record<string, Record<string, unknown>>;
}

export interface GameDefinition {
  key: string;
  nameKey: string;
  descriptionKey: string;
  icon: "Trophy" | "Brain" | "Users" | "Vote" | "Sparkles" | "Zap" | "Timer" | "Grid3x3" | "Drama";
  minPlayers: number;
  buildRoundPlan: (players: { id: string }[], locale: Locale) => RoundBlueprint[];
}

const REACTION_FLAVOR: Record<Locale, string[]> = {
  en: ["Wait for it... tap the instant it turns green!", "Fastest finger wins — tap as soon as it flashes!", "Stay sharp — tap the moment it lights up!"],
  ar: ["انتظر... انقر فور تحول اللون إلى الأخضر!", "الأسرع يفوز — انقر بمجرد الوميض!", "كن حذراً — انقر لحظة الإضاءة!"],
};
const TAP_PROMPT: Record<Locale, string> = { en: "Tap as many times as you can before time runs out!", ar: "انقر أكبر عدد ممكن من المرات قبل نفاد الوقت!" };
const MEMORY_PROMPT: Record<Locale, string> = { en: "Watch the sequence, then repeat it back in order.", ar: "شاهد التسلسل ثم كرّره بنفس الترتيب." };
const IMPOSTOR_CLUE_PROMPT: Record<Locale, string> = {
  en: "Give a one-word clue — don't say the secret word! The impostor is bluffing.",
  ar: "أعطِ دليلاً من كلمة واحدة — لا تذكر الكلمة السرية! الدخيل يحاول التمويه.",
};
const IMPOSTOR_VOTE_PROMPT: Record<Locale, string> = { en: "Who do you think is the impostor?", ar: "من تعتقد أنه الدخيل؟" };
const CATEGORY_SPRINT_PROMPT: Record<Locale, (category: string) => string> = {
  en: (category) => `List as many ${category} as you can!`,
  ar: (category) => `اذكر أكبر عدد ممكن من: ${category}!`,
};

const REACTION_REVEAL_MIN_MS = 2000;
const REACTION_REVEAL_MAX_MS = 5000;
export const REACTION_REVEAL_RANGE = { min: REACTION_REVEAL_MIN_MS, max: REACTION_REVEAL_MAX_MS };

function triviaRounds(locale: Locale, count: number, timeLimitSeconds: number, opts?: { categories?: ContentCategory[]; excludeCategories?: ContentCategory[] }): RoundBlueprint[] {
  return pickTriviaQuestions(locale, count, opts).map((q) => ({
    kind: "TRIVIA" as const,
    category: q.category,
    prompt: q.prompt,
    meta: { acceptedAnswers: q.acceptedAnswers },
    timeLimitSeconds,
  }));
}

export const GAME_REGISTRY: Record<string, GameDefinition> = {
  "sports-challenge": {
    key: "sports-challenge",
    nameKey: "games.sportsChallenge.name",
    descriptionKey: "games.sportsChallenge.description",
    icon: "Trophy",
    minPlayers: 2,
    buildRoundPlan: (_players, locale) => triviaRounds(locale, 8, 15, { categories: ["SPORTS"] }),
  },

  "general-challenge": {
    key: "general-challenge",
    nameKey: "games.generalChallenge.name",
    descriptionKey: "games.generalChallenge.description",
    icon: "Zap",
    minPlayers: 2,
    buildRoundPlan: (_players, locale) => triviaRounds(locale, 8, 15, { excludeCategories: ["SPORTS"] }),
  },

  "knowledge-quiz": {
    key: "knowledge-quiz",
    nameKey: "games.knowledgeQuiz.name",
    descriptionKey: "games.knowledgeQuiz.description",
    icon: "Brain",
    minPlayers: 2,
    buildRoundPlan: (_players, locale) =>
      pickTriviaQuestions(locale, 10).map((q) => {
        const { options, correctIndex } = buildMcqOptions(locale, q);
        return { kind: "MCQ" as const, category: q.category, prompt: q.prompt, meta: { options, correctIndex }, timeLimitSeconds: 20 };
      }),
  },

  "social-vote": {
    key: "social-vote",
    nameKey: "games.socialVote.name",
    descriptionKey: "games.socialVote.description",
    icon: "Vote",
    minPlayers: 2,
    buildRoundPlan: (_players, locale) => pickVotePrompts(locale, 10).map((v) => ({ kind: "VOTE" as const, category: "Social", prompt: v.prompt, meta: {}, timeLimitSeconds: 20 })),
  },

  "category-sprint": {
    key: "category-sprint",
    nameKey: "games.categorySprint.name",
    descriptionKey: "games.categorySprint.description",
    icon: "Grid3x3",
    minPlayers: 2,
    buildRoundPlan: (_players, locale) =>
      pickCategorySprintPacks(locale, 6).map((p) => ({
        kind: "CATEGORY_SPRINT" as const,
        category: p.category,
        prompt: CATEGORY_SPRINT_PROMPT[locale](p.category),
        meta: { acceptedItems: p.acceptedItems },
        timeLimitSeconds: 30,
      })),
  },

  impostor: {
    key: "impostor",
    nameKey: "games.impostor.name",
    descriptionKey: "games.impostor.description",
    icon: "Drama",
    minPlayers: 3,
    buildRoundPlan: (players, locale) => {
      const matches = pickImpostorWords(locale, 3);
      const rounds: RoundBlueprint[] = [];
      for (const word of matches) {
        const impostor = players[Math.floor(Math.random() * players.length)];
        const secretsByPlayerId: Record<string, Record<string, unknown>> = {};
        for (const p of players) {
          secretsByPlayerId[p.id] = p.id === impostor.id ? { role: "IMPOSTOR", category: word.category } : { role: "CREW", category: word.category, word: word.word };
        }
        rounds.push({
          kind: "IMPOSTOR_CLUE",
          category: word.category,
          prompt: IMPOSTOR_CLUE_PROMPT[locale],
          meta: { category: word.category },
          timeLimitSeconds: 25,
          secretsByPlayerId,
        });
        rounds.push({
          kind: "IMPOSTOR_VOTE",
          category: word.category,
          prompt: IMPOSTOR_VOTE_PROMPT[locale],
          meta: {},
          timeLimitSeconds: 25,
        });
      }
      return rounds;
    },
  },

  "reaction-duel": {
    key: "reaction-duel",
    nameKey: "games.reactionDuel.name",
    descriptionKey: "games.reactionDuel.description",
    icon: "Sparkles",
    minPlayers: 1,
    buildRoundPlan: (_players, locale) =>
      Array.from({ length: 6 }, (_, i) => ({
        kind: "REACTION" as const,
        category: "Reflex",
        prompt: REACTION_FLAVOR[locale][i % REACTION_FLAVOR[locale].length],
        meta: {},
        timeLimitSeconds: 8,
      })),
  },

  "tap-battle": {
    key: "tap-battle",
    nameKey: "games.tapBattle.name",
    descriptionKey: "games.tapBattle.description",
    icon: "Zap",
    minPlayers: 1,
    buildRoundPlan: (_players, locale) =>
      Array.from({ length: 4 }, () => ({
        kind: "TAP" as const,
        category: "Speed",
        prompt: TAP_PROMPT[locale],
        meta: {},
        timeLimitSeconds: 10,
      })),
  },

  "memory-match": {
    key: "memory-match",
    nameKey: "games.memoryMatch.name",
    descriptionKey: "games.memoryMatch.description",
    icon: "Grid3x3",
    minPlayers: 1,
    buildRoundPlan: (_players, locale) =>
      Array.from({ length: 5 }, () => ({
        kind: "MEMORY" as const,
        category: "Memory",
        prompt: MEMORY_PROMPT[locale],
        meta: {},
        timeLimitSeconds: 20,
      })),
  },
};

export function getGameDefinition(key: string): GameDefinition | undefined {
  return GAME_REGISTRY[key];
}
