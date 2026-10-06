import { isCorrect } from './match';
import { validatePack } from './pack';
import { nextFloat, shuffle } from './rng';
import {
  DEFAULT_SETTINGS,
  type Action,
  type ErrorCode,
  type GameState,
  type Pack,
  type Player,
  type Question,
  type Result,
  type Settings,
  type Turn,
} from './types';

export function createGame(opts: { pack: Pack; seed: number; settings?: Partial<Settings> }): GameState {
  const settings = { ...DEFAULT_SETTINGS, ...opts.settings };
  const errors = validatePack(opts.pack);
  if (opts.pack.categories.length < settings.handSize)
    errors.push(`pack needs at least ${settings.handSize} categories`);
  if (errors.length) throw new Error(`Invalid pack: ${errors.join('; ')}`);

  return {
    phase: 'LOBBY',
    settings,
    pack: opts.pack,
    players: [],
    hostId: null,
    round: 0,
    queue: [],
    turn: null,
    usedQuestions: [],
    rng: opts.seed >>> 0,
    swapLog: [],
    winnerIds: [],
  };
}

const ok = (state: GameState): Result => ({ ok: true, state });
const fail = (error: ErrorCode): Result => ({ ok: false, error });

/** Pure reducer: never mutates `state`. The pack is shared (treated as read-only). */
export function reduce(state: GameState, action: Action): Result {
  const { pack, ...rest } = state;
  const s: GameState = { ...structuredClone(rest), pack };

  switch (action.type) {
    case 'join': {
      if (s.phase !== 'LOBBY') return fail('WRONG_PHASE');
      const name = action.name.trim();
      if (!name || name.length > 20) return fail('INVALID_NAME');
      if (!action.playerId || action.playerId === 'tv') return fail('INVALID_ID');
      if (findPlayer(s, action.playerId)) return fail('ALREADY_JOINED');
      if (s.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) return fail('NAME_TAKEN');
      if (s.players.length >= s.settings.maxPlayers) return fail('ROOM_FULL');
      s.players.push({
        id: action.playerId,
        name,
        ...(action.avatar ? { avatar: action.avatar } : {}),
        score: 0,
        hand: [],
        slots: null,
        swap: null,
        stealUsed: false,
      });
      s.hostId ??= action.playerId;
      return ok(s);
    }

    case 'leave': {
      if (s.phase !== 'LOBBY') return fail('WRONG_PHASE');
      if (!findPlayer(s, action.by)) return fail('UNKNOWN_PLAYER');
      removePlayer(s, action.by);
      return ok(s);
    }

    case 'kick': {
      if (action.by !== s.hostId) return fail('NOT_HOST');
      if (action.playerId === s.hostId) return fail('CANNOT_KICK_HOST');
      if (!findPlayer(s, action.playerId)) return fail('UNKNOWN_PLAYER');
      removePlayer(s, action.playerId);
      return ok(s);
    }

    case 'start': {
      if (action.by !== s.hostId) return fail('NOT_HOST');
      if (s.phase !== 'LOBBY') return fail('WRONG_PHASE');
      if (s.players.length < s.settings.minPlayers) return fail('NOT_ENOUGH_PLAYERS');
      startRound(s);
      return ok(s);
    }

    case 'bet': {
      if (s.phase !== 'BET') return fail('WRONG_PHASE');
      const p = findPlayer(s, action.by);
      if (!p) return fail('UNKNOWN_PLAYER');
      if (p.slots) return fail('ALREADY_DONE');
      if (!isPermutation(action.slots, p.hand)) return fail('INVALID_BET');
      p.slots = [...action.slots];
      if (s.players.every((pl) => pl.slots)) s.phase = 'SWAP';
      return ok(s);
    }

    case 'swap': {
      if (s.phase !== 'SWAP') return fail('WRONG_PHASE');
      const p = findPlayer(s, action.by);
      if (!p) return fail('UNKNOWN_PLAYER');
      if (p.swap) return fail('ALREADY_DONE');
      const target = findPlayer(s, action.target);
      if (!target || target.id === p.id || !canSwap(p, target, action.give, action.take))
        return fail('INVALID_SWAP');
      p.swap = { give: action.give, target: action.target, take: action.take };
      maybeFinishSwaps(s);
      return ok(s);
    }

    case 'pass': {
      if (s.phase !== 'SWAP') return fail('WRONG_PHASE');
      const p = findPlayer(s, action.by);
      if (!p) return fail('UNKNOWN_PLAYER');
      if (p.swap) return fail('ALREADY_DONE');
      p.swap = 'pass';
      maybeFinishSwaps(s);
      return ok(s);
    }

    case 'steal': {
      if (s.phase !== 'QUESTION' || !s.turn) return fail('WRONG_PHASE');
      const p = findPlayer(s, action.by);
      if (!p) return fail('UNKNOWN_PLAYER');
      if (p.id === s.turn.playerId || s.turn.stealers.includes(p.id)) return fail('INVALID_STEAL');
      if (p.stealUsed) return fail('STEAL_USED');
      // Steals must be declared before the active player locks in.
      if (Object.hasOwn(s.turn.answers, s.turn.playerId)) return fail('TOO_LATE');
      p.stealUsed = true;
      s.turn.stealers.push(p.id);
      return ok(s);
    }

    case 'answer': {
      if (s.phase !== 'QUESTION' || !s.turn) return fail('WRONG_PHASE');
      if (!participants(s.turn).includes(action.by)) return fail('NOT_YOUR_TURN');
      if (Object.hasOwn(s.turn.answers, action.by)) return fail('ALREADY_DONE');
      s.turn.answers[action.by] = action.value;
      if (allAnswered(s.turn)) resolveTurn(s);
      return ok(s);
    }

    case 'timeUp': {
      if (action.by !== undefined && action.by !== s.hostId) return fail('NOT_HOST');
      if (s.phase !== 'QUESTION') return fail('WRONG_PHASE');
      resolveTurn(s);
      return ok(s);
    }

    case 'next': {
      if (action.by !== undefined && action.by !== s.hostId) return fail('NOT_HOST');
      if (s.phase === 'REVEAL') startNextTurn(s);
      else if (s.phase === 'ROUND_SCORE') startRound(s);
      else return fail('WRONG_PHASE');
      return ok(s);
    }
  }
}

function findPlayer(s: GameState, id: string): Player | undefined {
  return s.players.find((p) => p.id === id);
}

function isPermutation(slots: string[], hand: string[]): boolean {
  return slots.length === hand.length && new Set(slots).size === slots.length && slots.every((c) => hand.includes(c));
}

function canSwap(p: Player, target: Player, give: string, take: string): boolean {
  if (!p.slots || !target.slots) return false;
  return (
    p.slots.includes(give) && target.slots.includes(take) && !p.slots.includes(take) && !target.slots.includes(give)
  );
}

function participants(turn: Turn): string[] {
  return [turn.playerId, ...turn.stealers];
}

function allAnswered(turn: Turn): boolean {
  return participants(turn).every((id) => Object.hasOwn(turn.answers, id));
}

function startRound(s: GameState): void {
  s.round += 1;
  s.phase = 'BET';
  s.turn = null;
  s.swapLog = [];
  const categoryIds = s.pack.categories.map((c) => c.id);
  for (const p of s.players) {
    let dealt: string[];
    [dealt, s.rng] = shuffle(categoryIds, s.rng);
    p.hand = dealt.slice(0, s.settings.handSize);
    p.slots = null;
    p.swap = null;
    p.stealUsed = false;
  }
}

function maybeFinishSwaps(s: GameState): void {
  if (!s.players.every((p) => p.swap)) return;

  // Applied in seat order; a swap made impossible by an earlier one is skipped.
  for (const p of s.players) {
    if (!p.swap || p.swap === 'pass') continue;
    const { give, take, target: targetId } = p.swap;
    const target = findPlayer(s, targetId);
    if (!target || !p.slots || !target.slots || !canSwap(p, target, give, take)) continue;
    p.slots[p.slots.indexOf(give)] = take;
    target.slots[target.slots.indexOf(take)] = give;
    s.swapLog.push({ from: p.id, to: target.id, give, take });
  }

  s.queue = [];
  for (let value = 1; value <= s.settings.handSize; value++) {
    for (const p of s.players) s.queue.push({ playerId: p.id, value });
  }
  startNextTurn(s);
}

function startNextTurn(s: GameState): void {
  s.turn = null;
  const next = s.queue.shift();
  if (!next) {
    endRound(s);
    return;
  }
  const categoryId = findPlayer(s, next.playerId)?.slots?.[next.value - 1];
  if (!categoryId) {
    startNextTurn(s);
    return;
  }
  s.turn = {
    playerId: next.playerId,
    categoryId,
    value: next.value,
    questionId: pickQuestion(s, categoryId).id,
    stealers: [],
    answers: {},
    results: null,
  };
  s.phase = 'QUESTION';
}

function pickQuestion(s: GameState, categoryId: string): Question {
  const inCategory = s.pack.questions.filter((q) => q.category === categoryId);
  let fresh = inCategory.filter((q) => !s.usedQuestions.includes(q.id));
  if (!fresh.length) {
    // Category exhausted: allow repeats again.
    s.usedQuestions = s.usedQuestions.filter((id) => !inCategory.some((q) => q.id === id));
    fresh = inCategory;
  }
  let r: number;
  [r, s.rng] = nextFloat(s.rng);
  const question = fresh[Math.floor(r * fresh.length)]!;
  s.usedQuestions.push(question.id);
  return question;
}

function resolveTurn(s: GameState): void {
  const turn = s.turn!;
  const question = s.pack.questions.find((q) => q.id === turn.questionId)!;
  turn.results = {};
  for (const id of participants(turn)) {
    const p = findPlayer(s, id);
    if (!p) continue;
    const answer = turn.answers[id];
    const correct = answer !== undefined && isCorrect(question, answer);
    let delta: number;
    if (id === turn.playerId) delta = correct ? turn.value : 0;
    else delta = correct ? s.settings.stealWin : -Math.min(s.settings.stealLose, p.score);
    p.score += delta;
    turn.results[id] = { correct, delta };
  }
  s.phase = 'REVEAL';
}

function endRound(s: GameState): void {
  const best = Math.max(0, ...s.players.map((p) => p.score));
  if (best >= s.settings.targetScore || s.round >= s.settings.maxRounds) {
    s.phase = 'GAME_OVER';
    s.winnerIds = s.players.filter((p) => p.score === best).map((p) => p.id);
  } else {
    s.phase = 'ROUND_SCORE';
  }
}

function removePlayer(s: GameState, id: string): void {
  s.players = s.players.filter((p) => p.id !== id);
  s.queue = s.queue.filter((q) => q.playerId !== id);
  if (s.hostId === id) s.hostId = s.players[0]?.id ?? null;

  if (s.phase === 'BET') {
    if (s.players.every((p) => p.slots)) s.phase = 'SWAP';
  } else if (s.phase === 'SWAP') {
    maybeFinishSwaps(s);
  } else if (s.phase === 'QUESTION' && s.turn) {
    if (s.turn.playerId === id) {
      startNextTurn(s);
    } else {
      s.turn.stealers = s.turn.stealers.filter((x) => x !== id);
      delete s.turn.answers[id];
      if (allAnswered(s.turn)) resolveTurn(s);
    }
  }
}
