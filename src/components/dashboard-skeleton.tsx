import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-secondary",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.6s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent",
        className,
      )}
    />
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card px-3 py-2.5 sm:px-3.5 sm:py-3">
          <Shimmer className="h-2 w-12" />
          <Shimmer className="mt-2 h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function InvestCardSkeleton() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-16" />
      </div>
      <Shimmer className="h-9 w-full" />
      <Shimmer className="mt-3 h-8 w-full" />
      <div className="mt-4 flex items-end justify-between">
        <div className="space-y-1.5">
          <Shimmer className="h-2 w-16" />
          <Shimmer className="h-9 w-32" />
        </div>
        <Shimmer className="h-16 w-40" />
      </div>
      <Shimmer className="mt-4 h-2.5 w-full rounded-full" />
      <div className="mt-2 flex justify-between">
        <Shimmer className="h-2 w-10" />
        <Shimmer className="h-2 w-10" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="h-8 w-full sm:w-20" />
        ))}
      </div>
      <Shimmer className="mt-4 h-10 w-full rounded-xl" />
    </section>
  );
}

export function CycleRowSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <Shimmer className="h-5 w-24" />
          <Shimmer className="h-2.5 w-40" />
        </div>
        <Shimmer className="h-6 w-16" />
      </div>
    </div>
  );
}

export function CyclesListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <Shimmer className="h-4 w-28" />
        <Shimmer className="h-2.5 w-12" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <CycleRowSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Shimmer className="h-5 w-56" />
          <Shimmer className="h-3 w-72 max-w-full" />
        </div>
        <Shimmer className="h-8 w-48 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <Shimmer className="h-2.5 w-20" />
            <Shimmer className="mt-2 h-7 w-24" />
            <Shimmer className="mt-1.5 h-2.5 w-28" />
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <Shimmer className="h-5 w-64" />
        <Shimmer className="mt-1.5 h-3 w-80 max-w-full" />
        <Shimmer className="mt-6 h-[260px] w-full rounded-2xl" />
        <div className="mt-8 border-t border-border/70 pt-6">
          <Shimmer className="h-2.5 w-48" />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/80 bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <Shimmer className="h-5 w-16 rounded-full" />
                  <Shimmer className="h-2.5 w-20" />
                </div>
                <Shimmer className="mt-2.5 h-4 w-40" />
                <Shimmer className="mt-2 h-2.5 w-full" />
                <Shimmer className="mt-1 h-2.5 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Shimmer className="size-4 rounded" />
        <Shimmer className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-secondary/80 p-1">
        <Shimmer className="h-7 w-full rounded-lg" />
        <Shimmer className="h-7 w-full rounded-lg" />
      </div>
      <div className="mt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Shimmer className="h-2.5 w-20" />
            <Shimmer className="mt-1 h-9 w-full" />
          </div>
        ))}
        <Shimmer className="h-9 w-full rounded-lg" />
      </div>
    </section>
  );
}

export function GreetingSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Shimmer className="size-10 rounded-full sm:size-12" />
      <div className="space-y-1.5">
        <Shimmer className="h-5 w-32" />
        <Shimmer className="h-3 w-44" />
      </div>
    </div>
  );
}