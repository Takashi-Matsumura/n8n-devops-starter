"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SecurityReport = {
  id: string;
  source: string;
  severity: string;
  title: string;
  summary: string;
  status: string;
  createdAt: string;
};

const severityColors: Record<string, string> = {
  critical: "bg-red-600 text-white hover:bg-red-600",
  high: "bg-orange-500 text-white hover:bg-orange-500",
  moderate: "bg-yellow-500 text-black hover:bg-yellow-500",
  low: "bg-blue-500 text-white hover:bg-blue-500",
  info: "bg-gray-400 text-white hover:bg-gray-400",
};

const statusLabels: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

export default function Dashboard() {
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (severityFilter !== "all") params.set("severity", severityFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    const res = await fetch(`/api/reports?${params.toString()}`);
    const data = await res.json();
    setReports(data);
    setLoading(false);
  }, [severityFilter, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const counts = reports.reduce(
    (acc, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/test"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              Test Webhook
            </Link>
            <span className="text-sm text-muted-foreground">
              n8n DevOps Starter
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {(["critical", "high", "moderate", "low", "info"] as const).map(
            (sev) => (
              <Card key={sev}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {sev}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{counts[sev] || 0}</p>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        <div className="mb-4 flex items-center gap-4">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No reports found. Send a webhook to get started.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge className={severityColors[report.severity]}>
                        {report.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {report.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {report.source}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {statusLabels[report.status] || report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}
