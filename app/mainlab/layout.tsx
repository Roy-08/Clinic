import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/ui/Header";
import { BottomNav } from "@/components/ui/BottomNav";

export default async function MainLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login/main");
  if (user.role !== "mainlab") redirect("/");

  return (
    <>
      <Header title="Main Laboratory" subtitle={user.email} accent="#14b8a6" />
      <main className="flex-1 pb-4">{children}</main>
      <BottomNav
        accent="#14b8a6"
        items={[
          { href: "/mainlab/dashboard", label: "Home", icon: "🏠" },
          { href: "/mainlab/requests", label: "Queue", icon: "🧪" },
          { href: "/mainlab/requests?filter=delivered", label: "History", icon: "📄" },
        ]}
      />
    </>
  );
}