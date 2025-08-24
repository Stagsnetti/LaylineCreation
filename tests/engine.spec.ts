import { describe, it, expect } from 'vitest';
import { createInitialState } from '../src/engine/init';
import { enqueueZoneBuild } from '../src/engine/construction';
import { step } from '../src/engine/simulation';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

describe('engine', () => {
  it('is deterministic for same seed and actions', () => {
    const s1 = createInitialState('seed', { width: 5, height: 5 });
    const s2 = createInitialState('seed', { width: 5, height: 5 });
    enqueueZoneBuild(s1, 2, 2, 'Residential');
    enqueueZoneBuild(s2, 2, 2, 'Residential');
    step(s1);
    step(s2);
    expect(clone(s1)).toEqual(clone(s2));
  });

  it('demand stays within bounds and construction advances', () => {
    const state = createInitialState('seed', { width: 5, height: 5 });
    enqueueZoneBuild(state, 2, 2, 'Residential');
    step(state);
    const tile = state.tiles.find((t) => t.q === 2 && t.r === 2);
    expect(tile?.building?.progress).toBeGreaterThan(0);
    for (const v of Object.values(state.demand)) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('population increases only after completion', () => {
    const state = createInitialState('seed', { width: 5, height: 5 });
    enqueueZoneBuild(state, 2, 2, 'Residential');
    step(state);
    expect(state.population).toBe(0); // building completes but not populated yet
    step(state);
    expect(state.population).toBeGreaterThan(0);
  });

  it('higher demand zones build first', () => {
    const state = createInitialState('seed', { width: 5, height: 5 });
    enqueueZoneBuild(state, 2, 2, 'Residential'); // center high demand
    enqueueZoneBuild(state, 0, 0, 'Residential'); // edge lower demand
    step(state);
    const center = state.tiles.find((t) => t.q === 2 && t.r === 2)?.building?.progress || 0;
    const edge = state.tiles.find((t) => t.q === 0 && t.r === 0)?.building?.progress || 0;
    expect(center).toBeGreaterThan(edge);
  });
});
