import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { clampInvestment, generatePaymentReference } from "@/lib/investment";

export type MaturityAction = "withdraw" | "reinvest";

/** Everything the signed-in investor sees on their dashboard. */
export const getMyInvestments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    const [investments, profile] = await Promise.all([
      supabase
        .from("investments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select(
          "full_name, phone, created_at, avatar_url, bank_name, bank_account_holder, bank_account_number, bank_branch_code, bank_account_type",
        )
        .eq("id", userId)
        .maybeSingle(),
    ]);

    if (investments.error) throw new Error(investments.error.message);

    return {
      userId,
      email: (claims as { email?: string } | null)?.email ?? null,
      fullName: profile.data?.full_name ?? null,
      phone: profile.data?.phone ?? null,
      memberSince: profile.data?.created_at ?? null,
      avatarUrl: profile.data?.avatar_url ?? null,
      bankName: profile.data?.bank_name ?? null,
      bankAccountHolder: profile.data?.bank_account_holder ?? null,
      bankAccountNumber: profile.data?.bank_account_number ?? null,
      bankBranchCode: profile.data?.bank_branch_code ?? null,
      bankAccountType: profile.data?.bank_account_type ?? null,
      investments: investments.data,
    };
  });

/** Start a new investment cycle with the chosen amount and term. */
export const createInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      amountRands: number;
      maturityAction: MaturityAction;
      termDays?: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const amountRands = clampInvestment(Number(data.amountRands));
    const action =
      data.maturityAction === "reinvest" ? "reinvest" : "withdraw";
    const termDays =
      data.termDays && [30, 60, 90].includes(data.termDays)
        ? data.termDays
        : amountRands > 1000
          ? 90
          : 30;

    const { data: row, error } = await context.supabase
      .from("investments")
      .insert({
        user_id: context.userId,
        amount_cents: Math.round(amountRands * 100),
        maturity_action: action,
        term_days: termDays,
        // New cycles wait for the investor's EFT payment; an admin approves it.
        status: "pending",
        payment_reference: generatePaymentReference(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

/** Change the withdraw / reinvest choice on one of the user's investments. */
export const setMaturityAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; action: MaturityAction }) => input)
  .handler(async ({ data, context }) => {
    const action = data.action === "reinvest" ? "reinvest" : "withdraw";
    // RLS scopes this to the owner's rows.
    const { error } = await context.supabase
      .from("investments")
      .update({ maturity_action: action })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Used by the admin route guard — true only for accounts with the admin role. */
export const isUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) return false;
    return data === true;
  });
