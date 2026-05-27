import { prisma } from "../prisma/prisma.client";

export class AchievementsService {
  static async getAchievements(userId: string) {
    return prisma.achievement.findMany({
      include: {
        users: {
          where: { userId }
        }
      }
    });
  }

  static async unlockAchievement(userId: string, code: string) {
    const achievement = await prisma.achievement.findUnique({ where: { code } });
    if (!achievement) return null;

    const exists = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } }
    });

    if (exists) return null;

    return prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id
      }
    });
  }
}
