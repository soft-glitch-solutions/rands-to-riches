import { useCallback, useState, useEffect } from "react";
import {
  InvestmentPlan,
  PLAN_CONFIGS,
  calculateEarnings,
  formatRand,
} from "@/lib/investment";
import { cn } from "@/lib/utils";

interface InvestmentSliderProps {
  value: number;
  onChange: (value: number) => void;
  plan?: InvestmentPlan;
  onPlanChange?: (plan: InvestmentPlan) => void;
  className?: string;
}

export function InvestmentSlider({
  value,
  onChange,
  plan: externalPlan,
  onPlanChange,
  className,
}: InvestmentSliderProps) {
  const initialPlan: InvestmentPlan = value > 1000 ? "3months" : "1month";
  const [internalPlan, setInternalPlan] = useState<InvestmentPlan>(
    externalPlan ?? initialPlan,
  );

  const activePlan = externalPlan ?? internalPlan;

  const setPlan = (newPlan: InvestmentPlan) => {
    setInternalPlan(newPlan);
    onPlanChange?.(newPlan);

    const targetConfig = PLAN_CONFIGS[newPlan];
    if (value < targetConfig.minAmount) {
      onChange(newPlan === "1month" ? 500 : targetConfig.minAmount);
    } else if (value > targetConfig.maxAmount) {
      onChange(targetConfig.maxAmount);
    }
  };

  const config = PLAN_CONFIGS[activePlan];

  useEffect(() => {
    if (externalPlan === undefined) {
      if (value > 1000 && internalPlan === "1month") {
        setInternalPlan("3months");
      } else if (value <= 1000 && internalPlan !== "1month") {
        setInternalPlan("1month");
      }
    }
  }, [value, externalPlan, internalPlan]);

  const fillPercent = Math.min(
    100,
    Math.max(
      0,
      ((value - config.minAmount) / (config.maxAmount - config.minAmount)) * 100,
    ),
  );

  const handleSlider = useCallback(
    (raw: number) => {
      const snapped = Math.round(raw / config.step) * config.step;
      const clamped = Math.min(config.maxAmount, Math.max(config.minAmount, snapped));
      onChange(clamped);
    },
    [onChange, config],
  );

  const { minProfit, maxProfit, minPayout, maxPayout, minPct, maxPct, termDays } =
    calculateEarnings(value, activePlan);

  const isGrowthPlan = activePlan === "2months" || activePlan === "3months";

  return (
    <div className={cn("w-full space-y-3.5 sm:space-y-4", className)}>
      {/* ===== Plan mode switcher ===== */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary/80 p-1">
        <button
          type="button"
          onClick={() => setPlan("1month")}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center transition-all sm:flex-row sm:gap-2",
            !isGrowthPlan
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-xs font-bold sm:text-sm">1 Month</span>
          <span className="text-[10px] font-semibold text-brand-green sm:text-[11px]">
            13%–20%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPlan(activePlan === "2months" ? "2months" : "3months")}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center transition-all sm:flex-row sm:gap-2",
            isGrowthPlan
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-xs font-bold sm:text-sm">2–3 Months</span>
          <span className="text-[10px] font-semibold text-brand-green sm:text-[11px]">
            20%–25%
          </span>
        </button>
      </div>

      {/* ===== Term sub-toggle ===== */}
      {isGrowthPlan && (
        <div className="rounded-xl border border-border bg-card/60 p-2">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Select term
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setPlan("2months")}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all",
                  activePlan === "2months"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                60d · 20–22%
              </button>
              <button
                type="button"
                onClick={() => setPlan("3months")}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all",
                  activePlan === "3months"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                90d · 22–25%
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Amount + payout summary ===== */}
      <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:text-[11px]">
            You invest
          </span>
          <p className="font-display text-3xl font-extrabold leading-none tracking-tight text-primary sm:text-4xl md:text-5xl">
            {formatRand(value)}
          </p>
        </div>

        <div className="rounded-xl border border-brand-green/30 bg-accent/40 px-3 py-2 sm:rounded-2xl sm:px-3.5 sm:py-2.5 sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-foreground sm:text-[11px]">
            {termDays}-day payout · {(minPct * 100).toFixed(0)}–{(maxPct * 100).toFixed(0)}%
          </span>
          <p className="font-display text-lg font-bold leading-tight text-brand-green sm:text-xl md:text-2xl">
            {formatRand(minPayout)} – {formatRand(maxPayout)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">
            Profit:{" "}
            <span className="text-foreground">
              +{formatRand(minProfit)} – +{formatRand(maxProfit)}
            </span>
          </p>
        </div>
      </div>

      {/* ===== Slider track ===== */}
      <div className="relative py-3">
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary sm:h-3">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-75"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        <div
          className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-primary bg-card shadow-md transition-[left] duration-75 sm:size-7 sm:border-4"
          style={{ left: `${fillPercent}%` }}
        />

        <input
          type="range"
          min={config.minAmount}
          max={config.maxAmount}
          step={config.step}
          value={value}
          aria-label="Investment amount in rand"
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 touch-none"
        />
      </div>

      {/* ===== Min / max ===== */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground sm:text-xs">
        <span>Min {formatRand(config.minAmount)}</span>
        <span>Max {formatRand(config.maxAmount)}</span>
      </div>

      {/* ===== Quick amounts ===== */}
      <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {config.quickAmounts.map((amt) => {
          const isSelected = value === amt;
          return (
            <button
              key={amt}
              type="button"
              onClick={() => onChange(amt)}
              className={cn(
                "rounded-lg border py-2 text-center text-xs font-bold transition-all sm:rounded-full sm:px-4 sm:py-1.5 sm:text-sm",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary",
              )}
            >
              {formatRand(amt)}
            </button>
          );
        })}
      </div>

      {/* ===== Tier boundary hint ===== */}
      {!isGrowthPlan && value >= 1000 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-center text-[11px] text-muted-foreground sm:text-xs">
          Want more than R1,000?{" "}
          <button
            type="button"
            onClick={() => setPlan("3months")}
            className="font-bold text-primary underline hover:text-primary/80"
          >
            Switch to 2–3 Month Plan →
          </button>
        </div>
      )}
    </div>
  );
}