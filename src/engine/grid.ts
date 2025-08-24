import { GameState, Tile } from './types';

/** Creates a rectangular axial grid. */
export function createTiles(width: number, height: number): Tile[] {
  const tiles: Tile[] = [];
  for (let q = 0; q < width; q++) {
    for (let r = 0; r < height; r++) {
      tiles.push({ q, r, zone: 'None' });
    }
  }
  return tiles;
}

/** Returns neighboring axial coordinates. */
export function neighbors(q: number, r: number): Array<{ q: number; r: number }> {
  return [
    { q: q + 1, r },
    { q: q - 1, r },
    { q, r: r + 1 },
    { q, r: r - 1 },
    { q: q + 1, r: r - 1 },
    { q: q - 1, r: r + 1 },
  ];
}

/** Gets a tile at q,r if within bounds. */
export function getTile(state: GameState, q: number, r: number): Tile | undefined {
  return state.tiles.find((t) => t.q === q && t.r === r);
}
