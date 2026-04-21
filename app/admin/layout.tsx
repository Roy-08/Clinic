import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login/admin");
  if (user.role !== "admin") redirect("/");

  return (
    <>
      <Header title="Clinic Admin" subtitle={user.email} />
      <main className="flex-1 pb-4">{children}</main>
      <BottomNav
        items={[
          { href: "/admin/dashboard", label: "Home", icon: "🏠" },
          { href: "/admin/requests", label: "Requests", icon: "📋" },
          { href: "/admin/requests?filter=report_ready", label: "Reports", icon: "📄" },
        ]}
      />
    </>
  );
}