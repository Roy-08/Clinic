"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LabRequest } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminActions({ request }: { request: LabRequest }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (request.status === "forwarded") {
      const t = setInterval(() => router.refresh(), 10_000);
      return () => clearInterval(t);
    }
  }, [request.status, router]);

  async function act(action: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
      } else {
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {request.reportDataUrl && (
        <Card className="border-teal-200 bg-teal-50">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-teal-700">
            Report from Lab
          </div>
          <p className="mb-3 text-sm text-teal-800">
            {request.reportFileName || "report.pdf"}
          </p>
          <a
            href={`/api/requests/${request.id}/report`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-teal-300 bg-white px-4 text-sm font-semibold text-teal-700"
          >
            Preview Report
          </a>
        </Card>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {request.status === "pending" && (
        <Card>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Action Required
          </div>
          <p className="mb-3 text-sm text-slate-700">
            Forward this request to the Main Lab for processing, or reject it.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => act("reject")}
              disabled={loading}
            >
              Reject
            </Button>
            <Button onClick={() => act("forward")} disabled={loading}>
              {loading ? "..." : "Forward to Lab"}
            </Button>
          </div>
        </Card>
      )}

      {request.status === "forwarded" && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            Waiting for Lab
          </div>
          <p className="text-sm text-blue-800">
            Main Lab is preparing the report. Auto-refresh enabled.
          </p>
        </Card>
      )}

      {request.status === "report_ready" && (
        <Card>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Release to Patient
          </div>
          <p className="mb-3 text-sm text-slate-700">
            Review the report above, then release it to the patient.
          </p>
          <Button onClick={() => act("release")} disabled={loading}>
            {loading ? "..." : "Release Report to Patient"}
          </Button>
        </Card>
      )}

      {request.status === "delivered" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            Completed
          </div>
          <p className="text-sm text-emerald-800">
            Report delivered to patient on{" "}
            {request.releasedAt &&
              new Date(request.releasedAt).toLocaleString()}
            .
          </p>
        </Card>
      )}

      {request.status === "rejected" && (
        <Card className="border-red-200 bg-red-50">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider text-red-700">
            Rejected
          </div>
          <p className="text-sm text-red-800">
            This request has been rejected.
          </p>
        </Card>
      )}
    </div>
  );
}