/**
 * Reusable skeleton placeholder for loading states.
 *
 * Usage:
 *   <Skeleton className="h-4 w-32" />           — single bar
 *   <Skeleton className="h-40 w-full" round />   — rounded image placeholder
 *   <SkeletonCard />                              — full card skeleton
 */

export const Skeleton = ({ className = "", round = false }) => (
  <div
    className={`skeleton ${round ? "rounded-full" : ""} ${className}`}
    aria-hidden="true"
  />
);

export const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
    <Skeleton className="h-10 w-10" round />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <Skeleton className="h-8 w-16" />
  </div>
);
