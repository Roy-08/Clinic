import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import PatientLoginForm from "./_components/PatientLoginForm";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "patient") redirect("/patient/dashboard");
    if (user.role === "admin") redirect("/admin/dashboard");
    if (user.role === "mainlab") redirect("/mainlab/dashboard");
  }

  return (
    <main className="hero-gradient flex-1">
      <div className="container-mobile py-8">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e7fd6] text-3xl text-white shadow-md">
            ✚
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            MediCare Clinic
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Book medical tests &amp; get reports online
          </p>
        </header>

        <PatientLoginForm />

        <p className="mt-5 text-center text-xs text-slate-500">
          New here?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#1e7fd6]"
          >
            Create a patient account
          </Link>
        </p>

       

        <p className="mt-8 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} MediCare Clinic. All tests, reports &amp;
          data are handled securely.
        </p>
      </div>
    </main>
  );
}
