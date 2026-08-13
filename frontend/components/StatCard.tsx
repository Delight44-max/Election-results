export default function StatCard({
  label,
  value,
  sublabel,
  accent = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div className={`card p-5 ${accent ? "border-forest/30 bg-forest/[0.03]" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 stat-figure text-2xl sm:text-3xl font-semibold text-ink">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
    </div>
  );
}
