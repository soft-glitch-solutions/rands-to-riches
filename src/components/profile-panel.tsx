import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CheckCircle2, Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveBankDetails, updateMyProfile } from "@/server-fn/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProfileData {
  userId: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bankName: string | null;
  bankAccountHolder: string | null;
  bankAccountNumber: string | null;
  bankBranchCode: string | null;
  bankAccountType: string | null;
}

const SA_BANKS = [
  "Capitec Bank",
  "FNB / FirstRand",
  "Standard Bank",
  "Nedbank",
  "ABSA Bank",
  "TymeBank",
  "Discovery Bank",
  "African Bank",
];

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function ProfilePanel({ profile }: { profile: ProfileData }) {
  const queryClient = useQueryClient();
  const saveProfile = useServerFn(updateMyProfile);
  const saveBank = useServerFn(saveBankDetails);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [bankName, setBankName] = useState(profile.bankName ?? SA_BANKS[0]!);
  const [holder, setHolder] = useState(profile.bankAccountHolder ?? "");
  const [accountNumber, setAccountNumber] = useState(profile.bankAccountNumber ?? "");
  const [branchCode, setBranchCode] = useState(profile.bankBranchCode ?? "");
  const [accountType, setAccountType] = useState(profile.bankAccountType ?? "Savings");

  const [busy, setBusy] = useState<"profile" | "bank" | "avatar" | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["my-investments"] });
  const flash = (kind: "ok" | "error", text: string) => {
    setMessage({ kind, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const onPickAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return flash("error", "Please choose an image file.");
    if (file.size > MAX_AVATAR_BYTES) return flash("error", "Image must be 2 MB or smaller.");

    setBusy("avatar");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${profile.userId}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      await saveProfile({ data: { avatarUrl: url } });
      setAvatarUrl(url);
      await refresh();
      flash("ok", "Profile picture updated.");
    } catch (err) {
      flash("error", err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) return flash("error", "Please enter your full name.");
    setBusy("profile");
    try {
      await saveProfile({ data: { fullName, phone } });
      await refresh();
      flash("ok", "Profile saved.");
    } catch (err) {
      flash("error", err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(null);
    }
  };

  const submitBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6,16}$/.test(accountNumber.replace(/\s/g, "")))
      return flash("error", "Enter a valid account number (digits only).");
    if (branchCode && !/^\d{6}$/.test(branchCode.replace(/\s/g, "")))
      return flash("error", "Branch code must be 6 digits.");
    setBusy("bank");
    try {
      await saveBank({
        data: {
          bankName,
          accountHolder: holder || fullName,
          accountNumber: accountNumber.replace(/\s/g, ""),
          branchCode: branchCode.replace(/\s/g, ""),
          accountType,
        },
      });
      await refresh();
      flash("ok", "Bank details saved.");
    } catch (err) {
      flash("error", err instanceof Error ? err.message : "Could not save bank details.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
      <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
        Profile & payout details
      </h2>
      <p className="text-xs text-muted-foreground">
        Your payouts are only ever sent to the bank account saved here.
      </p>

      {message && (
        <p
          role="status"
          className={`mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${
            message.kind === "ok"
              ? "bg-accent text-accent-foreground"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message.kind === "ok" && <CheckCircle2 className="size-4" />}
          {message.text}
        </p>
      )}

      {/* Avatar */}
      <div className="mt-5 flex items-center gap-4">
        <div className="relative size-20 overflow-hidden rounded-full border border-border bg-secondary">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Your profile" className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-muted-foreground">
              <User className="size-8" />
            </span>
          )}
          {busy === "avatar" && (
            <span className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin text-primary" />
            </span>
          )}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickAvatar(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="mr-1.5 size-4" /> Change picture
          </Button>
          <p className="mt-1 text-[11px] text-muted-foreground">PNG or JPG, up to 2 MB.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Profile info */}
        <form onSubmit={submitProfile} className="space-y-4">
          <h3 className="font-display text-base font-bold text-foreground">Personal information</h3>
          <div>
            <Label htmlFor="pf-name">Full name</Label>
            <Input id="pf-name" className="mt-1.5" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="pf-email">Email</Label>
            <Input id="pf-email" className="mt-1.5" value={profile.email ?? ""} disabled />
          </div>
          <div>
            <Label htmlFor="pf-phone">Phone</Label>
            <Input id="pf-phone" className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="082 123 4567" autoComplete="tel" />
          </div>
          <Button type="submit" disabled={busy !== null} className="rounded-xl font-bold">
            {busy === "profile" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save profile
          </Button>
        </form>

        {/* Bank details */}
        <form onSubmit={submitBank} className="space-y-4">
          <h3 className="font-display text-base font-bold text-foreground">Bank details for payouts</h3>
          <div>
            <Label htmlFor="bk-bank">Bank</Label>
            <select
              id="bk-bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {SA_BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="bk-holder">Account holder</Label>
            <Input id="bk-holder" className="mt-1.5" value={holder} onChange={(e) => setHolder(e.target.value)} placeholder={fullName || "Name on the account"} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="bk-number">Account number</Label>
              <Input id="bk-number" inputMode="numeric" className="mt-1.5" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="bk-branch">Branch code</Label>
              <Input id="bk-branch" inputMode="numeric" className="mt-1.5" value={branchCode} onChange={(e) => setBranchCode(e.target.value)} placeholder="e.g. 470010" />
            </div>
          </div>
          <div>
            <Label htmlFor="bk-type">Account type</Label>
            <select
              id="bk-type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option>Savings</option>
              <option>Cheque</option>
              <option>Transmission</option>
            </select>
          </div>
          <Button type="submit" disabled={busy !== null} className="rounded-xl font-bold">
            {busy === "bank" ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Save bank details
          </Button>
        </form>
      </div>
    </section>
  );
}
