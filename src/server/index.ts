import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import routers (adjust paths if needed)
import { router as authRouter } from './auth/index';
import { router as matchmakingRouter } from './matchmaking';
import { router as usersRouter } from './users/index';
import { router as gamesRouter } from './games/index';
// Add other routers as needed

const app = express();
app.use(cors());
app.use(express.json());

// Mount routers under their prefixes
app.use('/auth', authRouter);
app.use('/matchmaking', matchmakingRouter);
app.use('/users', usersRouter);
app.use('/games', gamesRouter);
// Add more mounts here if you have other modules

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

// If you have socket event handlers, import and init them here
// import { initSockets } from './sockets';
// initSockets(io);

const PORT = process.env.PORT || 8000;
const startServer = (port: number) => {
  httpServer.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
  });
};

startServer(Number(PORT));

httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = Number(PORT) + 1;
    console.warn(`Port ${PORT} in use, switching to ${newPort}`);
    startServer(newPort);
  } else {
    console.error('Server error:', err);
  }
});
