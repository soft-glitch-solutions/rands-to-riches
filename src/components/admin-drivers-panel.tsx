import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  UserCheck,
  UserX,
  Plus,
  Loader2,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminDrivers,
  createDriver,
  updateDriverStatus,
  getAdminDriverEarnings,
  createPeriodEarnings,
  type AdminDriver,
  type AdminDriverEarnings,
} from "@/server-fn/admin";
import { formatDate, formatRand, formatRandFromCents } from "@/lib/investment";
import { cn } from "@/lib/utils";

export function DriversFleetPanel() {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<"drivers" | "earnings">("drivers");

  // Driver modal state
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleAssigned, setVehicleAssigned] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [driverError, setDriverError] = useState<string | null>(null);

  // Period Earnings state
  const [showAddEarnings, setShowAddEarnings] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [periodStart, setPeriodStart] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [grossRands, setGrossRands] = useState("");
  const [fuelRands, setFuelRands] = useState("");
  const [maintenanceRands, setMaintenanceRands] = useState("");
  const [driverPayoutRands, setDriverPayoutRands] = useState("");
  const [earningsNotes, setEarningsNotes] = useState("");
  const [earningsError, setEarningsError] = useState<string | null>(null);

  // Queries
  const { data: drivers = [], isLoading: loadingDrivers } = useQuery({
    queryKey: ["admin-drivers"],
    queryFn: () => getAdminDrivers(),
  });

  const { data: earnings = [], isLoading: loadingEarnings } = useQuery({
    queryKey: ["admin-driver-earnings"],
    queryFn: () => getAdminDriverEarnings(),
  });

  // Mutations
  const addDriverMutation = useMutation({
    mutationFn: (args: {
      fullName: string;
      phone: string;
      licenseNumber: string;
      vehicleAssigned?: string;
      vehicleReg?: string;
    }) => createDriver({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
      setShowAddDriver(false);
      setFullName("");
      setPhone("");
      setLicenseNumber("");
      setVehicleAssigned("");
      setVehicleReg("");
      setDriverError(null);
    },
    onError: (err: any) => {
      setDriverError(err?.message || "Failed to create driver");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (args: { id: string; status: "active" | "inactive" }) =>
      updateDriverStatus({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-drivers"] });
    },
  });

  const addEarningsMutation = useMutation({
    mutationFn: (args: {
      driverId: string;
      periodStart: string;
      periodEnd: string;
      grossRevenueCents: number;
      fuelAndTollCents: number;
      maintenanceCents: number;
      driverPayoutCents: number;
      notes?: string;
    }) => createPeriodEarnings({ data: args }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-driver-earnings"] });
      setShowAddEarnings(false);
      setGrossRands("");
      setFuelRands("");
      setMaintenanceRands("");
      setDriverPayoutRands("");
      setEarningsNotes("");
      setEarningsError(null);
    },
    onError: (err: any) => {
      setEarningsError(err?.message || "Failed to log earnings");
    },
  });

  // Calculations for live preview
  const grossNum = parseFloat(grossRands) || 0;
  const fuelNum = parseFloat(fuelRands) || 0;
  const maintNum = parseFloat(maintenanceRands) || 0;
  const driverPayNum = parseFloat(driverPayoutRands) || 0;
  const netNum = grossNum - fuelNum - maintNum - driverPayNum;

  // Total fleet numbers
  const totalFleetNetCents = earnings.reduce(
    (sum, e) => sum + e.netFleetEarningsCents,
    0,
  );
  const activeDriversCount = drivers.filter((d) => d.status === "active").length;

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !licenseNumber.trim()) {
      setDriverError("Please fill in full name, phone and license number.");
      return;
    }
    addDriverMutation.mutate({
      fullName,
      phone,
      licenseNumber,
      vehicleAssigned,
      vehicleReg,
    });
  };

  const handleEarningsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) {
      setEarningsError("Please select a driver.");
      return;
    }
    if (grossNum <= 0) {
      setEarningsError("Gross revenue must be greater than zero.");
      return;
    }
    addEarningsMutation.mutate({
      driverId: selectedDriverId,
      periodStart,
      periodEnd,
      grossRevenueCents: Math.round(grossNum * 100),
      fuelAndTollCents: Math.round(fuelNum * 100),
      maintenanceCents: Math.round(maintNum * 100),
      driverPayoutCents: Math.round(driverPayNum * 100),
      notes: earningsNotes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Active Fleet Drivers
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">
            {activeDriversCount} / {drivers.length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Vetted commercial drivers</p>
        </div>

        <div className="rounded-2xl border border-brand-green/30 bg-accent/30 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            Net Fleet Earnings Logged
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-green">
            {formatRandFromCents(totalFleetNetCents)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">After fuel, maintenance & driver pay</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Logged Periods
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {earnings.length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Weekly / bi-weekly records</p>
        </div>
      </div>

      {/* Sub-nav switcher */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSubTab("drivers")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
              subTab === "drivers"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            Drivers & Vehicles ({drivers.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("earnings")}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
              subTab === "earnings"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            Period Earnings Logs ({earnings.length})
          </button>
        </div>

        <div>
          {subTab === "drivers" ? (
            <Button
              size="sm"
              onClick={() => setShowAddDriver(!showAddDriver)}
              className="rounded-xl text-xs font-bold gap-1 cursor-pointer"
            >
              <Plus className="size-3.5" /> Register Driver
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowAddEarnings(!showAddEarnings)}
              className="rounded-xl bg-brand-green hover:bg-brand-green/90 text-white text-xs font-bold gap-1 cursor-pointer"
            >
              <Plus className="size-3.5" /> Log Period Earnings
            </Button>
          )}
        </div>
      </div>

      {/* ================= DRIVERS TAB ================= */}
      {subTab === "drivers" && (
        <div className="space-y-4">
          {/* Add Driver Card */}
          {showAddDriver && (
            <form
              onSubmit={handleDriverSubmit}
              className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4 animate-in fade-in-50"
            >
              <h3 className="font-display text-base font-bold text-foreground">
                Register New Commercial Driver
              </h3>
              {driverError && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{driverError}</span>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="driverName" className="text-xs font-bold">Full Name</Label>
                  <Input
                    id="driverName"
                    required
                    placeholder="e.g. Sipho Ndlovu"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="driverPhone" className="text-xs font-bold">Phone Number</Label>
                  <Input
                    id="driverPhone"
                    required
                    placeholder="e.g. 082 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="driverLicense" className="text-xs font-bold">Driver License No.</Label>
                  <Input
                    id="driverLicense"
                    required
                    placeholder="e.g. GP-98234-DL"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vehicleModel" className="text-xs font-bold">Vehicle Model</Label>
                  <Input
                    id="vehicleModel"
                    placeholder="e.g. Toyota Vitz 1.0 XR"
                    value={vehicleAssigned}
                    onChange={(e) => setVehicleAssigned(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="vehicleReg" className="text-xs font-bold">Vehicle Registration</Label>
                  <Input
                    id="vehicleReg"
                    placeholder="e.g. CA 492-381 / GP 892-019"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={addDriverMutation.isPending}
                  className="rounded-xl font-bold text-xs"
                >
                  {addDriverMutation.isPending ? "Saving..." : "Save Driver"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDriver(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Drivers List */}
          {loadingDrivers ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              <Loader2 className="inline mr-2 size-4 animate-spin text-primary" /> Loading drivers...
            </div>
          ) : drivers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Car className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 font-display font-bold text-foreground">No drivers registered yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Register Driver" above to add your first commercial vehicle operator.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {drivers.map((d) => (
                <div
                  key={d.id}
                  className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-bold text-foreground">{d.fullName}</h4>
                      <p className="text-xs text-muted-foreground">{d.phone} · License {d.licenseNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: d.id,
                          status: d.status === "active" ? "inactive" : "active",
                        })
                      }
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors",
                        d.status === "active"
                          ? "bg-accent text-accent-foreground hover:bg-accent/70"
                          : "bg-secondary text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {d.status}
                    </button>
                  </div>

                  <div className="rounded-xl bg-secondary/50 p-2.5 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Vehicle</span>
                      <p className="font-semibold text-foreground">{d.vehicleAssigned || "Unassigned"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Registration</span>
                      <p className="font-mono font-semibold text-foreground">{d.vehicleReg || "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= EARNINGS TAB ================= */}
      {subTab === "earnings" && (
        <div className="space-y-4">
          {/* Add Earnings Drawer */}
          {showAddEarnings && (
            <form
              onSubmit={handleEarningsSubmit}
              className="rounded-2xl border border-brand-green/30 bg-accent/20 p-5 space-y-4 animate-in fade-in-50"
            >
              <h3 className="font-display text-base font-bold text-foreground">
                Record Weekly / Period Fleet Earnings
              </h3>
              {earningsError && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{earningsError}</span>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <Label htmlFor="driverSelect" className="text-xs font-bold">Assign to Driver & Vehicle</Label>
                  <select
                    id="driverSelect"
                    required
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">Select a driver...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.vehicleAssigned || "Vehicle"} - {d.vehicleReg || "No Reg"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="pStart" className="text-xs font-bold">Period Start</Label>
                  <Input
                    id="pStart"
                    type="date"
                    required
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="pEnd" className="text-xs font-bold">Period End</Label>
                  <Input
                    id="pEnd"
                    type="date"
                    required
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="gross" className="text-xs font-bold">Gross Fare Revenue (R)</Label>
                  <Input
                    id="gross"
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 8500"
                    value={grossRands}
                    onChange={(e) => setGrossRands(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fuel" className="text-xs font-bold">Fuel & Toll Expenses (R)</Label>
                  <Input
                    id="fuel"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2100"
                    value={fuelRands}
                    onChange={(e) => setFuelRands(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maint" className="text-xs font-bold">Maintenance / Tyres (R)</Label>
                  <Input
                    id="maint"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 650"
                    value={maintenanceRands}
                    onChange={(e) => setMaintenanceRands(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="payout" className="text-xs font-bold">Driver Payout / Pay (R)</Label>
                  <Input
                    id="payout"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2500"
                    value={driverPayoutRands}
                    onChange={(e) => setDriverPayoutRands(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor="notes" className="text-xs font-bold">Notes / Comments (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="e.g. High trip volume during weekend rain, oil change completed."
                    value={earningsNotes}
                    onChange={(e) => setEarningsNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Net preview calculation */}
              <div className="rounded-xl border border-brand-green/30 bg-card p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-muted-foreground">Calculated Net Fleet Earnings:</span>
                  <p className="text-[11px] text-muted-foreground">Gross - (Fuel + Maint + Driver Payout)</p>
                </div>
                <div className="font-display text-xl font-extrabold text-brand-green">
                  {formatRand(netNum)}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={addEarningsMutation.isPending}
                  className="rounded-xl bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs"
                >
                  {addEarningsMutation.isPending ? "Logging..." : "Confirm & Log Record"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddEarnings(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Earnings List */}
          {loadingEarnings ? (
            <div className="py-10 text-center text-xs text-muted-foreground">
              <Loader2 className="inline mr-2 size-4 animate-spin text-primary" /> Loading earnings logs...
            </div>
          ) : earnings.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <FileSpreadsheet className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 font-display font-bold text-foreground">No earnings recorded yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Log Period Earnings" above to record road fares and net fleet margins.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.map((e) => (
                <div
                  key={e.id}
                  className="rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-border/50">
                    <div>
                      <h4 className="font-display font-bold text-foreground">
                        {e.driverName} {e.vehicleReg && <span className="font-mono text-xs text-muted-foreground">({e.vehicleReg})</span>}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Period: {e.periodStart} to {e.periodEnd}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Net Fleet Profit</span>
                      <p className="font-display text-lg font-extrabold text-brand-green">
                        {formatRandFromCents(e.netFleetEarningsCents)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Gross Fare</span>
                      <p className="font-semibold text-foreground">{formatRandFromCents(e.grossRevenueCents)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Fuel & Toll</span>
                      <p className="font-semibold text-foreground">-{formatRandFromCents(e.fuelAndTollCents)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Maintenance</span>
                      <p className="font-semibold text-foreground">-{formatRandFromCents(e.maintenanceCents)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Driver Payout</span>
                      <p className="font-semibold text-foreground">-{formatRandFromCents(e.driverPayoutCents)}</p>
                    </div>
                  </div>

                  {e.notes && (
                    <p className="mt-2 text-xs italic text-muted-foreground">
                      Notes: {e.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
