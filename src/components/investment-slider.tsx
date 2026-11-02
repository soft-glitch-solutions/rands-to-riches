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
  // Infer initial plan based on current value
  const initialPlan: InvestmentPlan = value > 1000 ? "3months" : "1month";
  const [internalPlan, setInternalPlan] = useState<InvestmentPlan>(
    externalPlan ?? initialPlan,
  );

  const activePlan = externalPlan ?? internalPlan;

  const setPlan = (newPlan: InvestmentPlan) => {
    setInternalPlan(newPlan);
    onPlanChange?.(newPlan);

    // Adjust value if it falls outside the new plan's range
    const targetConfig = PLAN_CONFIGS[newPlan];
    if (value < targetConfig.minAmount) {
      onChange(newPlan === "1month" ? 500 : targetConfig.minAmount);
    } else if (value > targetConfig.maxAmount) {
      onChange(targetConfig.maxAmount);
    }
  };

  const config = PLAN_CONFIGS[activePlan];

  // Keep internal plan in sync if external value changes drastically
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
    <div className={cn("w-full space-y-4", className)}>
      {/* Plan Mode Switcher (1 Month vs 2-3 Months) */}
      <div className="grid grid-cols-2 rounded-2xl bg-secondary/80 p-1">
        <button
          type="button"
          onClick={() => setPlan("1month")}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl py-2 px-2 text-center transition-all sm:flex-row sm:gap-1.5",
            !isGrowthPlan
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-xs sm:text-sm font-bold">1 Month Cycle</span>
          <span className="text-[11px] font-semibold text-brand-green">13%–20%</span>
        </button>

        <button
          type="button"
          onClick={() => setPlan(activePlan === "2months" ? "2months" : "3months")}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl py-2 px-2 text-center transition-all sm:flex-row sm:gap-1.5",
            isGrowthPlan
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/50"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="text-xs sm:text-sm font-bold">2–3 Month Plan</span>
          <span className="text-[11px] font-semibold text-brand-green">20%–25%</span>
        </button>
      </div>

      {/* Growth Plan sub-toggle: 2 Months vs 3 Months */}
      {isGrowthPlan && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2 text-xs">
          <span className="font-semibold text-muted-foreground">Select term:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPlan("2months")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                activePlan === "2months"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              2 Months (60d) · 20%–22%
            </button>
            <button
              type="button"
              onClick={() => setPlan("3months")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-bold transition-all",
                activePlan === "3months"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              3 Months (90d) · 22%–25%
            </button>
          </div>
        </div>
      )}

      {/* Investment Amount & Return Summary */}
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            You invest
          </span>
          <p className="font-display text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            {formatRand(value)}
          </p>
        </div>

        <div className="rounded-2xl border border-brand-green/30 bg-accent/40 px-3.5 py-2.5 sm:text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            Est. {termDays}-day payout ({(minPct * 100).toFixed(0)}%–{(maxPct * 100).toFixed(0)}%)
          </span>
          <p className="font-display text-2xl font-bold text-brand-green sm:text-3xl">
            {formatRand(minPayout)} – {formatRand(maxPayout)}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
            Estimated profit:{" "}
            <span className="text-foreground">
              +{formatRand(minProfit)} – +{formatRand(maxProfit)}
            </span>
          </p>
        </div>
      </div>

      {/* Interactive Slider Track */}
      <div className="relative py-2">
        {/* Track bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-75"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Custom styled thumb */}
        <div
          className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary bg-card shadow-md transition-[left] duration-75"
          style={{ left: `${fillPercent}%` }}
        />

        {/* Full hit-area native range input */}
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

      {/* Min / Max Labels */}
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Min {formatRand(config.minAmount)}</span>
        <span>Max {formatRand(config.maxAmount)}</span>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {config.quickAmounts.map((amt) => {
          const isSelected = value === amt;
          return (
            <button
              key={amt}
              type="button"
              onClick={() => onChange(amt)}
              className={cn(
                "rounded-xl border py-2 text-center text-xs font-bold transition-all sm:rounded-full sm:px-4 sm:py-1.5 sm:text-sm",
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

      {/* Helpful switcher pill if user hits the tier boundary */}
      {!isGrowthPlan && value >= 1000 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-center text-xs text-muted-foreground">
          Looking to invest more than R1,000?{" "}
          <button
            type="button"
            onClick={() => setPlan("3months")}
            className="font-bold text-primary underline hover:text-primary/80"
          >
            Switch to 2–3 Month Plan for 20%–25% returns &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
