import { NextRequest, NextResponse } from "next/server";
import { GamesService } from "@/server/games/games.service";
import { AuthService } from "@/server/auth/auth.service";
import { z } from "zod";
import { prisma } from "@/server/prisma/prisma.client";

const readySchema = z.object({
  gameId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { gameId } = readySchema.parse(body);

    const updatedGame = await GamesService.setPlayerReady(gameId, decoded.userId);

    // If game started, we might want to emit a socket event here, but for now we just return state
    return NextResponse.json({ success: true, data: updatedGame });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
