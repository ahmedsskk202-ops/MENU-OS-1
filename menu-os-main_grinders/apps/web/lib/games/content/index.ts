import type { Locale, ContentCategory, TriviaContentItem, VoteContentItem, ImpostorWordItem, CategorySprintItem } from "./types";
import { SUPPORTED_LOCALES } from "./types";

import { GENERAL_KNOWLEDGE as EN_GENERAL } from "./en/general";
import { SPORTS as EN_SPORTS } from "./en/sports";
import { ENTERTAINMENT as EN_ENTERTAINMENT } from "./en/entertainment";
import { SCIENCE as EN_SCIENCE } from "./en/science";
import { GEOGRAPHY as EN_GEOGRAPHY } from "./en/geography";
import { HISTORY as EN_HISTORY } from "./en/history";
import { FOOD_CULTURE as EN_FOOD_CULTURE } from "./en/food-culture";
import { FUN_RANDOM as EN_FUN_RANDOM } from "./en/fun-random";
import { VOTE_PROMPTS as EN_VOTE_PROMPTS } from "./en/vote-prompts";
import { IMPOSTOR_WORDS as EN_IMPOSTOR_WORDS } from "./en/impostor-words";
import { CATEGORY_SPRINT_PACKS as EN_CATEGORY_SPRINT } from "./en/category-sprint";

import { GENERAL_KNOWLEDGE as AR_GENERAL } from "./ar/general";
import { SPORTS as AR_SPORTS } from "./ar/sports";
import { ENTERTAINMENT as AR_ENTERTAINMENT } from "./ar/entertainment";
import { SCIENCE as AR_SCIENCE } from "./ar/science";
import { GEOGRAPHY as AR_GEOGRAPHY } from "./ar/geography";
import { HISTORY as AR_HISTORY } from "./ar/history";
import { FOOD_CULTURE as AR_FOOD_CULTURE } from "./ar/food-culture";
import { FUN_RANDOM as AR_FUN_RANDOM } from "./ar/fun-random";
import { VOTE_PROMPTS as AR_VOTE_PROMPTS } from "./ar/vote-prompts";
import { IMPOSTOR_WORDS as AR_IMPOSTOR_WORDS } from "./ar/impostor-words";
import { CATEGORY_SPRINT_PACKS as AR_CATEGORY_SPRINT } from "./ar/category-sprint";

export * from "./types";

// Every locale is a complete, independent content pack — one canonical trivia bank per
// language, tagged by category. Adding language #3 later means adding one more
// content/<locale>/ directory (mirroring en/ and ar/) and one more entry in each of the
// three maps below; nothing in lib/games/engine.ts or registry.ts changes.
const TRIVIA_BY_LOCALE: Record<Locale, Record<ContentCategory, TriviaContentItem[]>> = {
  en: {
    GENERAL: EN_GENERAL,
    SPORTS: EN_SPORTS,
    ENTERTAINMENT: EN_ENTERTAINMENT,
    SCIENCE: EN_SCIENCE,
    GEOGRAPHY: EN_GEOGRAPHY,
    HISTORY: EN_HISTORY,
    FOOD_CULTURE: EN_FOOD_CULTURE,
    FUN_RANDOM: EN_FUN_RANDOM,
  },
  ar: {
    GENERAL: AR_GENERAL,
    SPORTS: AR_SPORTS,
    ENTERTAINMENT: AR_ENTERTAINMENT,
    SCIENCE: AR_SCIENCE,
    GEOGRAPHY: AR_GEOGRAPHY,
    HISTORY: AR_HISTORY,
    FOOD_CULTURE: AR_FOOD_CULTURE,
    FUN_RANDOM: AR_FUN_RANDOM,
  },
};

const VOTE_PROMPTS_BY_LOCALE: Record<Locale, VoteContentItem[]> = { en: EN_VOTE_PROMPTS, ar: AR_VOTE_PROMPTS };
const IMPOSTOR_WORDS_BY_LOCALE: Record<Locale, ImpostorWordItem[]> = { en: EN_IMPOSTOR_WORDS, ar: AR_IMPOSTOR_WORDS };
const CATEGORY_SPRINT_BY_LOCALE: Record<Locale, CategorySprintItem[]> = { en: EN_CATEGORY_SPRINT, ar: AR_CATEGORY_SPRINT };

/** Falls back to English if an unrecognized/unsupported locale ever reaches here (should
 *  never happen given Brand.defaultLocale is validated at write time, but a game session
 *  must always be able to pick content). */
function normalizeLocale(locale: Locale): Locale {
  return SUPPORTED_LOCALES.includes(locale) ? locale : "en";
}

export function allTriviaForLocale(locale: Locale): TriviaContentItem[] {
  return Object.values(TRIVIA_BY_LOCALE[normalizeLocale(locale)]).flat();
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Picks `count` trivia questions for the given locale, optionally scoped to a set of
 * categories and/or a difficulty, with no duplicates — the caller threads the returned
 * array through the whole session (see lib/games/engine.ts), so "no repeats within a
 * session" falls out of picking everything up front rather than re-querying per round.
 */
export function pickTriviaQuestions(
  locale: Locale,
  count: number,
  opts?: { categories?: ContentCategory[]; excludeCategories?: ContentCategory[]; difficulty?: "EASY" | "MEDIUM" | "HARD" }
): TriviaContentItem[] {
  const bank = TRIVIA_BY_LOCALE[normalizeLocale(locale)];
  let pool = opts?.categories ? opts.categories.flatMap((c) => bank[c]) : allTriviaForLocale(locale);
  if (opts?.excludeCategories?.length) pool = pool.filter((q) => !opts.excludeCategories!.includes(q.category));
  if (opts?.difficulty) pool = pool.filter((q) => q.difficulty === opts.difficulty);
  return shuffle(pool).slice(0, count);
}

// Arabic script has no letter case — title-casing an answer for display only makes
// sense for Latin-script (English) text. Applying it to Arabic would be a silent no-op
// at best, so this is explicit rather than assumed.
function displayCase(locale: Locale, text: string): string {
  if (locale !== "en") return text;
  return text
    .split(" ")
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Builds a 4-option multiple-choice round from one trivia question, drawing distractors
 *  from other questions in the same category/locale (or the whole locale's bank if the
 *  category is too small) so every MCQ round is self-contained without a separate
 *  hand-authored bank per locale. */
export function buildMcqOptions(locale: Locale, question: TriviaContentItem): { options: string[]; correctIndex: number } {
  const loc = normalizeLocale(locale);
  const correctAnswer = question.acceptedAnswers[0];
  const displayCorrect = displayCase(loc, correctAnswer);

  let candidatePool = TRIVIA_BY_LOCALE[loc][question.category].filter((q) => q.id !== question.id);
  if (candidatePool.length < 3) candidatePool = allTriviaForLocale(loc).filter((q) => q.id !== question.id);

  const seenLower = new Set([correctAnswer.toLowerCase()]);
  const distractors: string[] = [];
  for (const candidate of shuffle(candidatePool)) {
    const raw = candidate.acceptedAnswers[0];
    const lower = raw.toLowerCase();
    if (seenLower.has(lower)) continue;
    seenLower.add(lower);
    distractors.push(displayCase(loc, raw));
    if (distractors.length === 3) break;
  }
  // Extremely small banks (shouldn't happen with real content) fall back to filler options
  // rather than ever shipping fewer than 4 choices to the client.
  while (distractors.length < 3) distractors.push(`${loc === "ar" ? "خيار" : "Option"} ${distractors.length + 2}`);

  const options = shuffle([displayCorrect, ...distractors]);
  return { options, correctIndex: options.indexOf(displayCorrect) };
}

export function pickVotePrompts(locale: Locale, count: number): VoteContentItem[] {
  return shuffle(VOTE_PROMPTS_BY_LOCALE[normalizeLocale(locale)]).slice(0, count);
}

export function pickImpostorWords(locale: Locale, count: number): ImpostorWordItem[] {
  return shuffle(IMPOSTOR_WORDS_BY_LOCALE[normalizeLocale(locale)]).slice(0, count);
}

export function pickCategorySprintPacks(locale: Locale, count: number): CategorySprintItem[] {
  return shuffle(CATEGORY_SPRINT_BY_LOCALE[normalizeLocale(locale)]).slice(0, count);
}

export function isCategorySprintItemValid(pack: CategorySprintItem, rawItem: string): boolean {
  const normalized = rawItem.trim().toLowerCase();
  if (!normalized) return false;
  return pack.acceptedItems.some((a) => a === normalized);
}
