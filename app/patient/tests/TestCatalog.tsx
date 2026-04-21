"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import type { TestItem } from "@/lib/types";

export default function TestCatalog({ tests }: { tests: TestItem[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set(tests.map((t) => t.category));
    return ["All", ...Array.from(set)];
  }, [tests]);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return tests.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (!qn) return true;
      return (
        t.name.toLowerCase().includes(qn) ||
        t.category.toLowerCase().includes(qn) ||
        t.description.toLowerCase().includes(qn)
      );
    });
  }, [tests, q, cat]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search test (e.g. sugar, thyroid)"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#1e7fd6]"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((c) => {
          const active = c === cat;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold " +
                (active
                  ? "border-[#1e7fd6] bg-[#1e7fd6] text-white"
                  : "border-slate-200 bg-white text-slate-600")
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card>
            <p className="text-center text-xs text-slate-500">
              No tests match your search.
            </p>
          </Card>
        )}
        {filtered.map((t) => (
          <Link key={t.id} href={`/patient/book/${t.id}`}>
            <Card className="cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#1766ac]">
                    {t.category}
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-slate-900">
                    {t.name}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">
                    {t.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>⏱ {t.duration}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-base font-bold text-slate-900">
                    ₹{t.price}
                  </div>
                  <span className="rounded-lg bg-[#1e7fd6] px-2.5 py-1 text-[11px] font-semibold text-white">
                    Book
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}