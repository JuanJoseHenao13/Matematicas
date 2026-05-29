"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readySchema = exports.joinGameSchema = exports.createGameSchema = void 0;
const zod_1 = require("zod");
exports.createGameSchema = zod_1.z.object({
    opponentId: zod_1.z.string().optional(),
});
exports.joinGameSchema = zod_1.z.object({
    gameId: zod_1.z.string(),
});
exports.readySchema = zod_1.z.object({
    gameId: zod_1.z.string(),
});
