/** mulberry32: tiny seeded PRNG. Returns [float in 0..1, next state]. */
export function nextFloat(state: number): [number, number] {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

/** Fisher–Yates shuffle. Returns [shuffled copy, next state]. */
export function shuffle<T>(items: readonly T[], state: number): [T[], number] {
  const out = [...items];
  let s = state;
  for (let i = out.length - 1; i > 0; i--) {
    let r: number;
    [r, s] = nextFloat(s);
    const j = Math.floor(r * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return [out, s];
}
