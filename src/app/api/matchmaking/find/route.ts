import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/server/auth/auth.service";
import { MatchmakingService } from "@/server/games/matchmaking.service";

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const result = await MatchmakingService.findMatch(decoded.userId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { headers: CORS_HEADERS }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
