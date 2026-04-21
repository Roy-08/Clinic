import type { RequestStatus } from "@/lib/types";

const labels: Record<RequestStatus, string> = {
  pending: "Pending Review",
  forwarded: "Sent to Lab",
  report_ready: "Report Ready",
  delivered: "Delivered",
  rejected: "Rejected",
};

const styles: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  forwarded: "bg-blue-100 text-blue-700 border-blue-200",
  report_ready: "bg-teal-100 text-teal-700 border-teal-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function statusLabel(status: RequestStatus) {
  return labels[status];
}