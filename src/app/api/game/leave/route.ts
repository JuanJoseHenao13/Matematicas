import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/server/auth/auth.service";
import { prisma } from "@/server/prisma/prisma.client";
import { z } from "zod";

const leaveSchema = z.object({
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
    const { gameId } = leaveSchema.parse(body);

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true }
    });

    if (!game) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    // Set status to cancelled or finished and the other player as winner
    const opponent = game.players.find(p => p.userId !== decoded.userId);
    
    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: "CANCELLED",
        winnerUserId: opponent ? opponent.userId : null
      }
    });

    return NextResponse.json({ success: true, data: { status: "CANCELLED" } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
