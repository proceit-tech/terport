import { NextResponse } from "next/server";
import { integrations } from "@/lib/prototype-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: integrations,
  });
}
