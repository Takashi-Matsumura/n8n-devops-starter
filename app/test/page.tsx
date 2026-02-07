"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Preset = {
  name: string;
  severity: string;
  source: string;
  title: string;
  summary: string;
  rawData: Record<string, unknown>;
};

const presets: Preset[] = [
  {
    name: "Critical: GitHub Advisory",
    severity: "critical",
    source: "github-advisory",
    title: "CVE-2025-1234 - Remote Code Execution in express",
    summary:
      "A critical vulnerability allows remote code execution via crafted HTTP request headers in express@4.17.1. Upgrade to express@4.18.3 or later.",
    rawData: {
      cve: "CVE-2025-1234",
      package: "express",
      affectedVersion: "< 4.18.3",
      fixedVersion: "4.18.3",
    },
  },
  {
    name: "High: npm audit",
    severity: "high",
    source: "npm-audit",
    title: "Prototype Pollution in lodash",
    summary:
      "lodash@4.17.20 has a known high-severity prototype pollution vulnerability. Update to lodash@4.17.21.",
    rawData: {
      package: "lodash",
      currentVersion: "4.17.20",
      advisoryUrl: "https://github.com/advisories/GHSA-jf85-cpcp-j695",
    },
  },
  {
    name: "Moderate: SSL証明書期限切れ警告",
    severity: "moderate",
    source: "ssl-check",
    title: "SSL certificate expiring in 14 days",
    summary:
      "The SSL certificate for api.example.com will expire on 2025-08-01. Renew the certificate to prevent service disruption.",
    rawData: {
      domain: "api.example.com",
      expiresAt: "2025-08-01T00:00:00Z",
      daysRemaining: 14,
    },
  },
  {
    name: "Low: npm audit (低リスク)",
    severity: "low",
    source: "npm-audit",
    title: "Regular Expression Denial of Service in semver",
    summary:
      "semver@5.7.1 is vulnerable to ReDoS via long version strings. Impact is minimal for most use cases. Upgrade to semver@5.7.2.",
    rawData: {
      package: "semver",
      currentVersion: "5.7.1",
      fixedVersion: "5.7.2",
    },
  },
  {
    name: "Info: SSL チェック正常",
    severity: "info",
    source: "ssl-check",
    title: "SSL certificate is valid",
    summary:
      "The SSL certificate for app.example.com is valid and expires in 245 days. No action required.",
    rawData: {
      domain: "app.example.com",
      expiresAt: "2026-10-15T00:00:00Z",
      daysRemaining: 245,
    },
  },
];

const severityColors: Record<string, string> = {
  critical: "bg-red-600 text-white hover:bg-red-600",
  high: "bg-orange-500 text-white hover:bg-orange-500",
  moderate: "bg-yellow-500 text-black hover:bg-yellow-500",
  low: "bg-blue-500 text-white hover:bg-blue-500",
  info: "bg-gray-400 text-white hover:bg-gray-400",
};

type SendResult = {
  preset: string;
  success: boolean;
  message: string;
};

export default function TestWebhookPage() {
  const [sending, setSending] = useState<string | null>(null);
  const [results, setResults] = useState<SendResult[]>([]);

  async function sendPreset(preset: Preset) {
    setSending(preset.name);
    try {
      const res = await fetch("/api/webhook/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: preset.source,
          severity: preset.severity,
          title: preset.title,
          summary: preset.summary,
          rawData: preset.rawData,
        }),
      });
      const data = await res.json();
      setResults((prev) => [
        {
          preset: preset.name,
          success: res.ok,
          message: res.ok
            ? `Report created (ID: ${data.id})`
            : data.error || "Send failed",
        },
        ...prev,
      ]);
    } catch (err) {
      setResults((prev) => [
        {
          preset: preset.name,
          success: false,
          message: err instanceof Error ? err.message : "Network error",
        },
        ...prev,
      ]);
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Test Webhook</h1>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-6 text-muted-foreground">
          Send test data to the webhook endpoint. Click a preset to create a
          security report.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => (
            <Card key={preset.name} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge className={severityColors[preset.severity]}>
                    {preset.severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {preset.source}
                  </span>
                </div>
                <CardTitle className="mt-2 text-base">{preset.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {preset.summary}
                </p>
                <Button
                  onClick={() => sendPreset(preset)}
                  disabled={sending !== null}
                  className="w-full"
                  variant="outline"
                >
                  {sending === preset.name ? "Sending..." : "Send"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Results</h2>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-md border px-4 py-3 text-sm ${
                    r.success
                      ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                      : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                  }`}
                >
                  <span className="font-medium">{r.preset}</span>: {r.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
