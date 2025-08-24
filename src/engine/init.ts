import { GameConfig, GameState } from './types';
import { createTiles } from './grid';
import { seedInitialDemand } from './demand';
import { hashSeed } from './rng';

export const DEFAULT_CONFIG: GameConfig = {
  constructionCapacityPerTurn: 1,
  minBuildTurns: { Residential: 1, Commercial: 1, Industrial: 1 },
  demandBounds: { min: 1, max: 100 },
  baseDemand: { residential: 10, commercial: 5, industrial: 5 },
};

export function createInitialState(
  seed: string,
  mapSize: { width: number; height: number },
  config: GameConfig = DEFAULT_CONFIG,
): GameState {
  const tiles = createTiles(mapSize.width, mapSize.height);
  const demand = seedInitialDemand(config);
  return {
    seed,
    turn: 0,
    year: 1,
    season: 0,
    mapWidth: mapSize.width,
    mapHeight: mapSize.height,
    tiles,
    demand,
    population: 0,
    meters: { happiness: 0.6, pollutionInverse: 0.6, trafficInverse: 0.6 },
    queue: [],
    rng: { cursor: hashSeed(seed) },
  };
}
