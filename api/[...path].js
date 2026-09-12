import { router } from '../server/server.js';

export default async function handler(req, res) {
  return router(req, res);
}
