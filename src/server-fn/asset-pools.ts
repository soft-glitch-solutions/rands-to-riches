import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getSupabaseServerClient } from "@/integrations/supabase/server";
import { isUserAdmin } from "./investments";

// ─── Helper ────────────────────────────────────────────────────────────────

function randCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function getShareReferrerId(code?: string | null) {
  const trimmed = code?.trim();
  if (!trimmed) return null;

  const idx = trimmed.lastIndexOf("-");
  if (idx <= 0) return null;

  const candidate = trimmed.slice(0, idx);
  return /^[0-9a-fA-F-]{36}$/.test(candidate) ? candidate : null;
}

// ─── Public: list all open/active pools ────────────────────────────────────

export const getAssetPools = createServerFn({ method: "GET" }).handler(async () => {
  const client = await getSupabaseServerClient();
  const { data, error } = await client
    .from("asset_pools")
    .select("*")
    .in("status", ["filling", "active"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
});

// ─── Public: single pool ────────────────────────────────────────────────────

export const getAssetPool = createServerFn({ method: "GET" })
  .validator(z.object({ poolId: z.string().uuid() }))
  .handler(async ({ data: { poolId } }) => {
    const client = await getSupabaseServerClient();
    const { data, error } = await client
      .from("asset_pools")
      .select("*")
      .eq("id", poolId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  });

// ─── Authenticated: my pool contributions ──────────────────────────────────

export const getMyPoolContributions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("pool_contributions")
      .select("*, asset_pools(id, title, status, target_amount_cents, current_amount_cents, return_rate_pct, term_days, vehicle_model, image_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ─── Authenticated: contribute to pool ─────────────────────────────────────

export const contributeToPool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      poolId: z.string().uuid(),
      amountCents: z.number().int().min(10000), // min R100
      tier: z.enum(["retail", "partner"]),
    })
  )
  .handler(async ({ data: { poolId, amountCents, tier }, context }) => {
    const { supabase, userId } = context;

    // Fetch pool to validate
    const { data: pool, error: poolErr } = await supabase
      .from("asset_pools")
      .select("*")
      .eq("id", poolId)
      .single();

    if (poolErr || !pool) throw new Error("Pool not found");
    if (pool.status !== "filling") throw new Error("This pool is no longer accepting contributions");
    if (amountCents < pool.min_contribution_cents)
      throw new Error(`Minimum contribution is R${pool.min_contribution_cents / 100}`);

    const paymentRef = `POOL-${randCode()}`;

    const { data: contrib, error: insertErr } = await supabase
      .from("pool_contributions")
      .insert({
        pool_id: poolId,
        user_id: userId,
        amount_cents: amountCents,
        tier,
        status: "pending",
        payment_reference: paymentRef,
      })
      .select()
      .single();

    if (insertErr) throw new Error(insertErr.message);
    return contrib;
  });

// ─── Share link generation ──────────────────────────────────────────────────

export const generateShareLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ poolId: z.string().uuid() }))
  .handler(async ({ data: { poolId }, context }) => {
    const { supabase, userId } = context;

    const { data: pool } = await supabase
      .from("asset_pools")
      .select("share_code")
      .eq("id", poolId)
      .single();

    if (!pool) throw new Error("Pool not found");

    let code = pool.share_code;
    if (!code || !code.startsWith(`${userId}-`)) {
      code = `${userId}-${randCode()}`;
      await supabase
        .from("asset_pools")
        .update({ share_code: code })
        .eq("id", poolId);
    }

    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://motuscapital.co.za";

    return { shareUrl: `${baseUrl}/pools?ref=${encodeURIComponent(code)}&pool=${encodeURIComponent(poolId)}` };
  });

export const getPoolShareLandingPage = createServerFn({ method: "GET" })
  .validator(z.object({ poolId: z.string().uuid().optional(), refCode: z.string().optional() }))
  .handler(async ({ data }) => {
    const client = await getSupabaseServerClient();
    const poolId = data.poolId;
    const refCode = data.refCode;

    let pool: any = null;
    if (poolId) {
      const { data: poolRow, error } = await client
        .from("asset_pools")
        .select("*")
        .eq("id", poolId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      pool = poolRow;
    }

    if (!pool && refCode) {
      const { data: poolRow, error } = await client
        .from("asset_pools")
        .select("*")
        .eq("share_code", refCode)
        .maybeSingle();

      if (error) throw new Error(error.message);
      pool = poolRow;
    }

    if (!pool) throw new Error("Pool not found.");

    let referrer: { id: string; full_name: string | null; avatar_url: string | null } | null = null;
    const referrerId = getShareReferrerId(refCode);
    if (referrerId) {
      const { data: profile, error } = await client
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", referrerId)
        .maybeSingle();

      if (!error && profile) referrer = profile;
    }

    return { pool, referrer };
  });

// ═══════════════════════════════════════════════════════════════════════════
//  ADMIN server functions
// ═══════════════════════════════════════════════════════════════════════════

// ─── Admin: list ALL pools ──────────────────────────────────────────────────

export const adminGetAllPools = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await isUserAdmin();
  if (!admin) throw new Error("Unauthorized");

  const client = await getSupabaseServerClient();
  const { data, error } = await client
    .from("asset_pools")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
});

// ─── Admin: list ALL contributions ─────────────────────────────────────────

export const adminGetPoolContributions = createServerFn({ method: "GET" })
  .validator(z.object({ poolId: z.string().uuid().optional() }))
  .handler(async ({ data: { poolId } }) => {
    const admin = await isUserAdmin();
    if (!admin) throw new Error("Unauthorized");

    const client = await getSupabaseServerClient();
    let query = client
      .from("pool_contributions")
      .select(
        "*, profiles(full_name, email), asset_pools(title)"
      )
      .order("created_at", { ascending: false });

    if (poolId) query = query.eq("pool_id", poolId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ─── Admin: create pool ─────────────────────────────────────────────────────

export const adminCreatePool = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().min(3),
      description: z.string().default(""),
      vehicleType: z.enum(["motorcycle", "vehicle"]).default("motorcycle"),
      vehicleModel: z.string().default(""),
      vehicleReg: z.string().default(""),
      targetAmountCents: z.number().int().min(100000), // min R1,000
      tier: z.enum(["retail", "partner"]).default("retail"),
      minContributionCents: z.number().int().min(10000).default(10000),
      termDays: z.number().int().min(30).default(30),
      returnRatePct: z.number().min(1).max(50).default(13),
      weeklyRentalRevenueCents: z.number().int().default(60000),
      imageUrl: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const admin = await isUserAdmin();
    if (!admin) throw new Error("Unauthorized");

    const client = await getSupabaseServerClient();
    const { data: pool, error } = await client
      .from("asset_pools")
      .insert({
        title: data.title,
        description: data.description,
        vehicle_type: data.vehicleType,
        vehicle_model: data.vehicleModel,
        vehicle_reg: data.vehicleReg,
        target_amount_cents: data.targetAmountCents,
        tier: data.tier,
        min_contribution_cents: data.minContributionCents,
        term_days: data.termDays,
        return_rate_pct: data.returnRatePct,
        weekly_rental_revenue_cents: data.weeklyRentalRevenueCents,
        image_url: data.imageUrl ?? null,
        status: "filling",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return pool;
  });

// ─── Admin: approve contribution ────────────────────────────────────────────

export const adminApprovePoolContribution = createServerFn({ method: "POST" })
  .validator(z.object({ contributionId: z.string().uuid() }))
  .handler(async ({ data: { contributionId } }) => {
    const admin = await isUserAdmin();
    if (!admin) throw new Error("Unauthorized");

    const client = await getSupabaseServerClient();

    // Fetch contribution
    const { data: contrib, error: fetchErr } = await client
      .from("pool_contributions")
      .select("*, asset_pools(*)")
      .eq("id", contributionId)
      .single();

    if (fetchErr || !contrib) throw new Error("Contribution not found");
    if (contrib.status !== "pending") throw new Error("Contribution already processed");

    const pool = (contrib as any).asset_pools;
    if (!pool) throw new Error("Associated pool not found");

    const newAmount = pool.current_amount_cents + contrib.amount_cents;
    const isFunded = newAmount >= pool.target_amount_cents;
    const now = new Date();
    const maturesAt = new Date(now.getTime() + pool.term_days * 24 * 60 * 60 * 1000);
    const payoutAmountCents = Math.round(
      contrib.amount_cents * (1 + Number(pool.return_rate_pct) / 100)
    );

    // Update contribution to active
    const { error: updateErr } = await client
      .from("pool_contributions")
      .update({
        status: "active",
        payout_amount_cents: payoutAmountCents,
        matures_at: maturesAt.toISOString(),
      })
      .eq("id", contributionId);

    if (updateErr) throw new Error(updateErr.message);

    // Update pool current_amount_cents (and status if fully funded)
    const poolUpdate: Record<string, unknown> = { current_amount_cents: newAmount };
    if (isFunded) {
      poolUpdate.status = "active";
      poolUpdate.funded_at = now.toISOString();
      poolUpdate.matures_at = maturesAt.toISOString();
    }

    const { error: poolUpdateErr } = await client
      .from("asset_pools")
      .update(poolUpdate)
      .eq("id", pool.id);

    if (poolUpdateErr) throw new Error(poolUpdateErr.message);

    return { approved: true, poolFunded: isFunded };
  });

// ─── Admin: reject/void contribution ───────────────────────────────────────

export const adminRejectPoolContribution = createServerFn({ method: "POST" })
  .validator(z.object({ contributionId: z.string().uuid() }))
  .handler(async ({ data: { contributionId } }) => {
    const admin = await isUserAdmin();
    if (!admin) throw new Error("Unauthorized");

    const client = await getSupabaseServerClient();
    const { error } = await client
      .from("pool_contributions")
      .update({ status: "withdrawn" })
      .eq("id", contributionId);

    if (error) throw new Error(error.message);
    return { rejected: true };
  });

// ─── Admin: mature pool ─────────────────────────────────────────────────────

export const adminMaturePool = createServerFn({ method: "POST" })
  .validator(z.object({ poolId: z.string().uuid() }))
  .handler(async ({ data: { poolId } }) => {
    const admin = await isUserAdmin();
    if (!admin) throw new Error("Unauthorized");

    const client = await getSupabaseServerClient();

    // Mature the pool
    const { error: poolErr } = await client
      .from("asset_pools")
      .update({ status: "matured" })
      .eq("id", poolId);

    if (poolErr) throw new Error(poolErr.message);

    // Mature all active contributions
    const { error: contribErr } = await client
      .from("pool_contributions")
      .update({ status: "matured" })
      .eq("pool_id", poolId)
      .eq("status", "active");

    if (contribErr) throw new Error(contribErr.message);

    return { matured: true };
  });

// ─── Admin: update pool ─────────────────────────────────────────────────────

export const adminUpdatePool = createServerFn({ method: "POST" })
  .validator(
    z.object({
      poolId: z.string().uuid(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["filling", "active", "matured", "closed"]).optional(),
      driverId: z.string().uuid().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
    })
  )
  .handler(async ({ data }) => {
    const admin = await isUserAdmin();
    if (!admin) throw new Error("Unauthorized");

    const { poolId, ...updates } = data;
    const client = await getSupabaseServerClient();

    const patch: Record<string, unknown> = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.driverId !== undefined) patch.driver_id = updates.driverId;
    if (updates.imageUrl !== undefined) patch.image_url = updates.imageUrl;

    const { data: pool, error } = await client
      .from("asset_pools")
      .update(patch)
      .eq("id", poolId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return pool;
  });
