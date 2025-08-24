export type Zone = 'None' | 'Residential' | 'Commercial' | 'Industrial';

export interface Tile {
  q: number;
  r: number;
  zone: Zone;
  building?: {
    kind: Zone;
    complete: boolean;
    minBuildTurns: number;
    progress: number;
  };
  constructionQueued?: boolean;
}

export interface Demand {
  residential: number;
  commercial: number;
  industrial: number;
}

export interface ConstructionQueueItem {
  q: number;
  r: number;
  kind: Zone;
  priority: number;
}

export interface GameConfig {
  constructionCapacityPerTurn: number;
  minBuildTurns: Record<Exclude<Zone, 'None'>, number>;
  demandBounds: { min: number; max: number };
  baseDemand: Demand;
}

export interface GameState {
  seed: string;
  turn: number;
  year: number;
  season: number;
  mapWidth: number;
  mapHeight: number;
  tiles: Tile[];
  demand: Demand;
  population: number;
  meters: {
    happiness: number;
    pollutionInverse: number;
    trafficInverse: number;
  };
  queue: ConstructionQueueItem[];
  rng: { cursor: number };
}
