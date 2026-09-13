import { defineConfig, loadEnv } from 'vite';
import { router } from './server/server.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    server: {
      port: 3000,
      open: true
    },
    plugins: [
      {
        name: 'integrated-api-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api')) {
              try {
                await router(req, res);
              } catch (err) {
                console.error('[API middleware error]', err);
                next(err);
              }
            } else {
              next();
            }
          });
        }
      }
    ]
  };
});
