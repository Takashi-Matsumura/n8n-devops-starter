"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SecurityReport = {
  id: string;
  source: string;
  severity: string;
  title: string;
  summary: string;
  rawData: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const severityColors: Record<string, string> = {
  critical: "bg-red-600 text-white hover:bg-red-600",
  high: "bg-orange-500 text-white hover:bg-orange-500",
  moderate: "bg-yellow-500 text-black hover:bg-yellow-500",
  low: "bg-blue-500 text-white hover:bg-blue-500",
  info: "bg-gray-400 text-white hover:bg-gray-400",
};

const statusFlow: Record<string, string> = {
  new: "reviewed",
  reviewed: "resolved",
};

const statusLabels: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

export default function ReportDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    const res = await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    setReport(data);
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Report not found
      </div>
    );
  }

  let rawDataFormatted: string;
  try {
    rawDataFormatted = JSON.stringify(JSON.parse(report.rawData), null, 2);
  } catch {
    rawDataFormatted = report.rawData;
  }

  const nextStatus = statusFlow[report.status];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back to Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">
            n8n DevOps Starter
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">{report.title}</h1>
            <div className="flex items-center gap-3">
              <Badge className={severityColors[report.severity]}>
                {report.severity}
              </Badge>
              <Badge variant="outline">
                {statusLabels[report.status] || report.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {report.source}
              </span>
            </div>
          </div>
          {nextStatus && (
            <Button onClick={() => updateStatus(nextStatus)} disabled={updating}>
              {updating
                ? "Updating..."
                : `Mark as ${statusLabels[nextStatus]}`}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{report.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Report ID
                  </dt>
                  <dd className="font-mono">{report.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Source</dt>
                  <dd>{report.source}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Created
                  </dt>
                  <dd>{new Date(report.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Updated
                  </dt>
                  <dd>{new Date(report.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                <code>{rawDataFormatted}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
