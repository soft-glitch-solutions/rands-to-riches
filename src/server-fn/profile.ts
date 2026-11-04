import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/** Update the signed-in investor's profile information. */
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { fullName?: string; phone?: string; avatarUrl?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const patch: ProfileUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (data.fullName !== undefined)
      patch.full_name = data.fullName.trim() || null;
    if (data.phone !== undefined) patch.phone = data.phone.trim() || null;
    if (data.avatarUrl !== undefined)
      patch.avatar_url = data.avatarUrl.trim() || null;

    const { error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export interface BankDetailsInput {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
}

/** Save the investor's SA bank account used for maturity payouts. */
export const saveBankDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: BankDetailsInput) => input)
  .handler(async ({ data, context }) => {
    const patch: ProfileUpdate = {
      bank_name: data.bankName.trim() || null,
      bank_account_holder: data.accountHolder.trim() || null,
      bank_account_number: data.accountNumber.trim() || null,
      bank_branch_code: data.branchCode.trim() || null,
      bank_account_type: data.accountType.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
