import { GameState } from './types';
import { applyConstruction } from './construction';
import { applyDemandFeedback, effectiveTileDemand } from './demand';
import { createRng } from './rng';
import { DEFAULT_CONFIG } from './init';

const POP_PER_BUILDING = 10;
const DEMAND_STEP = 5;

/** Runs the half-season update. */
export function step(state: GameState): GameState {
  const rng = createRng(state.rng.cursor);
  // 1. Sort zones by demand
  const tiles = state.tiles.filter((t) => t.zone !== 'None');
  tiles.sort(
    (a, b) =>
      effectiveTileDemand(state, b, b.zone) - effectiveTileDemand(state, a, a.zone),
  );
  // 2. Populate highest demand zones
  const res = tiles.filter((t) => t.zone === 'Residential' && t.building?.complete);
  state.population = res.length * POP_PER_BUILDING;
  // 3. Adjust demand
  const supply = {
    residential: res.length * 10,
    commercial:
      tiles.filter((t) => t.zone === 'Commercial' && t.building?.complete).length * 10,
    industrial:
      tiles.filter((t) => t.zone === 'Industrial' && t.building?.complete).length * 10,
  };
  const clamp = (v: number) =>
    Math.min(DEFAULT_CONFIG.demandBounds.max, Math.max(DEFAULT_CONFIG.demandBounds.min, v));
  for (const k of ['residential', 'commercial', 'industrial'] as const) {
    const d = state.demand[k];
    const s = supply[k];
    state.demand[k] = s >= d ? clamp(d - DEMAND_STEP) : clamp(d + DEMAND_STEP);
  }
  // 4. Apply construction
  applyConstruction(state);
  // 5. Recalculate demand via feedback
  applyDemandFeedback(state, DEFAULT_CONFIG);
  // 6. Update calendar and RNG
  state.turn += 1;
  state.season = Math.floor(state.turn / 2) % 4;
  state.year = Math.floor(state.turn / 8) + 1;
  state.rng.cursor = rng.state;
  return state;
}

/** Placeholder score calculation. */
export function score(state: GameState): number {
  const avg =
    (state.meters.happiness +
      state.meters.pollutionInverse +
      state.meters.trafficInverse) /
    3;
  return avg * state.population;
}
