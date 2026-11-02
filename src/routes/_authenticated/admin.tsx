import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ShieldCheck } from "lucide-react";
import { getAdminOverview } from "@/server-fn/admin";
import { isUserAdmin } from "@/server-fn/investments";
import { BrandMark } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatRandFromCents,
} from "@/lib/investment";

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
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchOverview,
  });

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
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Admin overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every account and investment on the platform.
        </p>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <p className="mt-8 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {(error as Error).message}
          </p>
        ) : data ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              {[
                { label: "Investors", value: String(data.investorCount) },
                {
                  label: "Total invested",
                  value: formatRandFromCents(data.totalInvestedCents),
                },
                {
                  label: "In active cycles",
                  value: formatRandFromCents(data.activeCents),
                },
                {
                  label: "Completed cycles",
                  value: formatRandFromCents(data.maturedCents),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-border bg-card p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3 font-semibold">Investor</th>
                    <th className="px-5 py-3 font-semibold">Contact</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Cycles
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Total invested
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.investors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-6 text-center text-muted-foreground"
                      >
                        No investors have signed up yet.
                      </td>
                    </tr>
                  ) : (
                    data.investors.map((inv) => (
                      <tr
                        key={inv.userId}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="px-5 py-4 font-semibold text-foreground">
                          {inv.fullName ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <div>{inv.email ?? "—"}</div>
                          {inv.phone && <div>{inv.phone}</div>}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {inv.joinedAt ? formatDate(inv.joinedAt) : "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {inv.investmentCount}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-foreground">
                          {formatRandFromCents(inv.totalInvestedCents)}
                        </td>
                        <td className="px-5 py-4 text-right text-primary">
                          {formatRandFromCents(inv.activeCents)}
                        </td>
                      </tr>
                    ))
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
