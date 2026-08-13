"use client";

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  const push = (p: number | "...") => pages.push(p);
  push(1);
  if (page > 3) push("...");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) push(p);
  if (page < totalPages - 2) push("...");
  if (totalPages > 1) push(totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 flex-wrap py-2" aria-label="Pagination">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-full text-sm border border-line disabled:opacity-40 hover:bg-forest/5"
        aria-label="Previous page"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-2 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-full text-sm ${
              p === page ? "bg-forest text-paper" : "border border-line hover:bg-forest/5"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-full text-sm border border-line disabled:opacity-40 hover:bg-forest/5"
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
