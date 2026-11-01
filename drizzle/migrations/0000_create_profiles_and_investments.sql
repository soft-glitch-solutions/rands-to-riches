-- Investor profiles (name + contact)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Investments: R100 (10000c) to R1,000 (100000c), 30-day cycle
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents >= 10000 AND amount_cents <= 100000),
  term_days integer NOT NULL DEFAULT 30 CHECK (term_days = 30),
  maturity_action text NOT NULL DEFAULT 'withdraw' CHECK (maturity_action IN ('withdraw','reinvest')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','matured','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  matures_at timestamptz NOT NULL DEFAULT now() + interval '30 days'
);

GRANT SELECT, INSERT ON public.investments TO authenticated;
GRANT ALL ON public.investments TO service_role;

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investments_select_own" ON public.investments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "investments_insert_own" ON public.investments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);