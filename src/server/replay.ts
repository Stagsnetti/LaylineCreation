import { GameState } from '../engine/types';

type Action = Record<string, unknown>;

interface Replay {
  id: string;
  seed: string;
  actionsByTurn: Action[][];
  state: GameState;
}

let counter = 1;
const games = new Map<string, Replay>();

export function createGame(seed: string, state: GameState): string {
  const id = String(counter++);
  games.set(id, { id, seed, actionsByTurn: [], state });
  return id;
}

export function getState(id: string): GameState | undefined {
  return games.get(id)?.state;
}

export function saveState(id: string, state: GameState): void {
  const g = games.get(id);
  if (g) g.state = state;
}

export function addActions(id: string, turn: number, actions: Action[]): void {
  const g = games.get(id);
  if (!g) return;
  g.actionsByTurn[turn] = (g.actionsByTurn[turn] || []).concat(actions);
}

export function getReplay(id: string): { seed: string; actionsByTurn: Action[][] } | undefined {
  const g = games.get(id);
  if (!g) return undefined;
  return { seed: g.seed, actionsByTurn: g.actionsByTurn };
}
