import type { Server as HTTPServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createPubSubClient } from './config/redis.js';
import { env } from './config/env.js';
import { logger } from './shared/logger.js';

export const initSocket = (httpServer: HTTPServer) => {
  const io = new IOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  try {
    const pub = createPubSubClient();
    const sub = createPubSubClient();
    io.adapter(createAdapter(pub, sub));
    logger.info('Socket.io + Redis adapter online');
  } catch (err) {
    logger.warn({ err }, 'Redis adapter indisponivel — Socket.io em modo single-node');
  }

  io.on('connection', (socket) => {
    socket.on('join:public', (liveToken: string) => {
      if (typeof liveToken !== 'string' || liveToken.length < 4) return;
      void socket.join(`match:public:${liveToken}`);
    });

    // Rooms admin serao autenticados na Fase 3 real via cookie/handshake
    socket.on('join:admin', (matchId: string) => {
      if (typeof matchId !== 'string') return;
      void socket.join(`match:admin:${matchId}`);
    });

    socket.on('disconnect', () => {
      // no-op
    });
  });

  return io;
};
