import { FastifyPluginAsync } from 'fastify';
import { getUsdToPen } from '../services/exchangeRate';

const exchangeRoutes: FastifyPluginAsync = async (app) => {
  app.get('/usd-pen', async () => {
    const rate = await getUsdToPen();
    return { rate, pair: 'USD-PEN', source: 'dolar.pe', ts: new Date().toISOString() };
  });
};

export default exchangeRoutes;
