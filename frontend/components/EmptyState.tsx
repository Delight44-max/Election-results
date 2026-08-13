export default function EmptyState({
  title = "Nothing here yet",
  message = "There's no data to show for this view.",
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full border-2 border-dashed border-line flex items-center justify-center text-muted">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 19h16M4 15h10M4 11h16M4 7h10" />
        </svg>
      </div>
      <div>
        <p className="font-display font-semibold text-ink">{title}</p>
        <p className="text-sm text-muted mt-1 max-w-sm">{message}</p>
      </div>
      {action}
    </div>
  );
}
