import { NextResponse } from "next/server";
import { commercialAlerts } from "@/lib/prototype-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: commercialAlerts,
  });
}
