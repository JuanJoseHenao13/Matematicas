import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import routers (adjust paths if needed)
import { router as authRouter } from './auth/index';
import { router as matchmakingRouter } from './matchmaking';
import { router as usersRouter } from './users/index';
import { router as gameRouter } from './games';

// Initialize app and middleware
const app = express();
app.use(cors());
app.use(express.json());

// Mount routers under their prefixes
app.use('/auth', authRouter);
app.use('/matchmaking', matchmakingRouter);
app.use('/users', usersRouter);
app.use('/api/game', gameRouter);

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });

export const httpServerInstance = httpServer;
export const socketServer = io;

// Socket.io connection handling
io.on('connection', (socket) => {
  // Client can join a specific game room
  socket.on('joinGame', ({ gameId }) => {
    if (gameId) {
      socket.join(gameId);
      console.log(`Socket ${socket.id} joined room ${gameId}`);
    }
  });
});

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
