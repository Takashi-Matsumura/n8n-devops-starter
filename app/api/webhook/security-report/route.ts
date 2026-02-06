import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_SOURCES = ["github-advisory", "ssl-check", "npm-audit"];
const VALID_SEVERITIES = ["critical", "high", "moderate", "low", "info"];

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!process.env.WEBHOOK_API_KEY || apiKey !== process.env.WEBHOOK_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { source, severity, title, summary, rawData } = body as {
    source?: string;
    severity?: string;
    title?: string;
    summary?: string;
    rawData?: unknown;
  };

  if (!source || !severity || !title || !summary) {
    return NextResponse.json(
      { error: "Missing required fields: source, severity, title, summary" },
      { status: 400 },
    );
  }

  if (!VALID_SOURCES.includes(source)) {
    return NextResponse.json(
      { error: `Invalid source. Must be one of: ${VALID_SOURCES.join(", ")}` },
      { status: 400 },
    );
  }

  if (!VALID_SEVERITIES.includes(severity)) {
    return NextResponse.json(
      {
        error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  const report = await prisma.securityReport.create({
    data: {
      source,
      severity,
      title,
      summary,
      rawData: rawData ? JSON.stringify(rawData) : "{}",
    },
  });

  return NextResponse.json({ success: true, id: report.id }, { status: 201 });
}
