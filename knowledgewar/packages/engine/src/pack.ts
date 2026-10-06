import type { Pack } from './types';

/** Returns a list of problems; empty means the pack is usable. */
export function validatePack(pack: Pack): string[] {
  const errors: string[] = [];
  const categoryIds = new Set<string>();
  for (const c of pack.categories) {
    if (categoryIds.has(c.id)) errors.push(`duplicate category id ${c.id}`);
    categoryIds.add(c.id);
  }

  const questionIds = new Set<string>();
  const perCategory = new Map<string, number>();
  for (const q of pack.questions) {
    if (questionIds.has(q.id)) errors.push(`duplicate question id ${q.id}`);
    questionIds.add(q.id);
    if (!categoryIds.has(q.category)) errors.push(`${q.id}: unknown category ${q.category}`);
    perCategory.set(q.category, (perCategory.get(q.category) ?? 0) + 1);
    if (!q.prompt.trim()) errors.push(`${q.id}: empty prompt`);

    switch (q.type) {
      case 'choice':
        if (q.choices.length < 2) errors.push(`${q.id}: needs at least 2 choices`);
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length)
          errors.push(`${q.id}: answer index out of range`);
        break;
      case 'text':
        if (!q.answer.trim()) errors.push(`${q.id}: empty answer`);
        break;
      case 'number':
        if (!Number.isFinite(q.answer)) errors.push(`${q.id}: answer must be a number`);
        break;
      case 'order': {
        const sorted = [...q.answer].sort((a, b) => a - b);
        if (q.items.length < 2 || sorted.length !== q.items.length || sorted.some((v, i) => v !== i))
          errors.push(`${q.id}: answer must be a permutation of item indexes`);
        break;
      }
      default:
        errors.push(`${(q as { id: string }).id}: unsupported type ${(q as { type: string }).type}`);
    }
  }

  for (const id of categoryIds) {
    if (!perCategory.get(id)) errors.push(`category ${id} has no questions`);
  }
  return errors;
}
