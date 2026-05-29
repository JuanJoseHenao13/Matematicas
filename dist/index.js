"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = exports.httpServerInstance = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
// Import routers (adjust paths if needed)
const index_1 = require("./auth/index");
const matchmaking_1 = require("./matchmaking");
const index_2 = require("./users/index");
const games_1 = require("./games");
// Initialize app and middleware
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount routers under their prefixes
app.use('/auth', index_1.router);
app.use('/matchmaking', matchmaking_1.router);
app.use('/users', index_2.router);
app.use('/api/game', games_1.router);
// Create HTTP server and Socket.IO instance
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: { origin: '*' } });
exports.httpServerInstance = httpServer;
exports.socketServer = io;
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
const startServer = (port) => {
    httpServer.listen(port, () => {
        console.log(`🚀 Server listening on http://localhost:${port}`);
    });
};
startServer(Number(PORT));
httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const newPort = Number(PORT) + 1;
        console.warn(`Port ${PORT} in use, switching to ${newPort}`);
        startServer(newPort);
    }
    else {
        console.error('Server error:', err);
    }
});
