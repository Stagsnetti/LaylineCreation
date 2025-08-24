import { Demand, GameConfig, GameState, Tile, Zone } from './types';
import { neighbors, getTile } from './grid';

export function seedInitialDemand(config: GameConfig): Demand {
  return { ...config.baseDemand };
}

function clamp(config: GameConfig, v: number): number {
  return Math.min(config.demandBounds.max, Math.max(config.demandBounds.min, v));
}

/** Computes effective demand for a tile and zone kind. */
export function effectiveTileDemand(state: GameState, tile: Tile, kind: Zone): number {
  const key = kind.toLowerCase() as keyof Demand;
  let value = state.demand[key];
  // adjacency bonus
  for (const n of neighbors(tile.q, tile.r)) {
    const t = getTile(state, n.q, n.r);
    if (t && t.zone === kind) value += 2;
  }
  // center bonus for residential
  if (kind === 'Residential') {
    const centerQ = state.mapWidth / 2;
    const centerR = state.mapHeight / 2;
    const dist = Math.abs(tile.q - centerQ) + Math.abs(tile.r - centerR);
    const maxDist = Math.max(centerQ, centerR);
    value += Math.max(0, (maxDist - dist)) * 5 / maxDist;
  }
  return value;
}

/** Simple feedback R->C->I->R loop. */
export function applyDemandFeedback(state: GameState, config: GameConfig): void {
  const f = 0.05;
  state.demand.commercial = clamp(config, state.demand.commercial + state.population * f);
  state.demand.industrial = clamp(config, state.demand.industrial + state.demand.commercial * f);
  state.demand.residential = clamp(config, state.demand.residential + state.demand.industrial * f);
}
