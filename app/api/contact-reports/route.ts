import { NextResponse } from "next/server";
import { contactReports } from "@/lib/prototype-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: contactReports,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json(
    {
      success: true,
      message: "Reporte guardado en modo prototipo.",
      data: {
        id: "REP-PROTOTIPO",
        ...body,
      },
    },
    { status: 201 }
  );
}
