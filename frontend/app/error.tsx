"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="font-display font-semibold text-2xl text-ink">Something went wrong</h1>
      <p className="mt-2 text-muted text-sm">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="inline-block mt-6 px-4 py-2 rounded-full bg-forest text-paper text-sm font-medium hover:bg-forest-dark"
      >
        Try again
      </button>
    </div>
  );
}
