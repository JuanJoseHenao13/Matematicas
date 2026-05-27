import { NextResponse } from "next/server";
import { CharactersService } from "@/server/characters/characters.service";

export async function GET() {
  try {
    const characters = await CharactersService.getActiveCharacters();
    
    return NextResponse.json({
      success: true,
      data: characters
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
