import Fastify from 'fastify';
import jwtPlugin from './plugin/jwt';
import authRoutes from './routes/auth.routes';
import authenticatedRoutes from './routes/authenticated.routes';
import cors from './plugin/cors';
import cookiesPlugin from './plugin/cookies';

const app = Fastify({ logger: true });

app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

app.register(cors);
app.register(cookiesPlugin);
app.register(jwtPlugin);

app.register(authRoutes);
app.register(authenticatedRoutes);

export default app;
