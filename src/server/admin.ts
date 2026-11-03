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

/**
 * Every admin action verifies the caller's admin role first, then hands back
 * the service-role client. The role check itself also runs with the service
 * role so it does not depend on the caller's client typing.
 */
async function requireAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: isAdmin, error } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error || isAdmin !== true) throw new Error("Forbidden");
  return supabaseAdmin;
}

/** Admin-only snapshot: every account, role and investment, pending queue first. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const supabaseAdmin = await requireAdmin(context.userId);

    const [profilesResult, investmentsResult, rolesResult, usersResult] = await Promise.all([
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
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    if (profilesResult.error) throw new Error(profilesResult.error.message);
    if (investmentsResult.error) throw new Error(investmentsResult.error.message);
    if (rolesResult.error) throw new Error(rolesResult.error.message);
    if (usersResult.error) throw new Error(usersResult.error.message);

    const profiles = profilesResult.data ?? [];
    const all = investmentsResult.data ?? [];

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
    const nameByUser = new Map(profiles.map((p) => [p.id, p.full_name ?? null]));

    const pending: AdminPendingInvestment[] = all
      .filter((inv) => inv.status === "pending")
      .map((inv) => ({
        id: inv.id,
        userId: inv.user_id,
        fullName: nameByUser.get(inv.user_id) ?? null,
        email: emailByUser.get(inv.user_id) ?? null,
        amountCents: inv.amount_cents,
        termDays: inv.term_days,
        paymentReference: inv.payment_reference ?? null,
        createdAt: inv.created_at,
      }));

    const investors: AdminInvestorRow[] = profiles.map((profile) => {
      const own = all.filter((inv) => inv.user_id === profile.id);
      return {
        userId: profile.id,
        fullName: profile.full_name ?? null,
        email: emailByUser.get(profile.id) ?? null,
        phone: profile.phone ?? null,
        joinedAt: profile.created_at ?? null,
        roles: rolesByUser.get(profile.id) ?? [],
        investmentCount: own.length,
        totalInvestedCents: own.reduce((sum, inv) => sum + inv.amount_cents, 0),
        activeCents: own
          .filter((inv) => inv.status === "active")
          .reduce((sum, inv) => sum + inv.amount_cents, 0),
      };
    });

    return {
      investorCount: investors.length,
      totalInvestedCents: all
        .filter((inv) => inv.status !== "pending" && inv.status !== "rejected")
        .reduce((sum, inv) => sum + inv.amount_cents, 0),
      activeCents: all
        .filter((inv) => inv.status === "active")
        .reduce((sum, inv) => sum + inv.amount_cents, 0),
      maturedCents: all
        .filter((inv) => ["matured", "completed", "withdrawn"].includes(inv.status))
        .reduce((sum, inv) => sum + inv.amount_cents, 0),
      pendingCount: pending.length,
      pending,
      investors,
    };
  });

/** Approve a payment: the cycle becomes active and its maturity clock starts now. */
export const approveInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdmin(context.userId);

    const { data: inv, error: fetchError } = await supabaseAdmin
      .from("investments")
      .select("id, status, term_days")
      .eq("id", data.id)
      .single();
    if (fetchError) throw new Error(fetchError.message);
    if (inv.status !== "pending") throw new Error("Only pending payments can be approved.");

    const maturesAt = new Date(Date.now() + (inv.term_days ?? 30) * 86_400_000).toISOString();

    const { error } = await supabaseAdmin
      .from("investments")
      .update({ status: "active", matures_at: maturesAt })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Reject a pending payment (wrong amount, no deposit, etc.). */
export const rejectInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("investments")
      .update({ status: "rejected" })
      .eq("id", data.id)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Change an account's role. Admins cannot change their own role (no lockout). */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "admin" | "user" }) => input)
  .handler(async ({ data, context }) => {
    if (data.userId === context.userId) throw new Error("You can't change your own role.");
    if (data.role !== "admin" && data.role !== "user") throw new Error("Invalid role.");

    const supabaseAdmin = await requireAdmin(context.userId);
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
