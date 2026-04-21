import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { listRequests } from "@/lib/sheets";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PatientRequestsPage() {
  const user = await getCurrentUser();
  const requests = user ? await listRequests({ patientId: user.id }) : [];

  return (
    <div className="container-mobile space-y-4 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">My Requests</h1>
          <p className="text-xs text-slate-500">
            Track status and download reports.
          </p>
        </div>
        <LinkButton href="/patient/tests" size="sm">
          + New
        </LinkButton>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No requests yet"
          desc="Book a medical test to see it here."
          action={
            <LinkButton href="/patient/tests" size="sm">
              Browse Tests
            </LinkButton>
          }
        />
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <Link key={r.id} href={`/patient/requests/${r.id}`}>
              <Card className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-slate-900">
                    {r.testName}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    #{r.id} · ₹{r.price}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    Booked {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={r.status} />
                  {r.status === "delivered" && (
                    <span className="text-[11px] font-semibold text-[#10b981]">
                      Report ready ↓
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}