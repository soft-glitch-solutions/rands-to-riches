-- ============================================================
-- 0005 — Asset Pools & Fleet Partner Module
-- ============================================================

-- 1. Asset Pools (each physical vehicle fundraising pool)
CREATE TABLE IF NOT EXISTS public.asset_pools (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                     text NOT NULL,
  description               text NOT NULL DEFAULT '',
  vehicle_type              text NOT NULL DEFAULT 'motorcycle',
  vehicle_model             text NOT NULL DEFAULT '',
  vehicle_reg               text NOT NULL DEFAULT '',
  target_amount_cents       integer NOT NULL CHECK (target_amount_cents > 0),
  current_amount_cents      integer NOT NULL DEFAULT 0,
  status                    text NOT NULL DEFAULT 'filling' CHECK (status IN ('filling', 'active', 'matured', 'closed')),
  tier                      text NOT NULL DEFAULT 'retail' CHECK (tier IN ('retail', 'partner')),
  min_contribution_cents    integer NOT NULL DEFAULT 10000,
  term_days                 integer NOT NULL DEFAULT 30,
  return_rate_pct           decimal NOT NULL DEFAULT 13.0,
  driver_id                 uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  funded_at                 timestamptz,
  matures_at                timestamptz,
  weekly_rental_revenue_cents integer NOT NULL DEFAULT 60000,
  image_url                 text,
  share_code                text UNIQUE,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS asset_pools_status_idx ON public.asset_pools(status);
CREATE INDEX IF NOT EXISTS asset_pools_tier_idx   ON public.asset_pools(tier);

DROP TRIGGER IF EXISTS asset_pools_touch_updated_at ON public.asset_pools;
CREATE TRIGGER asset_pools_touch_updated_at
  BEFORE UPDATE ON public.asset_pools
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.asset_pools ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.asset_pools TO service_role;
GRANT SELECT ON public.asset_pools TO anon;
GRANT SELECT ON public.asset_pools TO authenticated;

-- RLS: anyone can view pools; only service_role (admin server fns) can mutate
CREATE POLICY "pools_select_all"  ON public.asset_pools FOR SELECT USING (true);
CREATE POLICY "pools_admin_insert" ON public.asset_pools FOR INSERT WITH CHECK (false); -- only service_role
CREATE POLICY "pools_admin_update" ON public.asset_pools FOR UPDATE USING (false);      -- only service_role


-- 2. Pool Contributions (individual investor stakes in a pool)
CREATE TABLE IF NOT EXISTS public.pool_contributions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id             uuid NOT NULL REFERENCES public.asset_pools(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents        integer NOT NULL CHECK (amount_cents > 0),
  tier                text NOT NULL DEFAULT 'retail' CHECK (tier IN ('retail', 'partner')),
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'matured', 'withdrawn')),
  payment_reference   text,
  payout_amount_cents integer,
  matures_at          timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pool_contrib_pool_id_idx ON public.pool_contributions(pool_id);
CREATE INDEX IF NOT EXISTS pool_contrib_user_id_idx ON public.pool_contributions(user_id);
CREATE INDEX IF NOT EXISTS pool_contrib_status_idx  ON public.pool_contributions(status);

DROP TRIGGER IF EXISTS pool_contrib_touch_updated_at ON public.pool_contributions;
CREATE TRIGGER pool_contrib_touch_updated_at
  BEFORE UPDATE ON public.pool_contributions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.pool_contributions ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.pool_contributions TO service_role;
GRANT SELECT, INSERT ON public.pool_contributions TO authenticated;

CREATE POLICY "contrib_own_select" ON public.pool_contributions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "contrib_own_insert" ON public.pool_contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
