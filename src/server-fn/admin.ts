import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { PayoutAccount } from "@/lib/payment-details";

/** Context shape that requireSupabaseAuth hands to every handler. */
interface AuthedContext {
  supabase: SupabaseClient<Database>;
  userId: string;
}

/* ============================================================
   TYPES
============================================================ */

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
  /** NEW: capital in cycles already matured/withdrawn */
  maturedCents: number;
  /** NEW: capital tied up in pending (unapproved) payments */
  pendingCents: number;
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

export interface AdminRecentActivity {
  id: string;
  action: "approved" | "rejected" | "created";
  amountCents: number;
  fullName: string | null;
  email: string | null;
  at: string;
}

export interface AdminOverview {
  investorCount: number;
  totalInvestedCents: number;
  activeCents: number;
  maturedCents: number;
  pendingCount: number;
  pending: AdminPendingInvestment[];
  investors: AdminInvestorRow[];
  /** NEW */
  recentActivity: AdminRecentActivity[];
}

export interface PayoutBucket {
  maturities: number;
  principalCents: number;
  profitCents: number;
  totalCents: number;
}

export interface PayoutForecast {
  thisMonth: PayoutBucket;
  nextMonth: PayoutBucket;
  next90: PayoutBucket;
}

export interface AdminInvestorDetail {
  profile: {
    userId: string;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    joinedAt: string | null;
    bank: {
      name: string | null;
      holder: string | null;
      accountNumber: string | null;
      branchCode: string | null;
      type: string | null;
    };
  } | null;
  roles: string[];
  investments: {
    id: string;
    amountCents: number;
    termDays: number;
    status: string;
    maturesAt: string;
    createdAt: string;
    paymentReference: string | null;
    maturityAction: string | null;
    profitEstimateCents: number;
  }[];
}

/* ============================================================
   HELPERS
============================================================ */

/** Every admin action verifies the caller's admin role before anything else. */
async function requireAdmin(context: AuthedContext) {
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

/** Estimate profit on a single cycle — matches the client-side display. */
function profitRate(termDays: number): number {
  if (termDays >= 90) return 0.25;
  if (termDays >= 60) return 0.22;
  return 0.2;
}

/* ============================================================
   OVERVIEW (extended)
============================================================ */

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
            "id, user_id, amount_cents, status, maturity_action, term_days, payment_reference, created_at, matures_at, updated_at",
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
    const nameByUser = new Map<string, string | null>();
    for (const p of profilesResult.data ?? []) {
      nameByUser.set(p.id, p.full_name ?? null);
    }
    const rolesByUser = new Map<string, string[]>();
    for (const row of rolesResult.data ?? []) {
      const list = rolesByUser.get(row.user_id) ?? [];
      list.push(row.role);
      rolesByUser.set(row.user_id, list);
    }

    const all = investmentsResult.data ?? [];

    /* ---------- Pending ---------- */
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

    /* ---------- Investors ---------- */
    const investors: AdminInvestorRow[] = (profilesResult.data ?? []).map(
      (profile) => {
        const own = all.filter((inv) => inv.user_id === profile.id);
        const total = own.reduce((sum, inv) => sum + inv.amount_cents, 0);
        const active = own
          .filter((inv) => inv.status === "active")
          .reduce((sum, inv) => sum + inv.amount_cents, 0);
        const matured = own
          .filter(
            (inv) => inv.status === "matured" || inv.status === "withdrawn",
          )
          .reduce((sum, inv) => sum + inv.amount_cents, 0);
        const pendingAmt = own
          .filter((inv) => inv.status === "pending")
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
          maturedCents: matured,
          pendingCents: pendingAmt,
        };
      },
    );

    /* ---------- Recent activity ---------- */
    const recentActivity: AdminRecentActivity[] = all
      .filter((inv) => inv.status !== "pending")
      .slice(0, 10)
      .map((inv) => {
        const status = inv.status;
        const action: AdminRecentActivity["action"] =
          status === "active"
            ? "approved"
            : status === "rejected"
              ? "rejected"
              : "created";
        return {
          id: inv.id,
          action,
          amountCents: inv.amount_cents,
          fullName: nameByUser.get(inv.user_id) ?? null,
          email: emailByUser.get(inv.user_id) ?? null,
          at: inv.updated_at ?? inv.created_at,
        };
      });

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
      recentActivity,
    };
  });

/* ============================================================
   PAYOUT ACCOUNT DETAILS (the account investors pay into)
============================================================ */

export interface PayoutSettings {
  payout: PayoutAccount | null;
  updatedAt: string | null;
}

/** Load the bank account investors pay into (falls back to null). */
export const getPayoutSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PayoutSettings> => {
    const { data, error } = await context.supabase
      .from("payout_settings")
      .select(
        "bank, account_name, account_number, branch_code, account_type, updated_at",
      )
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);

    return {
      payout: data
        ? {
            bank: data.bank,
            accountName: data.account_name,
            accountNumber: data.account_number,
            branchCode: data.branch_code,
            accountType: data.account_type,
          }
        : null,
      updatedAt: data?.updated_at ?? null,
    };
  });

/** Admin-only: save the payout account shown to investors. */
export const updatePayoutSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PayoutAccount) => input)
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await requireAdmin(context);

    const row = {
      id: 1,
      bank: data.bank.trim(),
      account_name: data.accountName.trim(),
      account_number: data.accountNumber.trim(),
      branch_code: data.branchCode.trim(),
      account_type: data.accountType.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("payout_settings")
      .upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============================================================
   FORECAST (new)
============================================================ */

export const getPayoutForecast = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PayoutForecast> => {
    const supabaseAdmin = await requireAdmin(context);

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfMonthAfter = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      1,
    );
    const endOf90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabaseAdmin
      .from("investments")
      .select("amount_cents, term_days, matures_at")
      .eq("status", "active")
      .lte("matures_at", endOf90.toISOString());

    if (error) throw new Error(error.message);

    const bucket = (from: Date, to: Date): PayoutBucket => {
      const slice = (data ?? []).filter((inv) => {
        const t = new Date(inv.matures_at).getTime();
        return t >= from.getTime() && t < to.getTime();
      });
      let principalCents = 0;
      let profitCents = 0;
      for (const inv of slice) {
        const amt = inv.amount_cents;
        principalCents += amt;
        profitCents += Math.round(amt * profitRate(inv.term_days));
      }
      return {
        maturities: slice.length,
        principalCents,
        profitCents,
        totalCents: principalCents + profitCents,
      };
    };

    return {
      thisMonth: bucket(startOfThisMonth, startOfNext),
      nextMonth: bucket(startOfNext, startOfMonthAfter),
      next90: bucket(now, endOf90),
    };
  });

/* ============================================================
   INVESTOR DETAIL (new)
============================================================ */

export const getAdminInvestorDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }): Promise<AdminInvestorDetail> => {
    const supabaseAdmin = await requireAdmin(context);

    const [profileResult, rolesResult, investmentsResult, usersResult] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select(
            "id, full_name, phone, created_at, bank_name, bank_account_holder, bank_account_number, bank_branch_code, bank_account_type",
          )
          .eq("id", data.userId)
          .maybeSingle(),
        supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", data.userId),
        supabaseAdmin
          .from("investments")
          .select(
            "id, amount_cents, term_days, status, matures_at, created_at, payment_reference, maturity_action",
          )
          .eq("user_id", data.userId)
          .order("created_at", { ascending: false }),
        supabaseAdmin.auth.admin.getUserById(data.userId),
      ]);

    if (profileResult.error) throw new Error(profileResult.error.message);
    if (rolesResult.error) throw new Error(rolesResult.error.message);
    if (investmentsResult.error)
      throw new Error(investmentsResult.error.message);

    const profile = profileResult.data;
    const email = usersResult.data?.user?.email ?? null;

    const investments = (investmentsResult.data ?? []).map((inv) => ({
      id: inv.id,
      amountCents: inv.amount_cents,
      termDays: inv.term_days,
      status: inv.status,
      maturesAt: inv.matures_at,
      createdAt: inv.created_at,
      paymentReference: inv.payment_reference ?? null,
      maturityAction: inv.maturity_action ?? null,
      profitEstimateCents: Math.round(
        inv.amount_cents * profitRate(inv.term_days),
      ),
    }));

    return {
      profile: profile
        ? {
            userId: profile.id,
            fullName: profile.full_name ?? null,
            email,
            phone: profile.phone ?? null,
            joinedAt: profile.created_at ?? null,
            bank: {
              name: profile.bank_name ?? null,
              holder: profile.bank_account_holder ?? null,
              accountNumber: profile.bank_account_number ?? null,
              branchCode: profile.bank_branch_code ?? null,
              type: profile.bank_account_type ?? null,
            },
          }
        : null,
      roles: (rolesResult.data ?? []).map((r) => r.role),
      investments,
    };
  });

/* ============================================================
   MUTATIONS (unchanged behavior)
============================================================ */

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