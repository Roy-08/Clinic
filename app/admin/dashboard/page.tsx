import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listRequests } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const all = await listRequests();
  const pending = all.filter((r) => r.status === "pending");
  const forwarded = all.filter((r) => r.status === "forwarded");
  const reportReady = all.filter((r) => r.status === "report_ready");
  const delivered = all.filter((r) => r.status === "delivered");

  const recent = all.slice(0, 5);

  return (
    <div className="container-mobile space-y-5 py-5">
      <section className="rounded-2xl border border-[#c7e0f5] bg-gradient-to-br from-[#e8f2fc] to-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#1766ac]">
          Clinic Admin
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          Request Control
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review, forward to lab, and release reports to patients.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="New" value={pending.length} color="#f59e0b" href="/admin/requests?filter=pending" />
        <StatCard label="At Lab" value={forwarded.length} color="#1e7fd6" href="/admin/requests?filter=forwarded" />
        <StatCard label="To Release" value={reportReady.length} color="#14b8a6" href="/admin/requests?filter=report_ready" />
        <StatCard label="Delivered" value={delivered.length} color="#10b981" href="/admin/requests?filter=delivered" />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
          <Link href="/admin/requests" className="text-xs font-semibold text-[#1e7fd6]">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card>
            <p className="text-center text-xs text-slate-500">No requests yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <Link key={r.id} href={`/admin/requests/${r.id}`}>
                <Card className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">
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
      <Card>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold" style={{ color }}>
          {value}
        </div>
      </Card>
    </Link>
  );
}