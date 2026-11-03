import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CheckCircle2, Loader2, User, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveBankDetails, updateMyProfile } from "@/server-fn/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

type Tab = "personal" | "bank";

export function ProfilePanel({
  profile,
  showIdentity = true,
}: {
  profile: ProfileData;
  /** Set false when the parent already renders avatar + email (e.g. dashboard greeting). */
  showIdentity?: boolean;
}) {
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

  const [tab, setTab] = useState<Tab>("personal");

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

  /* ---------- Fragments ---------- */

  const statusBanner = message && (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold",
        message.kind === "ok"
          ? "bg-accent text-accent-foreground"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {message.kind === "ok" ? (
        <CheckCircle2 className="size-3.5 shrink-0" />
      ) : (
        <XCircle className="size-3.5 shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );

  /** Full avatar block — only used when parent doesn't already show identity. */
  const avatarBlock = showIdentity && (
    <div className="flex items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border bg-secondary sm:size-16">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Your profile" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <User className="size-6" />
          </span>
        )}
        {busy === "avatar" && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-4 animate-spin text-primary" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">
          {fullName || "Your name"}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {profile.email ?? "—"}
        </p>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => fileRef.current?.click()}
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
        >
          <Camera className="size-3" /> Change photo
        </button>
      </div>
    </div>
  );

  /** Inline "change photo" link — used when identity is hidden. */
  const changePhotoButton = !showIdentity && (
    <button
      type="button"
      disabled={busy !== null}
      onClick={() => fileRef.current?.click()}
      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
    >
      {busy === "avatar" ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <Camera className="size-3" />
      )}
      Change profile photo
    </button>
  );

  const personalForm = (
    <form onSubmit={submitProfile} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Personal information
        </h3>
        {changePhotoButton}
      </div>
      <div>
        <Label htmlFor="pf-name" className="text-[11px]">Full name</Label>
        <Input
          id="pf-name"
          className="mt-1 h-9 text-sm"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <div>
        <Label htmlFor="pf-email" className="text-[11px]">Email</Label>
        <Input
          id="pf-email"
          className="mt-1 h-9 text-sm"
          value={profile.email ?? ""}
          disabled
        />
      </div>
      <div>
        <Label htmlFor="pf-phone" className="text-[11px]">Phone</Label>
        <Input
          id="pf-phone"
          className="mt-1 h-9 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="082 123 4567"
          autoComplete="tel"
        />
      </div>
      <Button
        type="submit"
        disabled={busy !== null}
        size="sm"
        className="w-full rounded-lg text-xs font-bold sm:w-auto"
      >
        {busy === "profile" && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
        Save profile
      </Button>
    </form>
  );

  const bankForm = (
    <form onSubmit={submitBank} className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Bank details for payouts
      </h3>
      <div>
        <Label htmlFor="bk-bank" className="text-[11px]">Bank</Label>
        <select
          id="bk-bank"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {SA_BANKS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="bk-holder" className="text-[11px]">Account holder</Label>
        <Input
          id="bk-holder"
          className="mt-1 h-9 text-sm"
          value={holder}
          onChange={(e) => setHolder(e.target.value)}
          placeholder={fullName || "Name on the account"}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="bk-number" className="text-[11px]">Account no.</Label>
          <Input
            id="bk-number"
            inputMode="numeric"
            className="mt-1 h-9 text-sm"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bk-branch" className="text-[11px]">Branch</Label>
          <Input
            id="bk-branch"
            inputMode="numeric"
            className="mt-1 h-9 text-sm"
            value={branchCode}
            onChange={(e) => setBranchCode(e.target.value)}
            placeholder="470010"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="bk-type" className="text-[11px]">Account type</Label>
        <select
          id="bk-type"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option>Savings</option>
          <option>Cheque</option>
          <option>Transmission</option>
        </select>
      </div>
      <Button
        type="submit"
        disabled={busy !== null}
        size="sm"
        className="w-full rounded-lg text-xs font-bold sm:w-auto"
      >
        {busy === "bank" && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
        Save bank details
      </Button>
    </form>
  );

  /* ---------- Render ---------- */

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickAvatar(e.target.files?.[0])}
      />

      {avatarBlock}
      {statusBanner}

      {/* MOBILE: tabbed */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 rounded-xl bg-secondary/80 p-1">
          <button
            type="button"
            onClick={() => setTab("personal")}
            className={cn(
              "rounded-lg py-1.5 text-xs font-bold transition-all",
              tab === "personal"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Personal
          </button>
          <button
            type="button"
            onClick={() => setTab("bank")}
            className={cn(
              "rounded-lg py-1.5 text-xs font-bold transition-all",
              tab === "bank"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Bank
          </button>
        </div>
        <div className="mt-3">
          {tab === "personal" ? personalForm : bankForm}
        </div>
      </div>

      {/* DESKTOP: two columns */}
      <div className="hidden gap-8 lg:grid lg:grid-cols-2">
        {personalForm}
        {bankForm}
      </div>
    </div>
  );
}