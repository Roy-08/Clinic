import type { ReactNode } from "react";

export function EmptyState({
  icon = "📭",
  title,
  desc,
  action,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mb-3 text-4xl">{icon}</div>
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      {desc && <p className="mt-1 text-xs text-slate-500">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}