import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  CreditCard,
  Building,
  Loader2,
  AlertCircle,
  FileText,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAdminPayoutRequests,
  updatePayoutRequestStatus,
  type AdminPayoutRequest,
} from "@/server-fn/admin";
import { formatDate, formatRandFromCents } from "@/lib/investment";
import { cn } from "@/lib/utils";

export function PayoutRequestsPanel() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "rejected">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch] = useState("");

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ["admin-payout-requests"],
    queryFn: () => getAdminPayoutRequests(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (args: {
      id: string;
      status: "completed" | "rejected";
      adminNotes?: string;
    }) => updatePayoutRequestStatus({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payout-requests"] });
      setRejectingId(null);
      setRejectReason("");
    },
  });

  const filtered = requests.filter((r) => {
    const matchesStatus = filter === "all" || r.status === filter;
    const matchesSearch =
      search.trim() === "" ||
      (r.fullName && r.fullName.toLowerCase().includes(search.toLowerCase())) ||
      r.bankName.toLowerCase().includes(search.toLowerCase()) ||
      r.accountNumber.includes(search) ||
      (r.phone && r.phone.includes(search));
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const pendingTotalCents = requests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amountCents, 0);

  const exportCsv = () => {
    const headers = [
      "ID",
      "Investor",
      "Phone",
      "Amount_ZAR",
      "Bank",
      "Account_Holder",
      "Account_Number",
      "Branch_Code",
      "Account_Type",
      "Status",
      "Requested_At",
      "Processed_At",
    ];
    const rows = filtered.map((r) => [
      r.id,
      r.fullName ?? "Anonymous",
      r.phone ?? "",
      (r.amountCents / 100).toFixed(2),
      r.bankName,
      r.accountHolder || (r.fullName ?? ""),
      r.accountNumber,
      r.branchCode,
      r.accountType,
      r.status,
      r.createdAt,
      r.processedAt ?? "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((x) => `"${x}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payout-requests-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Pending EFT Withdrawals
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-600">
            {pendingCount}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatRandFromCents(pendingTotalCents)} waiting for payment
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Requests
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {requests.length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Across all cycles</p>
        </div>

        <div className="rounded-2xl border border-brand-green/30 bg-accent/30 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            Completed Payouts
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-green">
            {requests.filter((r) => r.status === "completed").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Dispatched via EFT</p>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card p-1">
          {(["pending", "completed", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer",
                filter === s
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {s}
              {s === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-800">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search investor or bank..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
          >
            <Download className="size-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin text-primary" /> Loading payout requests...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
          Error loading requests: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Clock className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-display text-base font-bold text-foreground">
            No {filter !== "all" ? filter : ""} payout requests
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filter === "pending"
              ? "All matured withdrawal requests have been processed."
              : "No requests match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-extrabold text-foreground">
                      {formatRandFromCents(req.amountCents)}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        req.status === "completed"
                          ? "bg-accent text-accent-foreground"
                          : req.status === "pending"
                            ? "bg-amber-500/20 text-amber-700"
                            : "bg-destructive/15 text-destructive",
                      )}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-bold text-foreground">
                    {req.fullName ?? "Investor"} ·{" "}
                    <span className="font-normal text-muted-foreground">
                      {req.phone ?? "No phone"}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Requested on {formatDate(req.createdAt)}
                    {req.processedAt && ` · Paid out ${formatDate(req.processedAt)}`}
                  </p>
                </div>

                {/* Actions */}
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <Button
                      size="sm"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: req.id,
                          status: "completed",
                        })
                      }
                      className="rounded-xl bg-brand-green text-white hover:bg-brand-green/90 text-xs font-bold gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="size-3.5" /> Approve & Mark Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateStatusMutation.isPending}
                      onClick={() => setRejectingId(rejectingId === req.id ? null : req.id)}
                      className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-bold gap-1 cursor-pointer"
                    >
                      <XCircle className="size-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>

              {/* Bank Details Box */}
              <div className="mt-3.5 grid gap-2 rounded-xl bg-secondary/50 p-3 sm:grid-cols-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Bank</span>
                  <p className="font-bold text-foreground">{req.bankName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Account Holder</span>
                  <p className="font-bold text-foreground">{req.accountHolder || req.fullName || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Account Number</span>
                  <p className="font-mono font-bold text-foreground">{req.accountNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Branch / Type</span>
                  <p className="font-medium text-foreground">
                    {req.branchCode || "Default"} · <span className="capitalize">{req.accountType}</span>
                  </p>
                </div>
              </div>

              {/* Rejection Form Drawer */}
              {rejectingId === req.id && (
                <div className="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 space-y-2">
                  <p className="text-xs font-bold text-destructive">
                    Reason for rejecting withdrawal:
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Bank account holder name mismatch, incorrect account number..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: req.id,
                          status: "rejected",
                          adminNotes: rejectReason || "Rejected by administrator",
                        })
                      }
                      className="rounded-lg text-xs font-bold"
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRejectingId(null)}
                      className="rounded-lg text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {req.adminNotes && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  Note: {req.adminNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
