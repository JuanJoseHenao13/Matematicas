import { NextRequest, NextResponse } from "next/server";
import { GamesService } from "@/server/games/games.service";
import { AuthService } from "@/server/auth/auth.service";
import { z } from "zod";

const createSchema = z.object({
  opponentId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { opponentId } = createSchema.parse(body);

    const game = await GamesService.createGame(decoded.userId, opponentId);

    return NextResponse.json({ success: true, data: game });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
