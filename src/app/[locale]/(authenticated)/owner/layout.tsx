import { redirect } from "@/i18n/navigation";
import createSupabaseServerClient from "@/lib/supabase/createSupabaseServerClient";
import { OwnerSidebar } from "@/components/owner/owner-sidebar";
import { SiteHeader } from "@/components/layout/site-header";

export default async function OwnerLayout({
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

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("auth_id", user!.id)
    .single();

  if (roleRow?.role !== "OWNER" && roleRow?.role !== "ADMINISTRATOR") {
    redirect({ href: "/become-owner", locale });
  }

  return (
    <div className="owner-space flex min-h-screen flex-col bg-[#f4f6f9] text-[#1a2b48]">
      <SiteHeader />
      {/* Stacked on a phone (the sidebar becomes a scrolling bar), side by
          side from `md`. */}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <OwnerSidebar />
        <main className="min-w-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
