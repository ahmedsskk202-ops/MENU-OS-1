import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminProviders } from "@/components/providers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <AdminProviders>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <AdminSidebar />
        {/* Sound + pop-up for every alert, on whichever screen the person is on. */}
        <NotificationCenter />
        <div className="flex-1 min-w-0 flex flex-col">
          <AdminTopBar />
          <main className="flex-1 min-w-0">
          {/* Per-route permission gate. The API routes are the real boundary; this
              stops a URL typed by hand from rendering a screen the user cannot use. */}
          <AdminGuard>{children}</AdminGuard>
          </main>
        </div>
      </div>
    </AdminProviders>
  );
}
