import type { RequestStatus } from "@/lib/types";

const steps: { key: RequestStatus | "created"; label: string }[] = [
  { key: "created", label: "Request Booked" },
  { key: "pending", label: "Admin Review" },
  { key: "forwarded", label: "Processing at Lab" },
  { key: "report_ready", label: "Report Under Review" },
  { key: "delivered", label: "Report Delivered" },
];

function stepIndex(status: RequestStatus): number {
  switch (status) {
    case "pending":
      return 1;
    case "forwarded":
      return 2;
    case "report_ready":
      return 3;
    case "delivered":
      return 4;
    case "rejected":
      return -1;
    default:
      return 0;
  }
}

export default function RequestTimeline({
  status,
  createdAt,
  forwardedAt,
  reportReadyAt,
  releasedAt,
}: {
  status: RequestStatus;
  createdAt: string;
  forwardedAt?: string;
  reportReadyAt?: string;
  releasedAt?: string;
}) {
  const active = stepIndex(status);

  const timestamps: Record<string, string | undefined> = {
    created: createdAt,
    pending: createdAt,
    forwarded: forwardedAt,
    report_ready: reportReadyAt,
    delivered: releasedAt,
  };

  if (status === "rejected") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
        This request was rejected. Please contact the clinic.
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const done = i <= active;
        const current = i === active;
        const ts = timestamps[s.key];
        return (
          <li key={s.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold " +
                  (done
                    ? "border-[#1e7fd6] bg-[#1e7fd6] text-white"
                    : "border-slate-300 bg-white text-slate-400")
                }
              >
                {done ? "✓" : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={
                    "mt-1 w-0.5 flex-1 " +
                    (i < active ? "bg-[#1e7fd6]" : "bg-slate-200")
                  }
                />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div
                className={
                  "text-sm font-semibold " +
                  (current
                    ? "text-[#1766ac]"
                    : done
                      ? "text-slate-900"
                      : "text-slate-500")
                }
              >
                {s.label}
              </div>
              {ts && (
                <div className="text-[11px] text-slate-400">
                  {new Date(ts).toLocaleString()}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}