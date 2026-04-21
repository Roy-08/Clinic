import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { listRequests } from "@/lib/sheets";
import type { RequestStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const TABS: { key: "all" | RequestStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "forwarded", label: "Queue" },
  { key: "report_ready", label: "Uploaded" },
  { key: "delivered", label: "Done" },
];

export default async function MainLabRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter || "all";
  const all = await listRequests({
    status: ["forwarded", "report_ready", "delivered"],
  });
  const items =
    filter === "all"
      ? all
      : all.filter((r) => r.status === (filter as RequestStatus));

  return (
    <div className="container-mobile space-y-4 py-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Lab Requests</h1>
        <p className="text-xs text-slate-500">
          Requests forwarded by Clinic Admin.
        </p>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {TABS.map((t) => {
          const active = t.key === filter;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/mainlab/requests" : `/mainlab/requests?filter=${t.key}`}
              className={
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold " +
                (active
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-slate-200 bg-white text-slate-600")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="🧪"
          title="Empty"
          desc="No requests match this filter."
        />
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <Link key={r.id} href={`/mainlab/requests/${r.id}`}>
              <Card className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-900">
                    {r.testName}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    #{r.id} · {r.patientName} · {r.patientPhone}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {r.forwardedAt
                      ? `Forwarded ${new Date(r.forwardedAt).toLocaleString()}`
                      : new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}