import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/server/auth/auth.service";
import { UsersService } from "@/server/users/users.service";
import { z } from "zod";

const selectCharacterSchema = z.object({
  characterId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await req.json();
    const { characterId } = selectCharacterSchema.parse(body);

    const updatedUser = await UsersService.selectCharacter(decoded.userId, characterId);

    return NextResponse.json({
      success: true,
      data: updatedUser
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
