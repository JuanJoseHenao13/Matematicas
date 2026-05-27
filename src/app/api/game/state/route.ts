import { NextRequest, NextResponse } from "next/server";
import { GamesService } from "@/server/games/games.service";
import { AuthService } from "@/server/auth/auth.service";
import { z } from "zod";

const stateSchema = z.object({
  gameId: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");
    
    if (!gameId) {
      return NextResponse.json({ success: false, error: "gameId is required" }, { status: 400 });
    }

    const state = await GamesService.getGameState(gameId);

    if (!state) {
       return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: state });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
