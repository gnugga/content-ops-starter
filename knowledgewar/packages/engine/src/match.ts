import type { AnswerValue, Question } from './types';

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** Typos allowed for a free-text answer of this length. */
function allowedTypos(length: number): number {
  if (length >= 9) return 2;
  if (length >= 5) return 1;
  return 0;
}

export function isCorrect(question: Question, value: AnswerValue): boolean {
  switch (question.type) {
    case 'choice':
      return value === question.answer;
    case 'number':
      return typeof value === 'number' && Math.abs(value - question.answer) <= (question.tolerance ?? 0);
    case 'order':
      return (
        Array.isArray(value) &&
        value.length === question.answer.length &&
        value.every((v, i) => v === question.answer[i])
      );
    case 'text': {
      if (typeof value !== 'string') return false;
      const given = normalize(value);
      if (!given) return false;
      return [question.answer, ...(question.accept ?? [])].some((accepted) => {
        const target = normalize(accepted);
        return levenshtein(given, target) <= allowedTypos(target.length);
      });
    }
  }
}
