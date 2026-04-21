import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listRequests } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function MainLabDashboard() {
  const all = await listRequests({
    status: ["forwarded", "report_ready", "delivered"],
  });
  const queue = all.filter((r) => r.status === "forwarded");
  const uploaded = all.filter((r) => r.status === "report_ready");
  const done = all.filter((r) => r.status === "delivered");

  return (
    <div className="container-mobile space-y-5 py-5">
      <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Main Laboratory
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          Processing Queue
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Generate &amp; upload reports for forwarded requests.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <StatCard label="Queue" value={queue.length} color="#14b8a6" href="/mainlab/requests?filter=forwarded" />
        <StatCard label="Uploaded" value={uploaded.length} color="#1e7fd6" href="/mainlab/requests?filter=report_ready" />
        <StatCard label="Done" value={done.length} color="#10b981" href="/mainlab/requests?filter=delivered" />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Work Queue</h2>
          <Link href="/mainlab/requests" className="text-xs font-semibold text-teal-700">
            View all
          </Link>
        </div>
        {queue.length === 0 ? (
          <Card>
            <p className="text-center text-xs text-slate-500">
              Nothing in the queue. You&apos;re all caught up!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {queue.map((r) => (
              <Link key={r.id} href={`/mainlab/requests/${r.id}`}>
                <Card className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-slate-900">
                      {r.testName}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      #{r.id} · {r.patientName}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="text-center">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="mt-1 text-xl font-bold" style={{ color }}>
          {value}
        </div>
      </Card>
    </Link>
  );
}