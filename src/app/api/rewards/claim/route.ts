import { NextRequest, NextResponse } from "next/server";
import { RewardsService } from "@/server/rewards/rewards.service";
import { AuthService } from "@/server/auth/auth.service";
import { z } from "zod";

const claimSchema = z.object({
  amount: z.number().positive(),
  reason: z.string(),
  gameId: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { amount, reason, gameId } = claimSchema.parse(body);

    await RewardsService.grantCoins(decoded.userId, amount, reason, gameId);

    return NextResponse.json({ success: true, data: { message: "Rewards claimed successfully" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
