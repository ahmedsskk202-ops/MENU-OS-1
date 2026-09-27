import type { Locale } from "@/lib/i18n";

export type { Locale };

// The Game Platform supports Arabic + English content packs today. Each locale is a
// complete, independent set of content files under content/<locale>/ (see index.ts's
// CONTENT_BY_LOCALE). A future language is added the same way — a new content/<locale>/
// directory wired into that one map — with no change to the game engine, which only
// ever asks "give me N items for this locale/category."
export const SUPPORTED_LOCALES: Locale[] = ["en", "ar"];

export type ContentCategory = "GENERAL" | "SPORTS" | "ENTERTAINMENT" | "SCIENCE" | "GEOGRAPHY" | "HISTORY" | "FOOD_CULTURE" | "FUN_RANDOM";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

// One canonical free-text trivia question, shared by every TRIVIA-style game (Sports
// Challenge, General Challenge) AND used to derive MCQ rounds (General Knowledge Quiz)
// by picking distractors from other questions in the same category/locale — one content
// bank per language, two presentations, so a question written once benefits every game
// that uses it.
export interface TriviaContentItem {
  id: string;
  category: ContentCategory;
  difficulty: Difficulty;
  prompt: string;
  acceptedAnswers: string[]; // first entry is the canonical display answer for MCQ
}

export interface VoteContentItem {
  id: string;
  prompt: string;
}

export interface ImpostorWordItem {
  id: string;
  category: string;
  word: string;
}

// A "list as many as you can" category for Speed Categories (CATEGORY_SPRINT). Players
// submit multiple comma/newline-separated items in one answer; each is checked against
// this canonical list (case-insensitive, deduplicated).
export interface CategorySprintItem {
  id: string;
  category: string;
  acceptedItems: string[];
}
