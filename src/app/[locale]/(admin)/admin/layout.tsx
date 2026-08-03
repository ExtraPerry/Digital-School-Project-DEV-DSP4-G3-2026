import { redirect } from "@/i18n/navigation";
import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale });
  }

  //* Defence in depth: src/proxy.ts already gates /admin, but the proxy matcher
  //* skips /api and /auth, so the layout re-checks the role server-side.
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("auth_id", user!.id)
    .single();

  if (roleRow?.role !== "ADMINISTRATOR") {
    redirect({ href: "/", locale });
  }

  return (
    <div className="admin-space flex min-h-screen flex-col bg-[#f4f6f9] text-[#1a2b48]">
      <SiteHeader />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
