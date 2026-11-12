import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import {
  adminGetAllPools,
  adminGetPoolContributions,
  adminCreatePool,
  adminApprovePoolContribution,
  adminRejectPoolContribution,
  adminMaturePool,
  adminUpdatePool,
} from "@/server-fn/asset-pools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRandFromCents } from "@/lib/investment";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, Loader2, PlusCircle, ChevronDown, ChevronUp,
  Bike, Car, Share2, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          clamped >= 100
            ? "bg-brand-green"
            : clamped >= 60
              ? "bg-primary"
              : "bg-primary/70"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    filling: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    active: "bg-brand-green/15 text-brand-green border-brand-green/30",
    matured: "bg-primary/15 text-primary border-primary/30",
    closed: "bg-secondary text-muted-foreground border-border",
  };
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase", cls[status] ?? cls.closed)}>
      {status}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return tier === "partner" ? (
    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
      Fleet Partner
    </span>
  ) : (
    <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
      Retail
    </span>
  );
}

// ─── Contributions sub-panel ────────────────────────────────────────────────

function ContributionsPanel({ poolId }: { poolId: string }) {
  const qc = useQueryClient();
  const fetchContribs = useServerFn(adminGetPoolContributions);
  const approveContrib = useServerFn(adminApprovePoolContribution);
  const rejectContrib = useServerFn(adminRejectPoolContribution);
  const [busy, setBusy] = useState<string | null>(null);

  const { data: contribs = [], isLoading } = useQuery({
    queryKey: ["admin-pool-contribs", poolId],
    queryFn: () => fetchContribs({ data: { poolId } }),
  });

  const handleApprove = async (id: string) => {
    setBusy(id);
    try {
      await approveContrib({ data: { contributionId: id } });
      qc.invalidateQueries({ queryKey: ["admin-pool-contribs", poolId] });
      qc.invalidateQueries({ queryKey: ["admin-all-pools"] });
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (id: string) => {
    setBusy(id);
    try {
      await rejectContrib({ data: { contributionId: id } });
      qc.invalidateQueries({ queryKey: ["admin-pool-contribs", poolId] });
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) return <p className="py-4 text-center text-sm text-muted-foreground">Loading contributions…</p>;

  if (contribs.length === 0)
    return <p className="py-4 text-center text-sm text-muted-foreground">No contributions yet.</p>;

  return (
    <div className="space-y-2 mt-3">
      {contribs.map((c: any) => (
        <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{c.profiles?.full_name ?? "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {formatRandFromCents(c.amount_cents)} · <TierBadge tier={c.tier} /> · ref: {c.payment_reference ?? "—"}
            </p>
          </div>
          <StatusBadge status={c.status} />
          {c.status === "pending" && (
            <div className="flex gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs text-brand-green hover:bg-brand-green/10"
                disabled={busy === c.id}
                onClick={() => handleApprove(c.id)}
              >
                {busy === c.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10"
                disabled={busy === c.id}
                onClick={() => handleReject(c.id)}
              >
                <XCircle className="size-3" />
                Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Single pool card ───────────────────────────────────────────────────────

function PoolCard({ pool, refetch }: { pool: any; refetch: () => void }) {
  const qc = useQueryClient();
  const maturePool = useServerFn(adminMaturePool);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [maturing, setMaturing] = useState(false);

  const pct = pool.target_amount_cents > 0
    ? Math.round((pool.current_amount_cents / pool.target_amount_cents) * 100)
    : 0;

  const openLandingPage = () => {
    const url = `/pools?pool=${encodeURIComponent(pool.id)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleMature = async () => {
    setMaturing(true);
    try {
      await maturePool({ data: { poolId: pool.id } });
      refetch();
      qc.invalidateQueries({ queryKey: ["admin-all-pools"] });
    } finally {
      setMaturing(false);
    }
  };

  const Icon = pool.vehicle_type === "motorcycle" ? Bike : Car;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-bold text-foreground truncate">{pool.title}</h3>
              <StatusBadge status={pool.status} />
              <TierBadge tier={pool.tier} />
            </div>
            {pool.vehicle_model && (
              <p className="text-xs text-muted-foreground mt-0.5">{pool.vehicle_model}{pool.vehicle_reg ? ` · ${pool.vehicle_reg}` : ""}</p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-bold text-foreground">{pct}% funded</span>
          </div>
          <ProgressBar pct={pct} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatRandFromCents(pool.current_amount_cents)} raised</span>
            <span>Target: {formatRandFromCents(pool.target_amount_cents)}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3" />
            {pool.return_rate_pct}% return
          </span>
          <span>· {pool.term_days}d cycle</span>
          <span>· min {formatRandFromCents(pool.min_contribution_cents)}</span>
          <span>· R600/wk rental</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs"
            onClick={() => setExpanded((p) => !p)}
          >
            {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            Contributions
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={openLandingPage}
          >
            <Share2 className="size-3" />
            Open page
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => setEditing(true)}
          >
            <TrendingUp className="size-3" />
            Edit
          </Button>
          {pool.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs text-brand-green border-brand-green/30 hover:bg-brand-green/10"
              onClick={handleMature}
              disabled={maturing}
            >
              {maturing ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />}
              Mark Matured
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className="border-t border-border bg-secondary/20 px-4 pb-4 sm:px-5">
          <EditPoolForm pool={pool} onDone={() => { setEditing(false); refetch(); qc.invalidateQueries({ queryKey: ["admin-all-pools"] }); }} />
        </div>
      )}

      {expanded && !editing && (
        <div className="border-t border-border bg-secondary/20 px-4 pb-4 sm:px-5">
          <ContributionsPanel poolId={pool.id} />
        </div>
      )}
    </div>
  );
}

// ─── Create Pool form ───────────────────────────────────────────────────────

function CreatePoolForm({ onDone }: { onDone: () => void }) {
  const createPool = useServerFn(adminCreatePool);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    vehicleModel: "",
    vehicleType: "motorcycle" as "motorcycle" | "vehicle",
    targetAmountRands: "13000",
    tier: "retail" as "retail" | "partner",
    minContributionRands: "100",
    termDays: "30",
    returnRatePct: "13",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const uploadVehicleImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("Image must be 5 MB or smaller.");
      return;
    }

    setErr(null);
    setUploadingImage(true);
    try {
      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const path = `vehicle-images/${Date.now()}-${safeName}`;

      const firstBucket = "vehicle-images";
      const { error: uploadError } = await supabase.storage
        .from(firstBucket)
        .upload(path, file, { upsert: true, contentType: file.type });

      let finalBucket = firstBucket;

      if (uploadError) {
        const fallbackBucket = "avatars";
        const fallbackResult = await supabase.storage
          .from(fallbackBucket)
          .upload(path, file, { upsert: true, contentType: file.type });
        if (fallbackResult.error) throw new Error(fallbackResult.error.message);
        finalBucket = fallbackBucket;
      }

      const { data } = supabase.storage.from(finalBucket).getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      setImageUrl(url);
      setImagePreview(url);
      return url;
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await createPool({
        data: {
          title: form.title,
          description: form.description,
          vehicleType: form.vehicleType,
          vehicleModel: form.vehicleModel,
          vehicleReg: "",
          targetAmountCents: Math.round(parseFloat(form.targetAmountRands) * 100),
          tier: form.tier,
          minContributionCents: Math.round(parseFloat(form.minContributionRands) * 100),
          termDays: parseInt(form.termDays),
          returnRatePct: parseFloat(form.returnRatePct),
          weeklyRentalRevenueCents: 60000,
          imageUrl: imageUrl || undefined,
        },
      });
      onDone();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to create pool");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <h3 className="font-display font-bold text-foreground">Create New Asset Pool</h3>

      {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="p-title">Pool Title *</Label>
          <Input id="p-title" value={form.title} onChange={set("title")} required placeholder="e.g. Honda CB125F — Delivery Pool #4" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-vehicle-type">Vehicle Type</Label>
          <select
            id="p-vehicle-type"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            value={form.vehicleType}
            onChange={set("vehicleType") as any}
          >
            <option value="motorcycle">Motorcycle</option>
            <option value="vehicle">Vehicle</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-model">Vehicle Model</Label>
          <Input id="p-model" value={form.vehicleModel} onChange={set("vehicleModel")} placeholder="e.g. Honda CB125F" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-target">Target Amount (R)</Label>
          <Input id="p-target" type="number" min="1000" value={form.targetAmountRands} onChange={set("targetAmountRands")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-min">Min Contribution (R)</Label>
          <Input id="p-min" type="number" min="100" value={form.minContributionRands} onChange={set("minContributionRands")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-tier">Tier</Label>
          <select
            id="p-tier"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            value={form.tier}
            onChange={set("tier") as any}
          >
            <option value="retail">Retail Rider Pool (13%–25%)</option>
            <option value="partner">Fleet Partner Circle (35%)</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-rate">Return Rate (%)</Label>
          <Input id="p-rate" type="number" min="1" max="50" step="0.5" value={form.returnRatePct} onChange={set("returnRatePct")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-term">Term (days)</Label>
          <Input id="p-term" type="number" min="30" max="90" value={form.termDays} onChange={set("termDays")} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="p-desc">Description</Label>
          <Input id="p-desc" value={form.description} onChange={set("description")} placeholder="Short description of the asset pool…" />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="p-image">Bike photo</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="p-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste a public image URL or upload a real bike photo"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? <Loader2 className="size-3.5 animate-spin" /> : "Upload"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadVehicleImage(e.target.files?.[0])}
            />
          </div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Asset preview"
              className="h-32 w-full rounded-xl border border-border object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <PlusCircle className="size-3.5" />}
          Create Pool
        </Button>
      </div>
    </form>
  );
}

function EditPoolForm({ pool, onDone }: { pool: any; onDone: () => void }) {
  const updatePool = useServerFn(adminUpdatePool);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState(pool.image_url ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(pool.image_url ?? null);
  const [form, setForm] = useState({
    title: pool.title ?? "",
    description: pool.description ?? "",
    vehicleModel: pool.vehicle_model ?? "",
    vehicleType: (pool.vehicle_type ?? "motorcycle") as "motorcycle" | "vehicle",
    targetAmountRands: String((pool.target_amount_cents ?? 0) / 100),
    tier: (pool.tier ?? "retail") as "retail" | "partner",
    minContributionRands: String((pool.min_contribution_cents ?? 0) / 100),
    termDays: String(pool.term_days ?? 30),
    returnRatePct: String(pool.return_rate_pct ?? 13),
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const uploadVehicleImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr("Image must be 5 MB or smaller.");
      return;
    }

    setErr(null);
    setUploadingImage(true);
    try {
      const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
      const path = `vehicle-images/${Date.now()}-${safeName}`;
      const firstBucket = "vehicle-images";
      const { error: uploadError } = await supabase.storage
        .from(firstBucket)
        .upload(path, file, { upsert: true, contentType: file.type });

      let finalBucket = firstBucket;
      if (uploadError) {
        const fallbackBucket = "avatars";
        const fallbackResult = await supabase.storage
          .from(fallbackBucket)
          .upload(path, file, { upsert: true, contentType: file.type });
        if (fallbackResult.error) throw new Error(fallbackResult.error.message);
        finalBucket = fallbackBucket;
      }

      const { data } = supabase.storage.from(finalBucket).getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      setImageUrl(url);
      setImagePreview(url);
      return url;
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await updatePool({
        data: {
          poolId: pool.id,
          title: form.title,
          description: form.description,
          vehicleType: form.vehicleType,
          vehicleModel: form.vehicleModel,
          vehicleReg: pool.vehicle_reg ?? "",
          targetAmountCents: Math.round(parseFloat(form.targetAmountRands) * 100),
          tier: form.tier,
          minContributionCents: Math.round(parseFloat(form.minContributionRands) * 100),
          termDays: parseInt(form.termDays),
          returnRatePct: parseFloat(form.returnRatePct),
          weeklyRentalRevenueCents: pool.weekly_rental_revenue_cents ?? 60000,
          imageUrl: imageUrl || null,
          status: pool.status,
        },
      });
      onDone();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed to update pool");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <h3 className="font-display font-bold text-foreground">Edit Asset Pool</h3>

      {err && <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="edit-p-title">Pool Title *</Label>
          <Input id="edit-p-title" value={form.title} onChange={set("title")} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-p-vehicle-type">Vehicle Type</Label>
          <select
            id="edit-p-vehicle-type"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            value={form.vehicleType}
            onChange={set("vehicleType") as any}
          >
            <option value="motorcycle">Motorcycle</option>
            <option value="vehicle">Vehicle</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-p-model">Vehicle Model</Label>
          <Input id="edit-p-model" value={form.vehicleModel} onChange={set("vehicleModel")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-p-target">Target Amount (R)</Label>
          <Input id="edit-p-target" type="number" min="1000" value={form.targetAmountRands} onChange={set("targetAmountRands")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-p-min">Min Contribution (R)</Label>
          <Input id="edit-p-min" type="number" min="100" value={form.minContributionRands} onChange={set("minContributionRands")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-p-tier">Tier</Label>
          <select
            id="edit-p-tier"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            value={form.tier}
            onChange={set("tier") as any}
          >
            <option value="retail">Retail Rider Pool</option>
            <option value="partner">Fleet Partner Circle</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-p-rate">Return Rate (%)</Label>
          <Input id="edit-p-rate" type="number" min="1" max="50" step="0.5" value={form.returnRatePct} onChange={set("returnRatePct")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="edit-p-term">Term (days)</Label>
          <Input id="edit-p-term" type="number" min="30" max="90" value={form.termDays} onChange={set("termDays")} />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label htmlFor="edit-p-desc">Description</Label>
          <Input id="edit-p-desc" value={form.description} onChange={set("description")} />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="edit-p-image">Bike photo</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="edit-p-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste a public image URL or upload a real bike photo"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
            >
              {uploadingImage ? <Loader2 className="size-3.5 animate-spin" /> : "Upload"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadVehicleImage(e.target.files?.[0])}
            />
          </div>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Asset preview"
              className="h-32 w-full rounded-xl border border-border object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
          Save Pool
        </Button>
      </div>
    </form>
  );
}

// ─── Main exported component ────────────────────────────────────────────────

export function AssetPoolsAdminPanel() {
  const fetchPools = useServerFn(adminGetAllPools);
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: pools = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-all-pools"],
    queryFn: fetchPools,
  });

  const filtered = filterStatus === "all" ? pools : pools.filter((p: any) => p.status === filterStatus);

  const stats = {
    total: pools.length,
    filling: pools.filter((p: any) => p.status === "filling").length,
    active: pools.filter((p: any) => p.status === "active").length,
    matured: pools.filter((p: any) => p.status === "matured").length,
  };

  return (
    <div className="space-y-5">
      {/* KPI bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Total Pools", value: stats.total, tone: "neutral" },
          { label: "Filling", value: stats.filling, tone: "amber" },
          { label: "Active", value: stats.active, tone: "primary" },
          { label: "Matured", value: stats.matured, tone: "green" },
        ].map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-2xl border px-3 py-2.5",
              s.tone === "amber" ? "border-amber-500/30 bg-amber-500/5"
              : s.tone === "primary" ? "border-primary/30 bg-primary/5"
              : s.tone === "green" ? "border-brand-green/30 bg-brand-green/5"
              : "border-border bg-card"
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={cn(
              "mt-0.5 font-display text-xl font-bold",
              s.tone === "amber" ? "text-amber-600"
              : s.tone === "primary" ? "text-primary"
              : s.tone === "green" ? "text-brand-green"
              : "text-foreground"
            )}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {["all", "filling", "active", "matured", "closed"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors",
                filterStatus === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => setShowCreate((p) => !p)}
        >
          <PlusCircle className="size-3.5" />
          New Pool
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <CreatePoolForm
          onDone={() => {
            setShowCreate(false);
            qc.invalidateQueries({ queryKey: ["admin-all-pools"] });
          }}
        />
      )}

      {/* Pools list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" />
          Loading pools…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center text-muted-foreground">
          <Bike className="mx-auto mb-3 size-8 opacity-40" />
          <p className="text-sm">No pools found. Create the first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pool: any) => (
            <PoolCard key={pool.id} pool={pool} refetch={() => refetch()} />
          ))}
        </div>
      )}
    </div>
  );
}
