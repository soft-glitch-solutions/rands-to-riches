import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AdminInvestorRow {
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  joinedAt: string | null;
  roles: string[];
  investmentCount: number;
  totalInvestedCents: number;
  activeCents: number;
}

export interface AdminPendingInvestment {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  amountCents: number;
  termDays: number;
  paymentReference: string | null;
  createdAt: string;
}

export interface AdminOverview {
  investorCount: number;
  totalInvestedCents: number;
  activeCents: number;
  maturedCents: number;
  pendingCount: number;
  pending: AdminPendingInvestment[];
  investors: AdminInvestorRow[];
}

/** Every admin action verifies the caller's admin role before anything else. */
async function requireAdmin(context: {
  supabase: Awaited<ReturnType<typeof getSupabaseFromContext>>;
  userId: string;
}) {
  const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !isAdmin) throw new Error("Forbidden");
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );
  return supabaseAdmin;
}

// Helper only used in the type above.
declare function getSupabaseFromContext(): Promise<unknown>;

/**
 * Admin-only snapshot: every account, role, and investment — with the
 * pending payment queue first.
 */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const supabaseAdmin = await requireAdmin(context);

    const [profilesResult, investmentsResult, rolesResult, usersResult] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("id, full_name, phone, created_at")
          .order("created_at", { ascending: true }),
        supabaseAdmin
          .from("investments")
          .select(
            "id, user_id, amount_cents, status, maturity_action, term_days, payment_reference, created_at, matures_at",
          )
          .order("created_at", { ascending: false }),
        supabaseAdmin.from("user_roles").select("user_id, role"),
        supabaseAdmin.auth.admin.listUsers(),
      ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (investmentsResult.error) throw new Error(investmentsResult.error.message);
    if (rolesResult.error) throw new Error(rolesResult.error.message);
    if (usersResult.error) throw new Error(usersResult.error.message);

    const emailByUser = new Map<string, string>();
    for (const user of usersResult.data.users) {
      if (user.email) emailByUser.set(user.id, user.email);
    }
    const rolesByUser = new Map<string, string[]>();
    for (const row of rolesResult.data ?? []) {
      const list = rolesByUser.get(row.user_id) ?? [];
      list.push(row.role);
      rolesByUser.set(row.user_id, list);
    }

    const all = investmentsResult.data ?? [];

    const pending: AdminPendingInvestment[] = all
      .filter((inv) => inv.status === "pending")
      .map((inv) => ({
        id: inv.id,
        userId: inv.user_id,
        fullName:
          (profilesResult.data ?? []).find((p) => p.id === inv.user_id)
            ?.full_name ?? null,
        email: emailByUser.get(inv.user_id) ?? null,
        amountCents: inv.amount_cents,
        termDays: inv.term_days,
        paymentReference: inv.payment_reference ?? null,
        createdAt: inv.created_at,
      }));

    const investors: AdminInvestorRow[] = (profilesResult.data ?? []).map(
      (profile) => {
        const own = all.filter((inv) => inv.user_id === profile.id);
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
          roles: rolesByUser.get(profile.id) ?? [],
          investmentCount: own.length,
          totalInvestedCents: total,
          activeCents: active,
        };
      },
    );

    return {
      investorCount: investors.length,
      totalInvestedCents: all.reduce((sum, inv) => sum + inv.amount_cents, 0),
      activeCents: all
        .filter((inv) => inv.status === "active")
        .reduce((sum, inv) => sum + inv.amount_cents, 0),
      maturedCents: all
        .filter(
          (inv) => inv.status !== "active" && inv.status !== "pending",
        )
        .reduce((sum, inv) => sum + inv.amount_cents, 0),
      pendingCount: pending.length,
      pending,
      investors,
    };
  });

/**
 * Approve an investor's payment: the cycle becomes active and its maturity
 * clock starts now (matures_at = approval + term days).
 */
export const approveInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdmin(context);

    const { data: inv, error: fetchError } = await supabaseAdmin
      .from("investments")
      .select("id, status, term_days")
      .eq("id", data.id)
      .single();
    if (fetchError) throw new Error(fetchError.message);
    if (!inv || inv.status !== "pending")
      throw new Error("Only pending payments can be approved.");

    const maturesAt = new Date(
      Date.now() + (inv.term_days ?? 30) * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error } = await supabaseAdmin
      .from("investments")
      .update({ status: "active", matures_at: maturesAt })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Reject a pending payment (wrong amount, no deposit, etc.). */
export const rejectInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdmin(context);
    const { error } = await supabaseAdmin
      .from("investments")
      .update({ status: "rejected" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Change an account's role (user / admin). The admin cannot change their own
 * role, so there is always at least one admin and no accidental lockout.
 */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "admin" | "user" }) => input)
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId)
      throw new Error("You can't change your own role.");

    const supabaseAdmin = await requireAdmin(context);
    const { error: delError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId);
    if (delError) throw new Error(delError.message);

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
