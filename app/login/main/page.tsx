import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StaffLoginForm from "../StaffLoginForm";

export default async function MainLabLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "mainlab") redirect("/mainlab/dashboard");
  return (
    <main className="hero-gradient flex-1">
      <div className="container-mobile py-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600"
        >
          ‹ Back
        </Link>
        <header className="mb-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#14b8a6] text-2xl text-white">
            🔬
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Main Lab Sign In
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Process forwarded requests and upload reports.
          </p>
        </header>
        <StaffLoginForm
          role="mainlab"
          redirectTo="/mainlab/dashboard"
          hint="lab@medicare.com / lab123"
        />
      </div>
    </main>
  );
}