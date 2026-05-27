import { NextResponse } from "next/server";
import { WeaponsService } from "@/server/weapons/weapons.service";

export async function GET() {
  try {
    const weapons = await WeaponsService.getActiveWeapons();
    
    return NextResponse.json({
      success: true,
      data: weapons
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
