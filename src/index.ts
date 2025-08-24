import Fastify from 'fastify';
import { registerApi } from './server/api';

async function start() {
  const app = Fastify();
  await registerApi(app);
  await app.listen({ port: 3000, host: '0.0.0.0' });
  console.log('Layline server listening on 3000');
}

start();
