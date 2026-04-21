import Link from "next/link";
import { notFound } from "next/navigation";
import { listTests } from "@/lib/sheets";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import BookingForm from "./BookingForm";

export default async function BookPage({
  params,
}: {
  params: Promise<{ testid: string }>;
}) {
  const { testid } = await params;
  const tests = await listTests();
  const test = tests.find((t) => t.id === testid);
  if (!test) notFound();
  const user = await getCurrentUser();

  return (
    <div className="container-mobile space-y-4 py-5">
      <Link
        href="/patient/tests"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600"
      >
        ‹ Back to tests
      </Link>

      <Card className="bg-gradient-to-br from-[#e8f2fc] to-white">
        <div className="text-xs font-semibold text-[#1766ac]">
          {test.category}
        </div>
        <div className="mt-1 text-base font-bold text-slate-900">
          {test.name}
        </div>
        <p className="mt-1 text-xs text-slate-600">{test.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Report in ⏱ {test.duration}
          </div>
          <div className="text-lg font-bold text-slate-900">
            ₹{test.price}
          </div>
        </div>
      </Card>

      <BookingForm
        testId={test.id}
        testName={test.name}
        price={test.price}
        defaultName={user?.name || ""}
      />
    </div>
  );
}