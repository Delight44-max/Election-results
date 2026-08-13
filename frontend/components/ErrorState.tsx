export default function ErrorState({
  message = "Something went wrong loading this data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-3 border-brick/30">
      <div className="w-12 h-12 rounded-full bg-brick/10 flex items-center justify-center text-brick">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </div>
      <div>
        <p className="font-display font-semibold text-ink">Couldn&apos;t load results</p>
        <p className="text-sm text-muted mt-1 max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-4 py-2 rounded-full bg-forest text-paper text-sm font-medium hover:bg-forest-dark transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
