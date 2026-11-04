import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Loader2, ShieldCheck, CheckCircle2, XCircle, Users, Wallet,
  BarChart3, Download, ArrowUpRight, ListChecks, ChevronLeft,
  FileText, Clock, Calendar,
} from "lucide-react";
import {
  approveInvestment,
  getAdminOverview,
  rejectInvestment,
  setUserRole,
  getAdminInvestorDetail,
  getPayoutForecast,
} from "@/server-fn/admin";
import { isUserAdmin } from "@/server-fn/investments";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { formatDate, formatRandFromCents } from "@/lib/investment";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const admin = await isUserAdmin();
    if (!admin) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin — MOTUS Capital" }] }),
  component: AdminPage,
});

type Tab = "overview" | "payments" | "investors" | "reports";

const NAV: { id: Tab; label: string; icon: typeof Wallet }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "payments", label: "Payments", icon: ListChecks },
  { id: "investors", label: "Investors", icon: Users },
  { id: "reports", label: "Reports", icon: FileText },
];

/* ---------- Small UI ---------- */

function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "primary" | "amber" | "green";
}) {
  const toneCls =
    tone === "primary"
      ? "text-primary"
      : tone === "amber"
        ? "text-amber-600"
        : tone === "green"
          ? "text-brand-green"
          : "text-foreground";
  const borderCls =
    tone === "amber"
      ? "border-amber-500/30 bg-amber-500/5"
      : tone === "green"
        ? "border-brand-green/30 bg-accent/30"
        : "border-border bg-card";
  return (
    <div className={`rounded-2xl border ${borderCls} px-3.5 py-3`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-display text-lg font-bold sm:text-xl ${toneCls}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ---------- Investor drilldown ---------- */

function InvestorDrilldown({
  userId,
  onBack,
  isSelf,
  rolePending,
  onChangeRole,
}: {
  userId: string;
  onBack: () => void;
  isSelf: boolean;
  rolePending: boolean;
  onChangeRole: (role: "admin" | "user") => void;
}) {
  const fetchDetail = useServerFn(getAdminInvestorDetail);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-investor-detail", userId],
    queryFn: () => fetchDetail({ data: { userId } }),
  });

  const role = data?.roles.includes("admin") ? "admin" : "user";

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
      >
        <ChevronLeft className="size-3.5" /> Back to investors
      </button>

      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin text-primary" /> Loading investor…
        </div>
      ) : error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error instanceof Error ? error.message : "Could not load investor."}
        </p>
      ) : data ? (
        <>
          {/* Header card */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-foreground">
                  {data.profile?.fullName ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.profile?.email ?? "—"}
                  {data.profile?.phone ? ` · ${data.profile.phone}` : ""}
                </p>
                {data.profile?.joinedAt && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Joined {formatDate(data.profile.joinedAt)}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    role === "admin"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {role}
                </span>
                <select
                  aria-label="Change role"
                  value={role}
                  disabled={isSelf || rolePending}
                  onChange={(e) =>
                    onChangeRole(e.target.value === "admin" ? "admin" : "user")
                  }
                  className="h-7 rounded-md border border-input bg-background px-1.5 text-[11px] font-bold disabled:opacity-50"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {data.profile?.bank?.accountNumber && (
              <div className="mt-3 rounded-xl bg-secondary/40 p-2.5 text-[11px]">
                <p className="font-bold text-foreground">
                  {data.profile.bank.name ?? "Bank"} ·{" "}
                  {data.profile.bank.type ?? "Account"}
                </p>
                <p className="text-muted-foreground">
                  {data.profile.bank.holder ?? "—"} ·{" "}
                  {data.profile.bank.accountNumber} ·{" "}
                  {data.profile.bank.branchCode ?? "—"}
                </p>
              </div>
            )}
          </div>

          {/* Investments */}
          <div>
            <h3 className="mb-2 font-display text-sm font-bold text-foreground">
              All cycles ({data.investments.length})
            </h3>
            {data.investments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No cycles yet.
              </div>
            ) : (
              <div className="space-y-2">
                {data.investments.map((inv) => {
                  const stateColor =
                    inv.status === "matured" || inv.status === "withdrawn"
                      ? "border-border/60 bg-secondary/20"
                      : inv.status === "active"
                        ? "border-border bg-card"
                        : inv.status === "pending"
                          ? "border-amber-500/40 bg-amber-500/5"
                          : "border-destructive/30 bg-destructive/5";
                  return (
                    <div
                      key={inv.id}
                      className={`rounded-xl border p-3 ${stateColor}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold text-foreground">
                            {formatRandFromCents(inv.amountCents)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {inv.termDays}d · created{" "}
                            {formatDate(inv.createdAt)}
                            {inv.status === "active" &&
                              ` · matures ${formatDate(inv.maturesAt)}`}
                          </p>
                          {inv.paymentReference && (
                            <p className="mt-1 inline-block rounded bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                              {inv.paymentReference}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                            inv.status === "matured"
                              ? "bg-brand-green text-white"
                              : inv.status === "withdrawn"
                                ? "bg-secondary text-secondary-foreground"
                                : inv.status === "active"
                                  ? "bg-primary/10 text-primary"
                                  : inv.status === "pending"
                                    ? "bg-amber-500/15 text-amber-700"
                                    : "bg-destructive/10 text-destructive",
                          )}
                        >
                          {inv.status}
                        </span>
                      </div>
                      {(inv.status === "active" || inv.status === "matured") && (
                        <p className="mt-1 text-[11px] text-brand-green">
                          +{formatRandFromCents(inv.profitEstimateCents)} est. profit
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ---------- Main page ---------- */

function AdminPage() {
  const queryClient = useQueryClient();
  const fetchOverview = useServerFn(getAdminOverview);
  const approve = useServerFn(approveInvestment);
  const reject = useServerFn(rejectInvestment);
  const changeRole = useServerFn(setUserRole);
  const fetchForecast = useServerFn(getPayoutForecast);

  const [tab, setTab] = useState<Tab>("overview");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  const flash = (kind: "ok" | "error", text: string) => {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 4500);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchOverview,
  });

  const { data: forecast } = useQuery({
    queryKey: ["admin-forecast"],
    queryFn: fetchForecast,
    enabled: tab === "overview" || tab === "reports",
  });

  const { data: me } = useQuery({
    queryKey: ["current-user-id"],
    queryFn: async () =>
      (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    queryClient.invalidateQueries({ queryKey: ["admin-forecast"] });
    if (selectedUserId) {
      queryClient.invalidateQueries({
        queryKey: ["admin-investor-detail", selectedUserId],
      });
    }
  };

  const onError = (err: unknown) =>
    flash("error", err instanceof Error ? err.message : "Something went wrong.");

  const approveMut = useMutation({
    mutationFn: (id: string) => approve({ data: { id } }),
    onSuccess: async () => {
      await refresh();
      flash("ok", "Payment approved.");
    },
    onError,
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => reject({ data: { id } }),
    onSuccess: async () => {
      await refresh();
      flash("ok", "Payment rejected.");
    },
    onError,
  });

  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "user" }) =>
      changeRole({ data: v }),
    onSuccess: async () => {
      await refresh();
      flash("ok", "Role updated.");
    },
    onError,
  });

  const working = approveMut.isPending || rejectMut.isPending;

  /* ---------- CSV helpers ---------- */

  const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportInvestorsCsv = () => {
    if (!data) return;
    downloadCsv(
      `motus-investors-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Name",
        "Email",
        "Phone",
        "Joined",
        "Cycles",
        "Total invested",
        "Active",
        "Matured",
        "Pending",
        "Role",
      ],
      data.investors.map((i) => [
        i.fullName ?? "",
        i.email ?? "",
        i.phone ?? "",
        i.joinedAt ? formatDate(i.joinedAt) : "",
        String(i.investmentCount),
        (i.totalInvestedCents / 100).toFixed(2),
        (i.activeCents / 100).toFixed(2),
        (i.maturedCents / 100).toFixed(2),
        (i.pendingCents / 100).toFixed(2),
        i.roles.includes("admin") ? "admin" : "user",
      ]),
    );
  };

  const exportForecastCsv = () => {
    if (!forecast) return;
    downloadCsv(
      `motus-forecast-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Window", "Cycles", "Principal (R)", "Profit (R)", "Total (R)"],
      (
        [
          ["This month", forecast.thisMonth],
          ["Next month", forecast.nextMonth],
          ["Next 90 days", forecast.next90],
        ] as const
      ).map(([label, b]) => [
        label,
        String(b.maturities),
        (b.principalCents / 100).toFixed(2),
        (b.profitCents / 100).toFixed(2),
        (b.totalCents / 100).toFixed(2),
      ]),
    );
  };

  const exportPaymentsCsv = () => {
    if (!data) return;
    downloadCsv(
      `motus-pending-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Investor", "Email", "Amount (R)", "Term (days)", "Reference", "Created"],
      data.pending.map((p) => [
        p.fullName ?? "",
        p.email ?? "",
        (p.amountCents / 100).toFixed(2),
        String(p.termDays),
        p.paymentReference ?? "",
        formatDate(p.createdAt),
      ]),
    );
  };

  /* ============================================================
     TABS
  ============================================================ */

  const overviewTab = data && (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
        <KpiCard label="Investors" value={String(data.investorCount)} />
        <KpiCard
          label="Pending"
          value={String(data.pendingCount)}
          hint="Awaiting approval"
          tone="amber"
        />
        <KpiCard
          label="Total invested"
          value={formatRandFromCents(data.totalInvestedCents)}
        />
        <KpiCard
          label="Active cycles"
          value={formatRandFromCents(data.activeCents)}
          tone="primary"
        />
        <KpiCard
          label="Matured"
          value={formatRandFromCents(data.maturedCents)}
          tone="green"
        />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Next-month payout forecast
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              {forecast
                ? formatRandFromCents(forecast.nextMonth.totalCents)
                : "—"}
            </p>
            {forecast && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {forecast.nextMonth.maturities} cycles maturing ·{" "}
                {formatRandFromCents(forecast.nextMonth.profitCents)} profit
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setTab("reports")}
            className="hidden rounded-lg text-xs font-bold sm:inline-flex"
          >
            See report →
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-foreground">
              Pending payments
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTab("payments")}
              className="h-7 text-[11px] font-bold text-primary"
            >
              Review →
            </Button>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-amber-600">
              {data.pendingCount}
            </span>
            <span className="text-xs text-muted-foreground">
              waiting for confirmation
            </span>
          </div>
          {data.pending.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="mt-2 flex items-center justify-between rounded-xl border border-border/70 bg-secondary/40 px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {p.fullName ?? p.email ?? "—"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatRandFromCents(p.amountCents)} · {p.termDays}d
                </p>
              </div>
              <Button
                size="sm"
                disabled={working}
                onClick={() => approveMut.mutate(p.id)}
                className="h-7 rounded-md text-[10px] font-bold"
              >
                Approve
              </Button>
            </div>
          ))}
          {data.pendingCount === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">All clear ✓</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="font-display text-base font-bold text-foreground">
            Recent activity
          </h3>
          <div className="mt-3 space-y-2">
            {data.recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              data.recentActivity.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-2 text-xs"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    {a.action === "approved" && (
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-brand-green" />
                    )}
                    {a.action === "rejected" && (
                      <XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                    )}
                    {a.action === "created" && (
                      <Clock className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {a.action === "approved" && "Approved "}
                        {a.action === "rejected" && "Rejected "}
                        {a.action === "created" && "Created "}
                        {formatRandFromCents(a.amountCents)}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {a.fullName ?? a.email ?? "—"} · {formatDate(a.at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const paymentsTab = data && (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            Pending payments
          </h2>
          <p className="text-xs text-muted-foreground">
            Match reference to bank deposit before approving.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            {data.pendingCount}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={exportPaymentsCsv}
            className="h-8 rounded-lg text-xs font-bold"
          >
            <Download className="mr-1 size-3.5" /> CSV
          </Button>
        </div>
      </div>

      {data.pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <CheckCircle2 className="mx-auto size-8 text-brand-green" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            All caught up
          </p>
          <p className="text-xs text-muted-foreground">
            No pending payments right now.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.pending.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5 sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-foreground">
                    {formatRandFromCents(p.amountCents)}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-foreground">
                    {p.fullName ?? "—"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {p.email ?? "—"} · {p.termDays}d ·{" "}
                    {formatDate(p.createdAt)}
                  </p>
                  {p.paymentReference && (
                    <p className="mt-1 inline-block rounded-md bg-card px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">
                      Ref: {p.paymentReference}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    disabled={working}
                    onClick={() => approveMut.mutate(p.id)}
                    className="h-8 rounded-lg text-xs font-bold"
                  >
                    <CheckCircle2 className="mr-1 size-3.5" />
                    <span className="hidden sm:inline">Approve</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={working}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Reject ${formatRandFromCents(
                            p.amountCents,
                          )} from ${p.fullName ?? p.email ?? "this investor"}?`,
                        )
                      )
                        rejectMut.mutate(p.id);
                    }}
                    className="h-8 rounded-lg text-xs font-bold text-destructive"
                  >
                    <XCircle className="mr-1 size-3.5" />
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const investorsTab = data && (
    <div className="space-y-4">
      {selectedUserId ? (
        <InvestorDrilldown
          userId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
          isSelf={selectedUserId === me}
          rolePending={roleMut.isPending}
          onChangeRole={(role) => {
            if (window.confirm(`Change role to ${role}?`))
              roleMut.mutate({ userId: selectedUserId, role });
          }}
        />
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
                Investors & roles
              </h2>
              <p className="text-xs text-muted-foreground">
                Tap a row to see all their cycles.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={exportInvestorsCsv}
              className="h-8 rounded-lg text-xs font-bold"
            >
              <Download className="mr-1 size-3.5" /> CSV
            </Button>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Investor</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 text-right font-semibold">Cycles</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Active</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.investors.map((inv) => {
                  const isSelf = inv.userId === me;
                  const role = inv.roles.includes("admin") ? "admin" : "user";
                  return (
                    <tr
                      key={inv.userId}
                      className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                      onClick={() => setSelectedUserId(inv.userId)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">
                          {inv.fullName ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.email ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {inv.joinedAt ? formatDate(inv.joinedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {inv.investmentCount}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {formatRandFromCents(inv.totalInvestedCents)}
                      </td>
                      <td className="px-4 py-3 text-right text-primary">
                        {formatRandFromCents(inv.activeCents)}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          aria-label="Role"
                          value={role}
                          disabled={isSelf || roleMut.isPending}
                          onChange={(e) => {
                            const r =
                              e.target.value === "admin" ? "admin" : "user";
                            if (window.confirm(`Change role to ${r}?`))
                              roleMut.mutate({ userId: inv.userId, role: r });
                          }}
                          className="h-7 rounded-md border border-input bg-background px-1.5 text-[11px] font-bold disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ArrowUpRight className="ml-auto size-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {data.investors.map((inv) => {
              const role = inv.roles.includes("admin") ? "admin" : "user";
              return (
                <button
                  key={inv.userId}
                  onClick={() => setSelectedUserId(inv.userId)}
                  className="w-full rounded-2xl border border-border bg-card p-3.5 text-left transition-colors active:bg-secondary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">
                        {inv.fullName ?? "—"}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {inv.email ?? "—"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {role}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {inv.investmentCount} cycles
                    </span>
                    <span className="font-bold text-foreground">
                      {formatRandFromCents(inv.totalInvestedCents)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );

  const reportsTab = (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground sm:text-xl">
            Payout forecast
          </h2>
          <p className="text-xs text-muted-foreground">
            Estimated principal + profit maturing in each window.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={exportForecastCsv}
          disabled={!forecast}
          className="h-8 rounded-lg text-xs font-bold"
        >
          <Download className="mr-1 size-3.5" /> CSV
        </Button>
      </div>

      {!forecast ? (
        <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin text-primary" /> Building
          forecast…
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["This month", forecast.thisMonth],
                ["Next month", forecast.nextMonth],
                ["Next 90 days", forecast.next90],
              ] as const
            ).map(([label, b]) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
                  {formatRandFromCents(b.totalCents)}
                </p>
                <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">
                      {b.maturities}
                    </span>{" "}
                    cycles
                  </p>
                  <p>
                    Principal:{" "}
                    <span className="font-semibold text-foreground">
                      {formatRandFromCents(b.principalCents)}
                    </span>
                  </p>
                  <p>
                    Profit:{" "}
                    <span className="font-semibold text-brand-green">
                      {formatRandFromCents(b.profitCents)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Composition
            </p>
            <div className="mt-3 space-y-3">
              {(
                [
                  ["This month", forecast.thisMonth],
                  ["Next month", forecast.nextMonth],
                  ["Next 90 days", forecast.next90],
                ] as const
              ).map(([label, b]) => {
                const total = Math.max(forecast.next90.totalCents, 1);
                const principalPct = (b.principalCents / total) * 100;
                const profitPct = (b.profitCents / total) * 100;
                return (
                  <div key={label}>
                    <div className="mb-1 flex justify-between text-[11px]">
                      <span className="font-semibold text-foreground">
                        {label}
                      </span>
                      <span className="text-muted-foreground">
                        {formatRandFromCents(b.totalCents)}
                      </span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${principalPct}%` }}
                      />
                      <div
                        className="h-full bg-brand-green"
                        style={{ width: `${profitPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-primary" /> Principal
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-brand-green" /> Profit
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Exports
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportInvestorsCsv}
                className="h-9 rounded-lg text-xs font-bold"
              >
                <Download className="mr-1.5 size-3.5" /> Investors CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportForecastCsv}
                className="h-9 rounded-lg text-xs font-bold"
              >
                <Download className="mr-1.5 size-3.5" /> Forecast CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={exportPaymentsCsv}
                className="h-9 rounded-lg text-xs font-bold"
              >
                <Download className="mr-1.5 size-3.5" /> Pending CSV
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const tabContent: Record<Tab, React.ReactNode> = {
    overview: overviewTab,
    payments: paymentsTab,
    investors: investorsTab,
    reports: reportsTab,
  };

  const currentLabel = NAV.find((n) => n.id === tab)?.label ?? "";

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
          <BrandMark />
          <div className="flex items-center gap-1.5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden text-xs sm:inline-flex"
            >
              <Link to="/dashboard">
                <ShieldCheck className="mr-1.5 size-3.5" /> Back to dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 sm:hidden"
            >
              <Link to="/dashboard" aria-label="Back to dashboard">
                <ShieldCheck className="size-4 text-primary" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          className={cn(
            "fixed inset-x-4 bottom-24 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl sm:bottom-6 sm:left-auto sm:right-6",
            notice.kind === "ok"
              ? "bg-foreground text-background"
              : "bg-destructive text-destructive-foreground",
          )}
        >
          {notice.kind === "ok" ? (
            <CheckCircle2 className="size-4 shrink-0 text-brand-green" />
          ) : (
            <XCircle className="size-4 shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* MOBILE */}
      <div className="lg:hidden">
        <main className="mx-auto max-w-md px-4 pt-4 pb-28">
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            <h1 className="font-display text-lg font-bold text-foreground">
              {currentLabel}
            </h1>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />{" "}
              Loading…
            </div>
          ) : error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error instanceof Error ? error.message : "Could not load."}
            </p>
          ) : (
            tabContent[tab]
          )}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto grid max-w-md grid-cols-4">
            {NAV.map((item) => {
              const active = tab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setSelectedUserId(null);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className={cn("size-5", active && "stroke-[2.5]")} />
                  <span
                    className={cn(
                      "text-[10px]",
                      active ? "font-bold" : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* DESKTOP */}
      <div className="mx-auto hidden max-w-7xl lg:flex lg:gap-6 lg:px-6 lg:py-6">
        <aside className="w-60 shrink-0">
          <div className="sticky top-20 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Admin console
              </p>
              <p className="text-sm font-bold text-foreground">MOTUS Capital</p>
            </div>

            <nav className="space-y-1 rounded-2xl border border-border bg-card p-2">
              {NAV.map((item) => {
                const active = tab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTab(item.id);
                      setSelectedUserId(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                    {active && (
                      <span className="ml-auto size-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Section
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {currentLabel}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />{" "}
              Loading…
            </div>
          ) : error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error instanceof Error ? error.message : "Could not load."}
            </p>
          ) : (
            <div className="max-w-4xl">{tabContent[tab]}</div>
          )}
        </main>
      </div>
    </div>
  );
}