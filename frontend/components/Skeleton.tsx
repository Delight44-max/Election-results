export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-7 w-28" />
      <div className="skeleton h-3 w-24" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-b-0">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-3 w-16" />
    </div>
  );
}

export function SkeletonTallySheet() {
  return (
    <div className="card p-6 space-y-4">
      <div className="skeleton h-5 w-40" />
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
