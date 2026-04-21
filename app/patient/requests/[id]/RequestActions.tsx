"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LabRequest } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export default function RequestActions({ request }: { request: LabRequest }) {
  const router = useRouter();

  useEffect(() => {
    if (request.status === "delivered" || request.status === "rejected") return;
    const t = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(t);
  }, [request.status, router]);

  if (request.status === "delivered") {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          Your Report
        </div>
        <p className="mb-3 text-sm text-emerald-800">
          Your report is ready ({request.reportFileName || "report.pdf"}).
        </p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`/api/requests/${request.id}/report`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-300 bg-white text-sm font-semibold text-emerald-700"
          >
            View
          </a>
          <a
            href={`/api/requests/${request.id}/report`}
            download
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white"
          >
            Download
          </a>
        </div>
      </Card>
    );
  }

  if (request.status === "rejected") {
    return (
      <Card className="border-red-200 bg-red-50">
        <div className="mb-1 text-xs font-bold uppercase tracking-wider text-red-700">
          Request Rejected
        </div>
        <p className="text-sm text-red-800">
          Please contact the clinic for more information.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-700">
        In Progress
      </div>
      <p className="text-sm text-amber-800">
        Your request is being processed. This page refreshes automatically.
      </p>
    </Card>
  );
}