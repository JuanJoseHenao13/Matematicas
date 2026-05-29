"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStatus = void 0;
var GameStatus;
(function (GameStatus) {
    GameStatus["WAITING"] = "WAITING";
    GameStatus["READY"] = "READY";
    GameStatus["IN_PROGRESS"] = "IN_PROGRESS";
    GameStatus["FINISHED"] = "FINISHED";
    GameStatus["CANCELLED"] = "CANCELLED";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
