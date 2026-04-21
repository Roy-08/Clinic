"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header({
  title,
  subtitle,
  back,
  accent = "#1e7fd6",
}: {
  title: string;
  subtitle?: string;
  back?: string;
  accent?: string;
}) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <header
      className="sticky top-0 z-30 border-b border-slate-200 bg-white"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.02)" }}
    >
      <div className="container-mobile flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          {back ? (
            <Link
              href={back}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            >
              ‹
            </Link>
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: accent }}
            >
              ✚
            </div>
          )}
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">{title}</div>
            {subtitle && (
              <div className="text-[11px] text-slate-500">{subtitle}</div>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}