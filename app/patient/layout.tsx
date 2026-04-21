import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "patient") redirect("/");

  return (
    <>
      <Header title="MediCare" subtitle={`Hi, ${user.name}`} />
      <main className="flex-1 pb-4">{children}</main>
      <BottomNav
        items={[
          { href: "/patient/dashboard", label: "Home", icon: "🏠" },
          { href: "/patient/tests", label: "Tests", icon: "🧪" },
          { href: "/patient/requests", label: "Requests", icon: "📋" },
        ]}
      />
    </>
  );
}