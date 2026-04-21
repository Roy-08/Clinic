import { listTests } from "@/lib/sheets";
import TestCatalog from "./TestCatalog";

export default async function TestsPage() {
  const tests = await listTests();
  return (
    <div className="container-mobile space-y-4 py-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Browse Tests</h1>
        <p className="text-xs text-slate-500">
          Search and book any medical test.
        </p>
      </div>
      <TestCatalog tests={tests} />
    </div>
  );
}