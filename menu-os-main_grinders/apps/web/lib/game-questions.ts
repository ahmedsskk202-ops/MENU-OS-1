// 30-Second Challenge question bank. Original content, not derived from any
// commercial game's proprietary questions or presentation — inspired only by
// the generic "beat the clock" trivia format (spec §18).
export interface TriviaQuestion {
  kind: "TRIVIA";
  category: string;
  prompt: string;
  acceptedAnswers: string[];
}

export interface VotePrompt {
  kind: "VOTE";
  category: string;
  prompt: string;
}

// A pure reflex test: everyone waits, the round reveals at a random moment, first tap
// after reveal wins. revealDelayMs is picked once, server-side, when the round starts
// (see lib/game.ts#startRound) — not fixed content, so it isn't part of the prompt bank.
export interface ReactionPrompt {
  kind: "REACTION";
  category: string;
  prompt: string;
}

// Tap as many times as possible before the timer runs out. The client counts taps
// locally and submits the final count once, at time-up — matching the existing
// one-result-per-player-per-round data model exactly (see submitAnswer in lib/game.ts).
export interface TapPrompt {
  kind: "TAP";
  category: string;
  prompt: string;
}

// Watch a sequence, then reproduce it. The sequence itself is generated per-round
// (generateMemorySequence below), not fixed content, for the same reason as REACTION.
export interface MemoryPrompt {
  kind: "MEMORY";
  category: string;
  prompt: string;
}

export type GamePrompt = TriviaQuestion | VotePrompt | ReactionPrompt | TapPrompt | MemoryPrompt;

// The four memory-sequence symbols, referenced by index (1-4) in both the server's
// generated sequence and the client's submitted answer.
export const MEMORY_SYMBOLS = ["●", "■", "▲", "★"] as const;

export function generateMemorySequence(length = 4 + Math.floor(Math.random() * 3) /* 4-6 */): number[] {
  return Array.from({ length }, () => 1 + Math.floor(Math.random() * MEMORY_SYMBOLS.length));
}

export const QUESTION_BANK: GamePrompt[] = [
  { kind: "TRIVIA", category: "Football", prompt: "Name a football club that plays in Spain's La Liga.", acceptedAnswers: ["real madrid", "barcelona", "atletico madrid", "sevilla", "valencia", "real sociedad", "athletic bilbao", "villarreal", "real betis"] },
  { kind: "TRIVIA", category: "Football", prompt: "Which country won the FIFA World Cup in 2022?", acceptedAnswers: ["argentina"] },
  { kind: "TRIVIA", category: "Basketball", prompt: "Name an NBA team based in California.", acceptedAnswers: ["lakers", "clippers", "warriors", "kings", "la lakers", "golden state warriors", "los angeles lakers", "los angeles clippers", "sacramento kings"] },
  { kind: "TRIVIA", category: "F1", prompt: "Who won the most Formula 1 World Championships as of 2023?", acceptedAnswers: ["michael schumacher", "lewis hamilton", "schumacher", "hamilton"] },
  { kind: "TRIVIA", category: "Countries", prompt: "Name a country that borders Iraq.", acceptedAnswers: ["iran", "turkey", "syria", "jordan", "saudi arabia", "kuwait"] },
  { kind: "TRIVIA", category: "Cities", prompt: "Name the capital city of Egypt.", acceptedAnswers: ["cairo"] },
  { kind: "TRIVIA", category: "Movies", prompt: "Name a movie in the Marvel Cinematic Universe.", acceptedAnswers: ["avengers", "iron man", "thor", "black panther", "spider-man", "spiderman", "captain america", "doctor strange", "ant-man"] },
  { kind: "TRIVIA", category: "Music", prompt: "Name an instrument found in a typical orchestra.", acceptedAnswers: ["violin", "cello", "flute", "trumpet", "piano", "clarinet", "oboe", "viola", "trombone", "drums", "harp"] },
  { kind: "TRIVIA", category: "Food", prompt: "Name a dish that traditionally contains rice.", acceptedAnswers: ["biryani", "sushi", "paella", "risotto", "kabsa", "pilaf", "fried rice", "jollof rice"] },
  { kind: "TRIVIA", category: "History", prompt: "In which century did World War II take place?", acceptedAnswers: ["20th", "twentieth"] },
  { kind: "TRIVIA", category: "Olympics", prompt: "Name a sport featured in the Summer Olympics.", acceptedAnswers: ["swimming", "athletics", "basketball", "football", "volleyball", "gymnastics", "boxing", "cycling", "tennis", "wrestling"] },
  { kind: "TRIVIA", category: "Tennis", prompt: "Name a Grand Slam tennis tournament.", acceptedAnswers: ["wimbledon", "us open", "french open", "australian open", "roland garros"] },
  { kind: "VOTE", category: "Social", prompt: "Who is most likely to be late to their own wedding?" },
  { kind: "VOTE", category: "Social", prompt: "Who would survive the longest on a deserted island?" },
  { kind: "VOTE", category: "Social", prompt: "Who is most likely to become famous one day?" },
  { kind: "VOTE", category: "Social", prompt: "Who takes the longest to order food at a restaurant?" },
  { kind: "VOTE", category: "Social", prompt: "Who is the most likely to win a cooking competition?" },
  { kind: "VOTE", category: "Social", prompt: "Who would make the best travel companion?" },
  { kind: "REACTION", category: "Reflex", prompt: "Wait for it... tap the button the instant it turns green!" },
  { kind: "REACTION", category: "Reflex", prompt: "Fastest finger wins — tap as soon as it flashes!" },
  { kind: "TAP", category: "Speed", prompt: "Tap as many times as you can before time runs out!" },
  { kind: "TAP", category: "Speed", prompt: "Go go go — smash that button!" },
  { kind: "MEMORY", category: "Memory", prompt: "Watch the sequence, then repeat it back in order." },
  { kind: "MEMORY", category: "Memory", prompt: "Memorize the pattern — you'll need to recreate it!" },
];

export function pickRandomPrompts(count: number): GamePrompt[] {
  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function isAnswerCorrect(question: TriviaQuestion, rawAnswer: string): boolean {
  const normalized = rawAnswer.trim().toLowerCase();
  return question.acceptedAnswers.some((a) => a === normalized || normalized.includes(a));
}
