/** Simple xorshift32 RNG for determinism. */
export interface Rng {
  next(): number;
  nextInt(max: number): number;
  state: number;
}

/** Hashes a string seed to a 32-bit number. */
export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createRng(cursor: number): Rng {
  let state = cursor >>> 0;
  function next(): number {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  }
  return {
    next,
    nextInt(max: number) {
      return Math.floor(next() * max);
    },
    get state() {
      return state >>> 0;
    },
  };
}
