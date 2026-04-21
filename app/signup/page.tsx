import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/patient/dashboard");
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
            ✚
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Create Patient Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Book tests, track requests, get reports.
          </p>
        </header>
        <SignupForm />
        <p className="mt-5 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/" className="font-semibold text-[#1e7fd6]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}