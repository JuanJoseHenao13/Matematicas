"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementsService = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
class AchievementsService {
    static async getAchievements(userId) {
        return prisma_client_1.prisma.achievement.findMany({
            include: {
                users: {
                    where: { userId }
                }
            }
        });
    }
    static async unlockAchievement(userId, code) {
        const achievement = await prisma_client_1.prisma.achievement.findUnique({ where: { code } });
        if (!achievement)
            return null;
        const exists = await prisma_client_1.prisma.userAchievement.findUnique({
            where: { userId_achievementId: { userId, achievementId: achievement.id } }
        });
        if (exists)
            return null;
        return prisma_client_1.prisma.userAchievement.create({
            data: {
                userId,
                achievementId: achievement.id
            }
        });
    }
}
exports.AchievementsService = AchievementsService;
