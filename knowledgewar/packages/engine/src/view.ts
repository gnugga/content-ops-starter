import type { AnswerValue, Category, GameState, Phase, Question, Settings, SwapChoice, SwapLogEntry, TurnResult } from './types';

/** A question without its answer. */
export type PublicQuestion =
  | { id: string; type: 'choice'; category: string; prompt: string; choices: string[] }
  | { id: string; type: 'text' | 'number'; category: string; prompt: string }
  | { id: string; type: 'order'; category: string; prompt: string; items: string[] };

export interface PublicPlayer {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  isHost: boolean;
  /** Current categories in alphabetical order, so bet values stay hidden. */
  categories: string[];
  hasBet: boolean;
  hasSwapped: boolean;
  stealUsed: boolean;
}

export interface GameView {
  viewer: string;
  phase: Phase;
  round: number;
  settings: Settings;
  categories: Category[];
  players: PublicPlayer[];
  hostId: string | null;
  /** Only for a player viewer: their private info. */
  me: { id: string; isHost: boolean; hand: string[]; slots: string[] | null; swap: SwapChoice | 'pass' | null } | null;
  turn: {
    playerId: string;
    categoryId: string;
    value: number;
    question: PublicQuestion;
    stealers: string[];
    /** Who has answered (not what). */
    answered: string[];
    myAnswer: AnswerValue | null;
    /** Only set in REVEAL. */
    reveal: {
      answer: AnswerValue;
      explanation?: string;
      answers: Record<string, AnswerValue>;
      results: Record<string, TurnResult>;
    } | null;
  } | null;
  turnsLeft: number;
  swapLog: SwapLogEntry[];
  winnerIds: string[];
}

function publicQuestion(q: Question): PublicQuestion {
  const base = { id: q.id, category: q.category, prompt: q.prompt };
  switch (q.type) {
    case 'choice':
      return { ...base, type: q.type, choices: [...q.choices] };
    case 'order':
      return { ...base, type: q.type, items: [...q.items] };
    default:
      return { ...base, type: q.type };
  }
}

/**
 * What a given screen may see. `viewer` is a player id or 'tv'.
 * This is the only place secrets are removed; every client (host included) gets exactly this.
 */
export function viewFor(state: GameState, viewer: string): GameView {
  const me = viewer === 'tv' ? undefined : state.players.find((p) => p.id === viewer);
  const turn = state.turn;
  let turnView: GameView['turn'] = null;

  if (turn) {
    const q = state.pack.questions.find((x) => x.id === turn.questionId)!;
    const revealed = state.phase === 'REVEAL' && turn.results;
    turnView = {
      playerId: turn.playerId,
      categoryId: turn.categoryId,
      value: turn.value,
      question: publicQuestion(q),
      stealers: [...turn.stealers],
      answered: Object.keys(turn.answers),
      myAnswer: me && Object.hasOwn(turn.answers, me.id) ? structuredClone(turn.answers[me.id]!) : null,
      reveal: revealed
        ? {
            answer: structuredClone(q.answer),
            ...(q.explanation ? { explanation: q.explanation } : {}),
            answers: structuredClone(turn.answers),
            results: structuredClone(turn.results!),
          }
        : null,
    };
  }

  return {
    viewer,
    phase: state.phase,
    round: state.round,
    settings: { ...state.settings },
    categories: state.pack.categories.map((c) => ({ ...c })),
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      ...(p.avatar ? { avatar: p.avatar } : {}),
      score: p.score,
      isHost: p.id === state.hostId,
      categories: [...(p.slots ?? p.hand)].sort(),
      hasBet: p.slots !== null,
      hasSwapped: p.swap !== null,
      stealUsed: p.stealUsed,
    })),
    hostId: state.hostId,
    me: me
      ? {
          id: me.id,
          isHost: me.id === state.hostId,
          hand: [...me.hand],
          slots: me.slots ? [...me.slots] : null,
          swap: me.swap && me.swap !== 'pass' ? { ...me.swap } : me.swap,
        }
      : null,
    turn: turnView,
    turnsLeft: state.queue.length,
    swapLog: state.swapLog.map((e) => ({ ...e })),
    winnerIds: [...state.winnerIds],
  };
}
