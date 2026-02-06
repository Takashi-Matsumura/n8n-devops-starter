import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");

  const where: Record<string, string> = {};
  if (severity) where.severity = severity;
  if (status) where.status = status;

  const reports = await prisma.securityReport.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reports);
}
