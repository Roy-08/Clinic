import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listRequests } from "@/lib/sheets";
import { getCurrentUser } from "@/lib/auth";

export default async function PatientDashboard() {
  const user = await getCurrentUser();
  const requests = user
    ? await listRequests({ patientId: user.id })
    : [];
  const recent = requests.slice(0, 3);
  const pendingCount = requests.filter((r) =>
    ["pending", "forwarded", "report_ready"].includes(r.status)
  ).length;
  const readyCount = requests.filter((r) => r.status === "delivered").length;

  return (
    <div className="container-mobile space-y-5 py-5">
      <section
        className="rounded-2xl border border-[#c7e0f5] bg-gradient-to-br from-[#e8f2fc] to-white p-5"
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-[#1766ac]">
          Welcome back
        </div>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          {user?.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Book a test or track your reports.
        </p>
        <div className="mt-4 flex gap-2">
          <LinkButton href="/patient/tests" size="sm">
            + Book a Test
          </LinkButton>
          <LinkButton href="/patient/requests" variant="outline" size="sm">
            My Requests
          </LinkButton>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-slate-500">Active</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-400">In progress</div>
        </Card>
        <Card>
          <div className="text-xs text-slate-500">Ready</div>
          <div className="mt-1 text-2xl font-bold text-[#10b981]">
            {readyCount}
          </div>
          <div className="text-[11px] text-slate-400">Delivered reports</div>
        </Card>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Requests</h2>
          <Link
            href="/patient/requests"
            className="text-xs font-semibold text-[#1e7fd6]"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card>
            <p className="text-center text-xs text-slate-500">
              No requests yet. Book your first test →
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/patient/requests/${r.id}`}
                className="block"
              >
                <Card className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {r.testName}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      #{r.id} · ₹{r.price}
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