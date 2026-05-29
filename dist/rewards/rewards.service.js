"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsService = void 0;
const prisma_client_1 = require("../prisma/prisma.client");
const client_1 = require("@prisma/client");
class RewardsService {
    static async grantCoins(userId, amount, reason, gameId) {
        await prisma_client_1.prisma.$transaction([
            prisma_client_1.prisma.reward.create({
                data: {
                    userId,
                    gameId,
                    type: client_1.RewardType.COINS,
                    amount,
                    claimed: true,
                    reason
                }
            }),
            prisma_client_1.prisma.user.update({
                where: { id: userId },
                data: { coins: { increment: amount } }
            })
        ]);
    }
}
exports.RewardsService = RewardsService;
