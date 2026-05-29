"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
class LeaderboardService {
    static async updateLeaderboard(userId, isWin) {
        const eloChange = isWin ? 25 : -15;
        return prisma_client_1.prisma.leaderboard.update({
            where: { userId },
            data: {
                wins: isWin ? { increment: 1 } : undefined,
                losses: !isWin ? { increment: 1 } : undefined,
                elo: { increment: eloChange }
            }
        });
    }
    static async getTopPlayers(limit = 10) {
        return prisma_client_1.prisma.leaderboard.findMany({
            take: limit,
            orderBy: { elo: "desc" },
            include: {
                user: { select: { username: true } }
            }
        });
    }
}
exports.LeaderboardService = LeaderboardService;
