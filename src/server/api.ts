import { FastifyInstance } from 'fastify';
import { createInitialState } from '../engine/init';
import { enqueueZoneBuild } from '../engine/construction';
import { step } from '../engine/simulation';
import { Zone } from '../engine/types';
import { createGame, getState, saveState, addActions, getReplay } from './replay';

export async function registerApi(f: FastifyInstance) {
  f.post('/new-game', async (req, reply) => {
    const body = req.body as { seed?: string; mapWidth?: number; mapHeight?: number };
    const seed = body.seed || String(Date.now());
    const width = body.mapWidth || 60;
    const height = body.mapHeight || 35;
    const state = createInitialState(seed, { width, height });
    const gameId = createGame(seed, state);
    reply.send({ gameId, state });
  });

  f.post('/plan', async (req, reply) => {
    const body = req.body as {
      gameId: string;
      actions: Array<{ type: 'ZONE'; q: number; r: number; zone: Zone }>;
    };
    const state = getState(body.gameId);
    if (!state) return reply.code(400).send({ error: 'Unknown gameId' });
    for (const a of body.actions) {
      if (a.type === 'ZONE') {
        try {
          enqueueZoneBuild(state, a.q, a.r, a.zone);
        } catch (e) {
          const err = e as Error;
          return reply.code(400).send({ error: err.message });
        }
      }
    }
    addActions(body.gameId, state.turn, body.actions);
    reply.send({ state });
  });

  f.post('/end-turn', async (req, reply) => {
    const body = req.body as { gameId: string };
    const state = getState(body.gameId);
    if (!state) return reply.code(400).send({ error: 'Unknown gameId' });
    step(state);
    saveState(body.gameId, state);
    reply.send({ state });
  });

  f.get('/state', async (req, reply) => {
    const { gameId } = req.query as { gameId: string };
    const state = getState(gameId);
    if (!state) return reply.code(400).send({ error: 'Unknown gameId' });
    reply.send({ state });
  });

  f.get('/replay/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const rep = getReplay(id);
    if (!rep) return reply.code(404).send({ error: 'Not found' });
    reply.send(rep);
  });
}
