import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: [],
      message: "commercial-groups API pending implementation.",
    },
    {
      status: 200,
    }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "commercial-groups API pending implementation.",
    },
    {
      status: 501,
    }
  );
}
