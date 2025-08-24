import { GameState, Zone } from './types';
import { effectiveTileDemand } from './demand';
import { getTile } from './grid';
import { DEFAULT_CONFIG } from './init';

/** Adds a zoning build to the queue after validation. */
export function enqueueZoneBuild(state: GameState, q: number, r: number, kind: Zone): void {
  const tile = getTile(state, q, r);
  if (!tile) throw new Error('Tile out of bounds');
  if (tile.building?.complete) throw new Error('Cannot re-zone completed building');
  tile.zone = kind;
  tile.constructionQueued = true;
  tile.building = {
    kind,
    complete: false,
    minBuildTurns: DEFAULT_CONFIG.minBuildTurns[kind],
    progress: 0,
  };
  const priority = effectiveTileDemand(state, tile, kind);
  state.queue.push({ q, r, kind, priority });
}

/** Distributes construction capacity across queued items. */
export function applyConstruction(state: GameState): void {
  const capacity = DEFAULT_CONFIG.constructionCapacityPerTurn;
  state.queue.sort((a, b) => b.priority - a.priority);
  let remaining = capacity;
  for (const item of state.queue) {
    if (remaining <= 0) break;
    const tile = getTile(state, item.q, item.r);
    if (!tile || !tile.building) continue;
    tile.building.progress += 1 / tile.building.minBuildTurns;
    remaining -= 1;
    if (tile.building.progress >= 1) {
      tile.building.complete = true;
      tile.constructionQueued = false;
    }
  }
  state.queue = state.queue.filter((i) => {
    const t = getTile(state, i.q, i.r);
    return t?.constructionQueued;
  });
}
