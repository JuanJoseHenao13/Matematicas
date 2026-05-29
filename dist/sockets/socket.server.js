"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
            origin: "*",
        },
    });
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        socket.on("join_game", (gameId) => {
            socket.join(`game_${gameId}`);
            console.log(`Socket ${socket.id} joined game_${gameId}`);
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
