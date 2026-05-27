import { NextRequest, NextResponse } from "next/server";
import { AchievementsService } from "@/server/rewards/achievements.service";
import { AuthService } from "@/server/auth/auth.service";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const achievements = await AchievementsService.getAchievements(decoded.userId);

    return NextResponse.json({ success: true, data: achievements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
