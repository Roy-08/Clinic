"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export function BottomNav({ items, accent = "#1e7fd6" }: { items: NavItem[]; accent?: string }) {
  const pathname = usePathname() || "";
  return (
    <nav className="sticky bottom-0 z-30 border-t border-slate-200 bg-white">
      <div className="container-mobile flex items-stretch justify-around py-1">
        {items.map((it) => {
          const active =
            pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium"
              style={{ color: active ? accent : "#64748b" }}
            >
              <span className="text-lg leading-none">{it.icon}</span>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}