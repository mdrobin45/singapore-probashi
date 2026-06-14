import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/components/admin-sidebar";
import { redirect } from "next/navigation";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MODERATOR"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (!ADMIN_ROLES.includes(session.role)) redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-muted">
      <AdminSidebar
        userName={session.email.split("@")[0]}
        userRole={session.role}
        userEmail={session.email}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
