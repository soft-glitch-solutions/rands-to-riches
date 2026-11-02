import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Car,
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Building,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { formatRand, formatDate } from "@/lib/investment";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin-demo")({
  head: () => ({
    meta: [
      { title: "Admin Portal Demo — MOTUS Capital" },
      {
        name: "description",
        content:
          "Demo view of MOTUS Capital admin portal for payment verification, payout processing, and vehicle fleet operations.",
      },
    ],
  }),
  component: AdminDemoPage,
});

interface PendingDeposit {
  id: string;
  investorName: string;
  email: string;
  amount: number;
  plan: "1 Month (30d)" | "2 Months (60d)" | "3 Months (90d)";
  reference: string;
  paymentMethod: "Instant EFT (Ozow)" | "Standard Bank EFT" | "Capitec Pay" | "FNB Pay";
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface PendingPayout {
  id: string;
  investorName: string;
  email: string;
  principal: number;
  profit: number;
  totalPayout: number;
  term: "30 days (15%)" | "60 days (22%)" | "90 days (25%)";
  bankName: string;
  accountMasked: string;
  maturedDate: string;
  status: "queued" | "paid";
  batchId?: string;
}

interface VehicleItem {
  id: string;
  regNumber: string;
  makeModel: string;
  type: "E-hailing Car" | "Delivery Motorcycle";
  operator: string;
  city: string;
  weeklyRevenue: number;
  fundedAmount: number;
  status: "Active on road" | "En route" | "Scheduled maintenance";
}

const INITIAL_DEPOSITS: PendingDeposit[] = [
  {
    id: "dep-101",
    investorName: "Sipho Khumalo",
    email: "sipho.k@gmail.com",
    amount: 1000,
    plan: "1 Month (30d)",
    reference: "MOTUS-7712",
    paymentMethod: "Instant EFT (Ozow)",
    date: "Today, 14:22",
    status: "pending",
  },
  {
    id: "dep-102",
    investorName: "Naledi Molefe",
    email: "naledi.m@outlook.com",
    amount: 5000,
    plan: "3 Months (90d)",
    reference: "MOTUS-9934",
    paymentMethod: "Capitec Pay",
    date: "Today, 13:05",
    status: "pending",
  },
  {
    id: "dep-103",
    investorName: "Johan van der Merwe",
    email: "johan.vdm@mweb.co.za",
    amount: 2500,
    plan: "2 Months (60d)",
    reference: "MOTUS-4421",
    paymentMethod: "FNB Pay",
    date: "Today, 11:40",
    status: "pending",
  },
  {
    id: "dep-104",
    investorName: "Zandile Dlamini",
    email: "zandile.d@icloud.com",
    amount: 500,
    plan: "1 Month (30d)",
    reference: "MOTUS-1189",
    paymentMethod: "Standard Bank EFT",
    date: "Yesterday, 16:30",
    status: "pending",
  },
];

const INITIAL_PAYOUTS: PendingPayout[] = [
  {
    id: "pay-201",
    investorName: "Bongani Sithole",
    email: "b.sithole@vodamail.co.za",
    principal: 5000,
    profit: 1250,
    totalPayout: 6250,
    term: "90 days (25%)",
    bankName: "Capitec Bank",
    accountMasked: "•••• 4821",
    maturedDate: "2026-11-01",
    status: "queued",
  },
  {
    id: "pay-202",
    investorName: "Anika Patel",
    email: "anika.p@gmail.com",
    principal: 1000,
    profit: 200,
    totalPayout: 1200,
    term: "30 days (15%)",
    bankName: "FNB / FirstRand",
    accountMasked: "•••• 8390",
    maturedDate: "2026-11-02",
    status: "queued",
  },
  {
    id: "pay-203",
    investorName: "David Naidoo",
    email: "david.naidoo@yahoo.com",
    principal: 2500,
    profit: 550,
    totalPayout: 3050,
    term: "60 days (22%)",
    bankName: "Standard Bank",
    accountMasked: "•••• 1920",
    maturedDate: "2026-11-02",
    status: "queued",
  },
];

const FLEET_DATA: VehicleItem[] = [
  {
    id: "veh-1",
    regNumber: "CA 489-321",
    makeModel: "Suzuki Swift 1.2 GL",
    type: "E-hailing Car",
    operator: "Mandla Ndlovu",
    city: "Cape Town Metro",
    weeklyRevenue: 4850,
    fundedAmount: 180000,
    status: "Active on road",
  },
  {
    id: "veh-2",
    regNumber: "GP 234-902",
    makeModel: "Toyota Vitz 1.0 XR",
    type: "E-hailing Car",
    operator: "Thulani Mthembu",
    city: "Johannesburg & Sandton",
    weeklyRevenue: 5200,
    fundedAmount: 175000,
    status: "Active on road",
  },
  {
    id: "veh-3",
    regNumber: "ND 883-201",
    makeModel: "Honda Ace 125 Commercial",
    type: "Delivery Motorcycle",
    operator: "Kwame Asante",
    city: "Durban Central",
    weeklyRevenue: 2400,
    fundedAmount: 28000,
    status: "Active on road",
  },
  {
    id: "veh-4",
    regNumber: "GP 912-441",
    makeModel: "Bajaj Qute Quadricycle",
    type: "E-hailing Car",
    operator: "Samuel Mabaso",
    city: "Pretoria & Centurion",
    weeklyRevenue: 3900,
    fundedAmount: 95000,
    status: "Active on road",
  },
];

function AdminDemoPage() {
  const [activeTab, setActiveTab] = useState<"deposits" | "payouts" | "fleet">("deposits");
  const [deposits, setDeposits] = useState<PendingDeposit[]>(INITIAL_DEPOSITS);
  const [payouts, setPayouts] = useState<PendingPayout[]>(INITIAL_PAYOUTS);
  const [notification, setNotification] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Action: Approve incoming deposit
  const approveDeposit = (id: string, name: string, amount: number) => {
    setProcessingId(id);
    setTimeout(() => {
      setDeposits((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "approved" } : d)),
      );
      setProcessingId(null);
      showToast(`Deposit of ${formatRand(amount)} from ${name} approved and funds allocated to fleet!`);
    }, 600);
  };

  // Action: Process outgoing payout
  const processPayout = (id: string, name: string, amount: number) => {
    setProcessingId(id);
    setTimeout(() => {
      const batchCode = `EFT-${Math.floor(100000 + Math.random() * 900000)}`;
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: "paid", batchId: batchCode } : p,
        ),
      );
      setProcessingId(null);
      showToast(`Payout of ${formatRand(amount)} successfully sent to ${name} (Batch: ${batchCode})!`);
    }, 700);
  };

  // Action: Add quick mock deposit
  const addMockDeposit = () => {
    const mockNames = ["Kabelo Sithole", "Precious Zulu", "Lucas Mokoena", "Fatima Ally"];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]!;
    const amounts = [1000, 2500, 5000, 7500];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)]!;
    const newDep: PendingDeposit = {
      id: `dep-${Date.now()}`,
      investorName: randomName,
      email: `${randomName.toLowerCase().replace(" ", ".")}@gmail.com`,
      amount: randomAmount,
      plan: randomAmount > 1000 ? "3 Months (90d)" : "1 Month (30d)",
      reference: `MOTUS-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: "Instant EFT (Ozow)",
      date: "Just now",
      status: "pending",
    };
    setDeposits((prev) => [newDep, ...prev]);
    showToast(`New deposit incoming from ${randomName} for ${formatRand(randomAmount)}!`);
  };

  const pendingDepositsCount = deposits.filter((d) => d.status === "pending").length;
  const pendingDepositsTotal = deposits
    .filter((d) => d.status === "pending")
    .reduce((s, d) => s + d.amount, 0);

  const queuedPayoutsCount = payouts.filter((p) => p.status === "queued").length;
  const queuedPayoutsTotal = payouts
    .filter((p) => p.status === "queued")
    .reduce((s, p) => s + p.totalPayout, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="bg-foreground text-background px-4 py-2.5 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
        <ShieldCheck className="size-4 text-brand-green" />
        <span>Admin Operations Portal Demo — Live Payment Processing & Fleet Management</span>
        <span className="hidden sm:inline text-muted-foreground">·</span>
        <Link to="/demo" className="text-primary hover:underline ml-1">
          Switch to Investor Demo &rarr;
        </Link>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addMockDeposit}
              className="rounded-xl text-xs font-bold"
            >
              <Plus className="mr-1 size-3.5" /> Sim. New Deposit
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/" className="text-xs">
                Exit to Website
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-foreground px-5 py-3.5 text-sm font-semibold text-background shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="size-5 text-brand-green shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Title area */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Fleet & Payment Operations
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Verify incoming investor capital, process maturity withdrawals, and oversee commercial vehicles.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="size-4 text-primary" />
            <span>Updated live: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Deposits</span>
              <ArrowDownLeft className="size-4 text-primary" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-primary">
              {formatRand(pendingDepositsTotal)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pendingDepositsCount} transactions awaiting verification
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Matured Payouts</span>
              <ArrowUpRight className="size-4 text-brand-green" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-brand-green">
              {formatRand(queuedPayoutsTotal)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {queuedPayoutsCount} withdrawals queued for payment
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Active Fleet</span>
              <Car className="size-4 text-foreground" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              38 Vehicles
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              24 cars & 14 delivery motorcycles on road
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-bold uppercase tracking-wider">Total Managed</span>
              <DollarSign className="size-4 text-foreground" />
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">
              R1,248,500
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pooled capital across 412 active investors
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("deposits")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
              activeTab === "deposits"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <ArrowDownLeft className="size-4" />
            Verify Deposits ({pendingDepositsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payouts")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
              activeTab === "payouts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <ArrowUpRight className="size-4" />
            Process Payouts ({queuedPayoutsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all",
              activeTab === "fleet"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Car className="size-4" />
            Commercial Fleet Deployed
          </button>
        </div>

        {/* TAB 1: PENDING DEPOSITS */}
        {activeTab === "deposits" && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Incoming Investor Capital
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Verify customer payments and mark funds as deployed to commercial fleet.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={addMockDeposit}
                className="rounded-xl text-xs font-bold"
              >
                <Plus className="mr-1 size-3.5" /> Add Test Deposit
              </Button>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3.5 font-semibold">Investor</th>
                    <th className="px-5 py-3.5 font-semibold">Amount & Plan</th>
                    <th className="px-5 py-3.5 font-semibold">Method & Ref</th>
                    <th className="px-5 py-3.5 font-semibold">Received</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {deposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground">{dep.investorName}</p>
                        <p className="text-xs text-muted-foreground">{dep.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-display text-base font-bold text-primary">
                          {formatRand(dep.amount)}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground">{dep.plan}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{dep.paymentMethod}</p>
                        <span className="font-mono text-xs text-muted-foreground">
                          {dep.reference}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        {dep.date}
                      </td>
                      <td className="px-5 py-4">
                        {dep.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                            <Clock className="size-3" /> Awaiting approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                            <CheckCircle2 className="size-3" /> Deployed to fleet
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {dep.status === "pending" ? (
                          <Button
                            size="sm"
                            disabled={processingId === dep.id}
                            onClick={() => approveDeposit(dep.id, dep.investorName, dep.amount)}
                            className="rounded-xl font-bold"
                          >
                            {processingId === dep.id ? (
                              <RefreshCw className="size-3.5 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="mr-1.5 size-3.5" /> Approve & Deploy
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-muted-foreground">
                            Verified ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MATURED PAYOUTS */}
        {activeTab === "payouts" && (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Maturity Withdrawal Payouts
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Process EFT bank payments for investors whose cycles have reached maturity with earned returns.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                    <th className="px-5 py-3.5 font-semibold">Investor</th>
                    <th className="px-5 py-3.5 font-semibold">Principal & Profit</th>
                    <th className="px-5 py-3.5 font-semibold">Total Payout</th>
                    <th className="px-5 py-3.5 font-semibold">Bank Account</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-foreground">{pay.investorName}</p>
                        <p className="text-xs text-muted-foreground">{pay.email}</p>
                        <span className="text-[11px] font-semibold text-primary">
                          Cycle: {pay.term}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-foreground">
                          Capital: {formatRand(pay.principal)}
                        </p>
                        <p className="text-xs font-bold text-brand-green">
                          Profit: +{formatRand(pay.profit)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-display text-lg font-bold text-brand-green">
                          {formatRand(pay.totalPayout)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Matured {pay.maturedDate}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building className="size-3.5 text-muted-foreground" />
                          <span className="font-medium text-foreground">{pay.bankName}</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {pay.accountMasked}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {pay.status === "queued" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                            <Clock className="size-3" /> Queued for EFT
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                              <CheckCircle2 className="size-3" /> Paid out ✓
                            </span>
                            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                              {pay.batchId}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {pay.status === "queued" ? (
                          <Button
                            size="sm"
                            disabled={processingId === pay.id}
                            onClick={() => processPayout(pay.id, pay.investorName, pay.totalPayout)}
                            className="rounded-xl font-bold bg-brand-green hover:bg-brand-green/90 text-white"
                          >
                            {processingId === pay.id ? (
                              <RefreshCw className="size-3.5 animate-spin" />
                            ) : (
                              <>
                                <ArrowUpRight className="mr-1.5 size-3.5" /> Send EFT Payout
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-brand-green">
                            Transferred
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FLEET ASSET TRACKING */}
        {activeTab === "fleet" && (
          <div className="mt-6 space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Live Commercial Fleet Operations
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Commercial vehicles purchased and operated via pooled investor capital.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {FLEET_DATA.map((v) => (
                <div key={v.id} className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                        {v.type}
                      </span>
                      <h3 className="mt-2 font-display text-lg font-bold text-foreground">
                        {v.makeModel}
                      </h3>
                      <p className="font-mono text-xs font-semibold text-muted-foreground">
                        {v.regNumber} · {v.city}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground">
                      <span className="size-1.5 rounded-full bg-brand-green animate-pulse" />
                      {v.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Driver / Operator</span>
                      <p className="mt-0.5 font-bold text-foreground">{v.operator}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg. Weekly Fares</span>
                      <p className="mt-0.5 font-bold text-brand-green">
                        {formatRand(v.weeklyRevenue)}/week
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
