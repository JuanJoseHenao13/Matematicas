import { prisma } from "../prisma/prisma.client";

export class LeaderboardService {
  static async updateLeaderboard(userId: string, isWin: boolean) {
    const eloChange = isWin ? 25 : -15;

    return prisma.leaderboard.update({
      where: { userId },
      data: {
        wins: isWin ? { increment: 1 } : undefined,
        losses: !isWin ? { increment: 1 } : undefined,
        elo: { increment: eloChange }
      }
    });
  }

  static async getTopPlayers(limit: number = 10) {
    return prisma.leaderboard.findMany({
      take: limit,
      orderBy: { elo: "desc" },
      include: {
        user: { select: { username: true } }
      }
    });
  }
}
