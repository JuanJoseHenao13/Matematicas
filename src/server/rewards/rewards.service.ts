import { prisma } from "../prisma/prisma.client";
import { RewardType } from "@prisma/client";

export class RewardsService {
  static async grantCoins(userId: string, amount: number, reason: string, gameId?: string) {
    await prisma.$transaction([
      prisma.reward.create({
        data: {
          userId,
          gameId,
          type: RewardType.COINS,
          amount,
          claimed: true,
          reason
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } }
      })
    ]);
  }
}
