import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const apiKey = process.env.WEBHOOK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "WEBHOOK_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const origin = request.nextUrl.origin;

  const res = await fetch(`${origin}/api/webhook/security-report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
