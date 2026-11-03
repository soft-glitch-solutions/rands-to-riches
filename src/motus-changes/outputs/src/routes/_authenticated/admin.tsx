import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import {
  approveInvestment,
  getAdminOverview,
  rejectInvestment,
  setUserRole,
} from "@/server-fn/admin";
import { isUserAdmin } from "@/server-fn/investments";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { formatDate, formatRandFromCents } from "@/lib/investment";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    // Server-side role check: only admins may load this page.
    const admin = await isUserAdmin();
    if (!admin) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [{ title: "Admin — MOTUS Capital" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const queryClient = useQueryClient();
  const fetchOverview = useServerFn(getAdminOverview);
  const approve = useServerFn(approveInvestment);
  const reject = useServerFn(rejectInvestment);
  const changeRole = useServerFn(setUserRole);

  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const flash = (kind: "ok" | "error", text: string) => {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 4500);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchOverview,
  });

  const { data: me } = useQuery({
    queryKey: ["current-user-id"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  const onError = (err: unknown) =>
    flash("error", err instanceof Error ? err.message : "Something went wrong.");

  const approveMutation = useMutation({
    mutationFn: (id: string) => approve({ data: { id } }),
    onSuccess: async () => {
      await refresh();
      flash("ok", "Payment approved. The cycle is now active.");
    },
    onError,
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => reject({ data: { id } }),
    onSuccess: async () => {
      await refresh();
      flash("ok", "Payment rejected.");
    },
    onError,
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: "admin" | "user" }) => changeRole({ data: vars }),
    onSuccess: async () => {
      await refresh();
      flash("ok", "Role updated.");
    },
    onError,
  });

  const working = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <BrandMark />
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">
              <ShieldCheck className="mr-2 size-4" /> Back to dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Admin overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm investor payments and manage accounts.
        </p>

        {notice && (
          <p
            role="status"
            className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold ${
              notice.kind === "ok" ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"
            }`}
          >
            {notice.text}
          </p>
        )}

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="mt-8 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error.message}
          </p>
        ) : data ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-5">
              {[
                { label: "Investors", value: String(data.investorCount) },
                { label: "Pending payments", value: String(data.pendingCount) },
                { label: "Total invested", value: formatRandFromCents(data.totalInvestedCents) },
                { label: "In active cycles", value: formatRandFromCents(data.activeCents) },
                { label: "Completed cycles", value: formatRandFromCents(data.maturedCents) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Pending payments */}
            <h2 className="mt-10 font-display text-xl font-bold text-foreground">
              Pending payments ({data.pendingCount})
            </h2>
            <p className="text-xs text-muted-foreground">
              Match the reference to the deposit on your bank statement before approving. Approving starts the maturity clock.
            </p>
            <div className="mt-3 overflow-x-auto rounded-3xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Investor</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Term</th>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pending.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">
                        No payments waiting for approval.
                      </td>
                    </tr>
                  ) : (
                    data.pending.map((p) => (
                      <tr key={p.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground">{p.fullName ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{p.email ?? "—"}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold text-primary">{formatRandFromCents(p.amountCents)}</td>
                        <td className="px-5 py-4 text-muted-foreground">{p.termDays} days</td>
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-foreground">
                          {p.paymentReference ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={working}
                              onClick={() => approveMutation.mutate(p.id)}
                              className="rounded-xl font-bold"
                            >
                              <CheckCircle2 className="mr-1.5 size-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={working}
                              onClick={() => {
                                if (window.confirm(`Reject ${formatRandFromCents(p.amountCents)} from ${p.fullName ?? p.email ?? "this investor"}?`))
                                  rejectMutation.mutate(p.id);
                              }}
                              className="rounded-xl font-bold text-destructive"
                            >
                              <XCircle className="mr-1.5 size-3.5" /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Investors */}
            <h2 className="mt-10 font-display text-xl font-bold text-foreground">Investors & roles</h2>
            <div className="mt-3 overflow-x-auto rounded-3xl border border-border bg-card">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Investor</th>
                    <th className="px-5 py-3 font-semibold">Contact</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">Cycles</th>
                    <th className="px-5 py-3 text-right font-semibold">Total invested</th>
                    <th className="px-5 py-3 text-right font-semibold">Active</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {data.investors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-center text-muted-foreground">
                        No investors have signed up yet.
                      </td>
                    </tr>
                  ) : (
                    data.investors.map((inv) => {
                      const isSelf = inv.userId === me;
                      const currentRole = inv.roles.includes("admin") ? "admin" : "user";
                      return (
                        <tr key={inv.userId} className="border-b border-border/60 last:border-0">
                          <td className="px-5 py-4 font-semibold text-foreground">{inv.fullName ?? "—"}</td>
                          <td className="px-5 py-4 text-muted-foreground">
                            <div>{inv.email ?? "—"}</div>
                            {inv.phone && <div>{inv.phone}</div>}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {inv.joinedAt ? formatDate(inv.joinedAt) : "—"}
                          </td>
                          <td className="px-5 py-4 text-right">{inv.investmentCount}</td>
                          <td className="px-5 py-4 text-right font-semibold text-foreground">
                            {formatRandFromCents(inv.totalInvestedCents)}
                          </td>
                          <td className="px-5 py-4 text-right text-primary">{formatRandFromCents(inv.activeCents)}</td>
                          <td className="px-5 py-4">
                            <select
                              aria-label={`Role for ${inv.fullName ?? inv.email ?? inv.userId}`}
                              value={currentRole}
                              disabled={isSelf || roleMutation.isPending}
                              title={isSelf ? "You can't change your own role" : undefined}
                              onChange={(e) => {
                                const role = e.target.value === "admin" ? "admin" : "user";
                                if (window.confirm(`Make ${inv.fullName ?? inv.email ?? "this user"} a${role === "admin" ? "n admin" : " regular user"}?`))
                                  roleMutation.mutate({ userId: inv.userId, role });
                              }}
                              className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-semibold disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
