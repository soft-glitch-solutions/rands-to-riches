-- 1. Payout Requests (Investor withdrawal requests of matured funds)
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES public.investments(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  bank_name text NOT NULL,
  account_holder text NOT NULL DEFAULT '',
  account_number text NOT NULL,
  branch_code text NOT NULL DEFAULT '',
  account_type text NOT NULL DEFAULT 'savings',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payout_requests_user_id_idx ON public.payout_requests(user_id);
CREATE INDEX IF NOT EXISTS payout_requests_status_idx ON public.payout_requests(status);

DROP TRIGGER IF EXISTS payout_requests_touch_updated_at ON public.payout_requests;
CREATE TRIGGER payout_requests_touch_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.payout_requests TO service_role;
GRANT SELECT, INSERT ON public.payout_requests TO authenticated;

DROP POLICY IF EXISTS "Investors can read their own payout requests" ON public.payout_requests;
CREATE POLICY "Investors can read their own payout requests"
  ON public.payout_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Investors can submit payout requests" ON public.payout_requests;
CREATE POLICY "Investors can submit payout requests"
  ON public.payout_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can update payout requests" ON public.payout_requests;
CREATE POLICY "Admins can update payout requests"
  ON public.payout_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Drivers (Fleet vehicle operators)
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  license_number text NOT NULL,
  vehicle_assigned text NOT NULL DEFAULT '',
  vehicle_reg text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS drivers_touch_updated_at ON public.drivers;
CREATE TRIGGER drivers_touch_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.drivers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;

DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
CREATE POLICY "Admins can manage drivers"
  ON public.drivers
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Driver Period Earnings (Commercial vehicle revenue & operating cost logs)
CREATE TABLE IF NOT EXISTS public.driver_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_revenue_cents integer NOT NULL DEFAULT 0,
  fuel_and_toll_cents integer NOT NULL DEFAULT 0,
  maintenance_cents integer NOT NULL DEFAULT 0,
  driver_payout_cents integer NOT NULL DEFAULT 0,
  net_fleet_earnings_cents integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS driver_earnings_driver_id_idx ON public.driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS driver_earnings_period_idx ON public.driver_earnings(period_start, period_end);

ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.driver_earnings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_earnings TO authenticated;

DROP POLICY IF EXISTS "Admins can manage driver earnings" ON public.driver_earnings;
CREATE POLICY "Admins can manage driver earnings"
  ON public.driver_earnings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
