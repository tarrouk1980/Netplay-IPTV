export function ExpertCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-neutral-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-3/4 rounded bg-neutral-200" />
          <div className="h-3 w-1/2 rounded bg-neutral-200" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-neutral-200" />
        <div className="h-3 w-4/5 rounded bg-neutral-200" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="h-3 w-1/4 rounded bg-neutral-200" />
        <div className="h-3 w-1/4 rounded bg-neutral-200" />
      </div>
    </div>
  );
}
