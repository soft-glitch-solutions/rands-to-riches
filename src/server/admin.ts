import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AdminInvestorRow {
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  joinedAt: string | null;
  investmentCount: number;
  totalInvestedCents: number;
  activeCents: number;
}

export interface AdminOverview {
  investorCount: number;
  totalInvestedCents: number;
  activeCents: number;
  maturedCents: number;
  investors: AdminInvestorRow[];
}

/**
 * Admin-only snapshot of every account and every investment on the platform.
 * Verifies the caller's admin role through the user's own (RLS-scoped)
 * session before touching the privileged client.
 */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc(
      "has_role",
      { _user_id: context.userId, _role: "admin" },
    );
    if (roleError || !isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const [profilesResult, investmentsResult, usersResult] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("investments")
        .select(
          "user_id, amount_cents, status, maturity_action, created_at, matures_at",
        )
        .order("created_at", { ascending: false }),
      supabaseAdmin.auth.admin.listUsers(),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (investmentsResult.error) throw new Error(investmentsResult.error.message);
    if (usersResult.error) throw new Error(usersResult.error.message);

    const emailByUser = new Map<string, string>();
    for (const user of usersResult.data.users) {
      if (user.email) emailByUser.set(user.id, user.email);
    }

    const investors: AdminInvestorRow[] = (profilesResult.data ?? []).map(
      (profile) => {
        const own = (investmentsResult.data ?? []).filter(
          (inv) => inv.user_id === profile.id,
        );
        const total = own.reduce((sum, inv) => sum + inv.amount_cents, 0);
        const active = own
          .filter((inv) => inv.status === "active")
          .reduce((sum, inv) => sum + inv.amount_cents, 0);
        return {
          userId: profile.id,
          fullName: profile.full_name ?? null,
          email: emailByUser.get(profile.id) ?? null,
          phone: profile.phone ?? null,
          joinedAt: profile.created_at ?? null,
          investmentCount: own.length,
          totalInvestedCents: total,
          activeCents: active,
        };
      },
    );

    const all = investmentsResult.data ?? [];
    return {
      investorCount: investors.length,
      totalInvestedCents: all.reduce((sum, inv) => sum + inv.amount_cents, 0),
      activeCents: all
        .filter((inv) => inv.status === "active")
        .reduce((sum, inv) => sum + inv.amount_cents, 0),
      maturedCents: all
        .filter((inv) => inv.status !== "active")
        .reduce((sum, inv) => sum + inv.amount_cents, 0),
      investors,
    };
  });
