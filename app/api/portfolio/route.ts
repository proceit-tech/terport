import { NextResponse } from "next/server";
import { portfolioRows } from "@/lib/prototype-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: portfolioRows,
  });
}
