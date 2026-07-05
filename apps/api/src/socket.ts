import type { Server as HTTPServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { parse as parseCookie } from 'node:querystring';
import { Server as IOServer, type Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createPubSubClient } from './config/redis.js';
import { env } from './config/env.js';
import { matchChannel, type MatchEvent } from './events/publisher.js';
import { logger } from './shared/logger.js';
import type { AuthPayload } from './middlewares/auth.middleware.js';

const readCookieHeader = (raw: string | undefined) => {
  if (!raw) return {} as Record<string, string>;
  const out: Record<string, string> = {};
  raw.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (k) out[k] = decodeURIComponent(v.join('='));
  });
  return out;
};

export const initSocket = (httpServer: HTTPServer) => {
  const io = new IOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  const sub = createPubSubClient();
  try {
    const pub = createPubSubClient();
    io.adapter(createAdapter(pub, sub.duplicate()));
    logger.info('Socket.io + Redis adapter online');
  } catch (err) {
    logger.warn({ err }, 'Redis adapter indisponível — Socket.io em modo single-node');
  }

  // Consumer do canal de eventos de match: rebroadcast via rooms.
  void sub.subscribe(matchChannel).catch((err: Error) => {
    logger.warn({ err }, 'não inscrito no canal de match');
  });
  sub.on('message', (channel: string, raw: string) => {
    if (channel !== matchChannel) return;
    try {
      const evt = JSON.parse(raw) as MatchEvent;
      const eventName = evt.type;
      io.to(`match:public:${evt.liveToken}`).emit(eventName, evt);
      io.to(`match:admin:${evt.matchId}`).emit(eventName, evt);
    } catch (err) {
      logger.warn({ err, raw }, 'mensagem inválida em canal de match');
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join:public', (liveToken: string) => {
      if (typeof liveToken !== 'string' || liveToken.length < 4) return;
      void socket.join(`match:public:${liveToken}`);
    });

    socket.on('join:admin', (matchId: string) => {
      if (typeof matchId !== 'string') return;
      const cookies = readCookieHeader(socket.handshake.headers.cookie);
      const token = cookies['access_token'];
      if (!token) {
        socket.emit('auth:error', { code: 'MISSING_TOKEN' });
        return;
      }
      try {
        jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
      } catch {
        socket.emit('auth:error', { code: 'INVALID_TOKEN' });
        return;
      }
      void socket.join(`match:admin:${matchId}`);
    });
  });

  return io;
};
