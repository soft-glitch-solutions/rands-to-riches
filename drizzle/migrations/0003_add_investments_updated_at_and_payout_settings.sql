-- 1. investments.updated_at — used by the admin activity feed
ALTER TABLE public.investments
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
COMMENT ON COLUMN public.investments.updated_at IS 'Last time this cycle changed (approval, rejection, etc.)';

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS investments_touch_updated_at ON public.investments;
CREATE TRIGGER investments_touch_updated_at
  BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2. payout_settings — the bank account investors pay into; admins edit it
CREATE TABLE public.payout_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bank text NOT NULL DEFAULT '',
  account_name text NOT NULL DEFAULT '',
  account_number text NOT NULL DEFAULT '',
  branch_code text NOT NULL DEFAULT '',
  account_type text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE SELECT ON public.payout_settings FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.payout_settings FROM authenticated;
GRANT ALL ON public.payout_settings TO service_role;

ALTER TABLE public.payout_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payout_settings_select_single_row"
  ON public.payout_settings
  FOR SELECT
  TO authenticated
  USING (id = 1);

CREATE POLICY "payout_settings_update_admin_only"
  ON public.payout_settings
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));