import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Car,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { formatRand } from "@/lib/investment";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Growth Projection Data: 6-Month Compounding Cycles
// ---------------------------------------------------------------------------
const GROWTH_DATA = [
  { month: "Cycle 1 (M1)", capital: 5000, profit: 850, total: 5850, rate: "17%" },
  { month: "Cycle 2 (M2)", capital: 5850, profit: 1050, total: 6900, rate: "18%" },
  { month: "Cycle 3 (M3)", capital: 6900, profit: 1380, total: 8280, rate: "20%" },
  { month: "Cycle 4 (M4)", capital: 8280, profit: 1820, total: 10100, rate: "22%" },
  { month: "Cycle 5 (M5)", capital: 10100, profit: 2420, total: 12520, rate: "24%" },
  { month: "Cycle 6 (M6)", capital: 12520, profit: 3130, total: 15650, rate: "25%" },
];

// ---------------------------------------------------------------------------
// Weekly Fleet Revenue Generation (Where the % gains come from)
// ---------------------------------------------------------------------------
const FLEET_REVENUE_DATA = [
  {
    week: "Week 1",
    eHailing: 34500,
    deliveries: 18200,
    corporate: 9800,
    expenses: -12500,
    netInvestorPool: 49900,
  },
  {
    week: "Week 2",
    eHailing: 38200,
    deliveries: 21400,
    corporate: 11200,
    expenses: -13100,
    netInvestorPool: 57700,
  },
  {
    week: "Week 3",
    eHailing: 41900,
    deliveries: 23800,
    corporate: 12500,
    expenses: -14200,
    netInvestorPool: 64000,
  },
  {
    week: "Week 4",
    eHailing: 46500,
    deliveries: 26100,
    corporate: 14800,
    expenses: -15600,
    netInvestorPool: 71800,
  },
];

// ---------------------------------------------------------------------------
// Return Source Composition
// ---------------------------------------------------------------------------
const REVENUE_STREAMS = [
  {
    name: "E-Hailing Passenger Trips",
    share: "54%",
    description: "Daily city commutes across Johannesburg, Pretoria & Cape Town (Uber/Bolt platform)",
    badge: "15%–20% return driver",
    color: "bg-primary",
  },
  {
    name: "On-Demand Delivery Logistics",
    share: "31%",
    description: "Commercial delivery motorcycles fulfilling high-frequency retail & food courier runs",
    badge: "13%–18% return driver",
    color: "bg-brand-green",
  },
  {
    name: "Corporate & Airport Shuttle Contracts",
    share: "15%",
    description: "Guaranteed monthly fixed contracts with corporate park operators & scheduled airport transfers",
    badge: "20%–25% growth anchor",
    color: "bg-amber-500",
  },
];

export function DashboardAnalytics({ className }: { className?: string }) {
  const [activeView, setActiveView] = useState<"growth" | "revenue">("growth");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Analytics Header with Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-brand-green" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              Business Performance & Returns
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Live telemetry of how vehicle capital produces your 13%–25% returns on the road.
          </p>
        </div>

        {/* View Switcher */}
        <div className="inline-flex rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => setActiveView("growth")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
              activeView === "growth"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Portfolio Compounding
          </button>
          <button
            type="button"
            onClick={() => setActiveView("revenue")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
              activeView === "revenue"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Fleet Revenue Streams
          </button>
        </div>
      </div>

      {/* 3 Live Metric Badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Fleet Utilization
          </span>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-foreground">
            94.2%
          </p>
          <p className="text-[11px] font-medium text-brand-green">
            ↑ 2.4% vs last cycle
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Avg Daily Trips
          </span>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-foreground">
            18.6 trips
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            Per active vehicle
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Current Yield
          </span>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-brand-green">
            18.4%
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            Weighted across fleet
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Reinvestment Rate
          </span>
          <p className="mt-1.5 font-display text-2xl font-extrabold text-primary">
            78.6%
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            Investors rolling over
          </p>
        </div>
      </div>

      {/* Graph Display Area */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        {activeView === "growth" ? (
          <div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  6-Cycle Capital Compounding Model
                </h3>
                <p className="text-xs text-muted-foreground">
                  Illustrating an initial R5,000 investment reinvested across 1–3 month cycles at 17%–25% returns.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-primary" />
                  <span>Base Capital</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-brand-green" />
                  <span>Accumulated Profit</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="mt-6 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={GROWTH_DATA}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="totalGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.70 0.17 152)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.70 0.17 152)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="capitalGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.58 0.19 254)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.58 0.19 254)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.925 0.02 252)" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.52 0.05 254)", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `R${val / 1000}k`}
                    tick={{ fill: "oklch(0.52 0.05 254)", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="rounded-2xl border border-border bg-card p-3 shadow-xl text-xs">
                          <p className="font-bold text-foreground">{d.month}</p>
                          <div className="mt-1 space-y-0.5">
                            <p className="text-muted-foreground">
                              Portfolio: <span className="font-bold text-foreground">{formatRand(d.total)}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Cycle Gain: <span className="font-bold text-brand-green">+{formatRand(d.profit)} ({d.rate})</span>
                            </p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="oklch(0.70 0.17 152)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#totalGrowth)"
                  />
                  <Area
                    type="monotone"
                    dataKey="capital"
                    stroke="oklch(0.58 0.19 254)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#capitalGrowth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Weekly Fleet Revenue Deployment
                </h3>
                <p className="text-xs text-muted-foreground">
                  Breakdown of commercial earnings per week generated by funded e-hailing vehicles and courier bikes.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-primary" />
                  <span>E-Hailing Trips</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-brand-green" />
                  <span>Deliveries</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-amber-500" />
                  <span>Contracts</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="mt-6 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={FLEET_REVENUE_DATA}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.925 0.02 252)" />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "oklch(0.52 0.05 254)", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `R${val / 1000}k`}
                    tick={{ fill: "oklch(0.52 0.05 254)", fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="rounded-2xl border border-border bg-card p-3 shadow-xl text-xs space-y-1">
                          <p className="font-bold text-foreground">{d.week}</p>
                          <p className="text-primary font-semibold">E-Hailing: {formatRand(d.eHailing)}</p>
                          <p className="text-brand-green font-semibold">Deliveries: {formatRand(d.deliveries)}</p>
                          <p className="text-amber-600 font-semibold">Corporate: {formatRand(d.corporate)}</p>
                          <div className="border-t border-border pt-1">
                            <p className="font-bold text-foreground">Net Investor Pool: {formatRand(d.netInvestorPool)}</p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="eHailing" fill="oklch(0.58 0.19 254)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deliveries" fill="oklch(0.70 0.17 152)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="corporate" fill="oklch(0.75 0.15 80)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Where the Percentages Gain On (The 3 Streams) */}
        <div className="mt-8 border-t border-border/70 pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Where your 13% – 25% returns gain from
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {REVENUE_STREAMS.map((stream) => (
              <div
                key={stream.name}
                className="rounded-2xl border border-border/80 bg-secondary/30 p-4 transition-all hover:bg-secondary/60"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-extrabold text-foreground shadow-xs">
                    {stream.share} of pool
                  </span>
                  <span className="text-[11px] font-bold text-brand-green">
                    {stream.badge}
                  </span>
                </div>
                <h4 className="mt-2.5 font-display text-sm font-bold text-foreground">
                  {stream.name}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {stream.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
