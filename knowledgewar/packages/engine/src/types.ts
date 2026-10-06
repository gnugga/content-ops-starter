export interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface QuestionBase {
  id: string;
  category: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  explanation?: string;
  source?: string;
}

/** `judge` (player-voted) questions are planned but not supported by the engine yet. */
export type Question =
  | (QuestionBase & { type: 'choice'; choices: string[]; answer: number })
  | (QuestionBase & { type: 'text'; answer: string; accept?: string[] })
  | (QuestionBase & { type: 'number'; answer: number; tolerance?: number })
  /** `answer` lists indexes into `items` in the correct order. */
  | (QuestionBase & { type: 'order'; items: string[]; answer: number[] });

export type QuestionType = Question['type'];

export interface Pack {
  id: string;
  lang: string;
  title: string;
  ageMin?: number;
  categories: Category[];
  questions: Question[];
}

/** choice: index · text: string · number: number · order: indexes into items */
export type AnswerValue = number | string | number[];

export interface Settings {
  /** Categories per player per round; also the highest bet value. */
  handSize: number;
  /** First round end where someone has at least this many points ends the game. */
  targetScore: number;
  maxRounds: number;
  /** Points for a correct steal. */
  stealWin: number;
  /** Points lost for a wrong steal (score never goes below 0). */
  stealLose: number;
  minPlayers: number;
  maxPlayers: number;
}

export const DEFAULT_SETTINGS: Settings = {
  handSize: 4,
  targetScore: 30,
  maxRounds: 5,
  stealWin: 2,
  stealLose: 1,
  minPlayers: 2,
  maxPlayers: 8,
};

export interface SwapChoice {
  /** My category to give away. */
  give: string;
  /** Opponent player id. */
  target: string;
  /** Opponent's category to take. */
  take: string;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  /** Categories dealt this round. */
  hand: string[];
  /** Secret bet: slots[v - 1] is the category worth v points. null until bet. */
  slots: string[] | null;
  /** null until the player has chosen a swap or passed. */
  swap: SwapChoice | 'pass' | null;
  stealUsed: boolean;
}

export interface TurnResult {
  correct: boolean;
  /** Score change actually applied. */
  delta: number;
}

export interface Turn {
  playerId: string;
  categoryId: string;
  value: number;
  questionId: string;
  stealers: string[];
  answers: Record<string, AnswerValue>;
  results: Record<string, TurnResult> | null;
}

export interface SwapLogEntry {
  from: string;
  to: string;
  give: string;
  take: string;
}

export type Phase = 'LOBBY' | 'BET' | 'SWAP' | 'QUESTION' | 'REVEAL' | 'ROUND_SCORE' | 'GAME_OVER';

/** Full authoritative state. Lives on the server only; clients get `viewFor()`. */
export interface GameState {
  phase: Phase;
  settings: Settings;
  pack: Pack;
  players: Player[];
  hostId: string | null;
  round: number;
  /** Remaining turns this round, in order. */
  queue: { playerId: string; value: number }[];
  turn: Turn | null;
  usedQuestions: string[];
  /** Seeded PRNG state, so games are reproducible. */
  rng: number;
  swapLog: SwapLogEntry[];
  winnerIds: string[];
}

/**
 * `by` is the acting player id, set by the server from the socket (never trusted from the client).
 * For `next` and `timeUp`, omit `by` when the server itself dispatches (timers).
 */
export type Action =
  | { type: 'join'; playerId: string; name: string; avatar?: string }
  | { type: 'leave'; by: string }
  | { type: 'kick'; by: string; playerId: string }
  | { type: 'start'; by: string }
  | { type: 'bet'; by: string; slots: string[] }
  | { type: 'swap'; by: string; give: string; target: string; take: string }
  | { type: 'pass'; by: string }
  | { type: 'steal'; by: string }
  | { type: 'answer'; by: string; value: AnswerValue }
  | { type: 'timeUp'; by?: string }
  | { type: 'next'; by?: string };

export type ErrorCode =
  | 'WRONG_PHASE'
  | 'NOT_HOST'
  | 'UNKNOWN_PLAYER'
  | 'INVALID_NAME'
  | 'INVALID_ID'
  | 'ALREADY_JOINED'
  | 'NAME_TAKEN'
  | 'ROOM_FULL'
  | 'NOT_ENOUGH_PLAYERS'
  | 'CANNOT_KICK_HOST'
  | 'ALREADY_DONE'
  | 'INVALID_BET'
  | 'INVALID_SWAP'
  | 'INVALID_STEAL'
  | 'STEAL_USED'
  | 'TOO_LATE'
  | 'NOT_YOUR_TURN';

export type Result = { ok: true; state: GameState } | { ok: false; error: ErrorCode };
