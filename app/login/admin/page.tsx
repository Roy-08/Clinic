import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import StaffLoginForm from "../StaffLoginForm";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin/dashboard");
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
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e7fd6] text-2xl text-white">
            🏥
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Clinic Admin Sign In
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review incoming requests and coordinate with the lab.
          </p>
        </header>
        <StaffLoginForm
          role="admin"
          redirectTo="/admin/dashboard"
          hint="admin@medicare.com / admin123"
        />
      </div>
    </main>
  );
}