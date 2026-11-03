-- Profiles: avatar + SA bank payout details
ALTER TABLE public.profiles
  ADD COLUMN avatar_url text,
  ADD COLUMN bank_name text,
  ADD COLUMN bank_account_holder text,
  ADD COLUMN bank_account_number text,
  ADD COLUMN bank_branch_code text,
  ADD COLUMN bank_account_type text;

-- Investments: new cycles start as 'pending' until an admin approves payment.
ALTER TABLE public.investments
  ADD COLUMN payment_reference text,
  DROP CONSTRAINT investments_status_check;
ALTER TABLE public.investments
  ADD CONSTRAINT investments_status_check
  CHECK (status IN ('pending','active','matured','withdrawn','rejected'));
ALTER TABLE public.investments
  ALTER COLUMN status SET DEFAULT 'pending';

COMMENT ON COLUMN public.investments.payment_reference IS 'Unique reference investors use on their EFT payment so the deposit can be matched to this cycle';

-- 30/60/90 day plans are all valid
ALTER TABLE public.investments
  DROP CONSTRAINT investments_term_days_check;
ALTER TABLE public.investments
  ADD CONSTRAINT investments_term_days_check CHECK (term_days IN (30,60,90));

GRANT UPDATE ON public.investments TO authenticated;

-- Every new signup gets the 'user' role automatically (first account still becomes admin).
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

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Private avatars bucket: owners manage their own folder, no public access.
CREATE POLICY "avatars_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
