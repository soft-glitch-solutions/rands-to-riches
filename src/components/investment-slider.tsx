import { useCallback } from "react";
import {
  INVESTMENT_STEP,
  MAX_INVESTMENT,
  MIN_INVESTMENT,
  QUICK_AMOUNTS,
  formatRand,
} from "@/lib/investment";
import { cn } from "@/lib/utils";

interface InvestmentSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function InvestmentSlider({
  value,
  onChange,
  className,
}: InvestmentSliderProps) {
  const fillPercent =
    ((value - MIN_INVESTMENT) / (MAX_INVESTMENT - MIN_INVESTMENT)) * 100;

  const handleSlider = useCallback(
    (raw: number) => {
      const snapped = Math.round(raw / INVESTMENT_STEP) * INVESTMENT_STEP;
      onChange(Math.min(MAX_INVESTMENT, Math.max(MIN_INVESTMENT, snapped)));
    },
    [onChange],
  );

  return (
    <div className={cn("w-full", className)}>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Your investment
      </p>
      <p className="mt-1 font-display text-5xl font-bold tracking-tight text-primary sm:text-6xl">
        {formatRand(value)}
      </p>

      <input
        type="range"
        min={MIN_INVESTMENT}
        max={MAX_INVESTMENT}
        step={INVESTMENT_STEP}
        value={value}
        aria-label="Investment amount in rand"
        onChange={(e) => handleSlider(Number(e.target.value))}
        className="motus-slider mt-6"
        style={{ "--motus-fill": `${fillPercent}%` } as React.CSSProperties}
      />

      <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{formatRand(MIN_INVESTMENT)}</span>
        <span>{formatRand(MAX_INVESTMENT)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onChange(amount)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              value === amount
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-secondary-foreground hover:border-primary hover:text-primary",
            )}
          >
            {formatRand(amount)}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Invest any amount from {formatRand(MIN_INVESTMENT)} to{" "}
        {formatRand(MAX_INVESTMENT)}.
      </p>
    </div>
  );
}
