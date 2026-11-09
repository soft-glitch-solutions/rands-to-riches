import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { clampInvestment, generatePaymentReference } from "@/lib/investment";
import type { PayoutAccount } from "@/lib/payment-details";
import type { Tables } from "@/integrations/supabase/types";

export type MaturityAction = "withdraw" | "reinvest";
export type PayoutRequestRow = Tables<"payout_requests">;

/** Everything the signed-in investor sees on their dashboard. */
export const getMyInvestments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    const [investments, profile, payoutRow, payoutRequests] = await Promise.all([
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
      supabase
        .from("payout_settings")
        .select(
          "bank, account_name, account_number, branch_code, account_type",
        )
        .eq("id", 1)
        .maybeSingle(),
      supabase
        .from("payout_requests")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (investments.error) throw new Error(investments.error.message);

    const payout: PayoutAccount | null = payoutRow.data
      ? {
          bank: payoutRow.data.bank,
          accountName: payoutRow.data.account_name,
          accountNumber: payoutRow.data.account_number,
          branchCode: payoutRow.data.branch_code,
          accountType: payoutRow.data.account_type,
        }
      : null;

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
      payout,
      investments: investments.data,
      payoutRequests: payoutRequests.data ?? [],
    };
  });

/** Start a new investment cycle with the chosen amount and term. */
export const createInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
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
  .validator((input: { id: string; action: MaturityAction }) => input)
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

export interface RequestPayoutInput {
  investmentId: string;
  amountCents: number;
  bankName: string;
  accountHolder?: string;
  accountNumber: string;
  branchCode?: string;
  accountType?: string;
}

/** Submit a real withdrawal request for a matured investment. */
export const requestPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: RequestPayoutInput) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (!data.investmentId) {
      throw new Error("Missing investment ID");
    }
    if (!data.accountNumber || !data.bankName) {
      throw new Error("Bank name and account number are required");
    }
    if (!data.amountCents || data.amountCents <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    // Insert payout request
    const { data: requestRow, error: insertError } = await supabase
      .from("payout_requests")
      .insert({
        user_id: userId,
        investment_id: data.investmentId,
        amount_cents: data.amountCents,
        bank_name: data.bankName,
        account_holder: data.accountHolder || "",
        account_number: data.accountNumber,
        branch_code: data.branchCode || "",
        account_type: data.accountType || "savings",
        status: "pending",
      })
      .select("*")
      .single();

    if (insertError) throw new Error(insertError.message);

    // Also update investment maturity_action to withdraw
    await supabase
      .from("investments")
      .update({ maturity_action: "withdraw" })
      .eq("id", data.investmentId)
      .eq("user_id", userId);

    return requestRow;
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
