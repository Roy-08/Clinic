import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getRequest } from "@/lib/sheets";
import AdminActions from "./AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getRequest(id);
  if (!r) notFound();

  return (
    <div className="container-mobile space-y-4 py-5">
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600"
      >
        ‹ Back
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[#1766ac]">
              Request #{r.id}
            </div>
            <div className="mt-1 text-base font-bold text-slate-900">
              {r.testName}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              ₹{r.price} · {new Date(r.createdAt).toLocaleString()}
            </div>
          </div>
          <StatusBadge status={r.status} />
        </div>
      </Card>

      <Card>
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Patient
        </div>
        <dl className="space-y-1.5 text-sm">
          <Row label="Name" value={r.patientName} />
          <Row label="Phone" value={r.patientPhone} />
          <Row label="Email" value={r.patientEmail} />
          {r.notes && <Row label="Notes" value={r.notes} />}
        </dl>
      </Card>

      {r.labNotes && (
        <Card>
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Lab Notes
          </div>
          <p className="text-sm text-slate-700">{r.labNotes}</p>
        </Card>
      )}

      <AdminActions request={r} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-right text-xs font-medium text-slate-800">
        {value}
      </dd>
    </div>
  );
}