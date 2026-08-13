import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="seal w-14 h-14 text-[10px] mx-auto mb-5">404</p>
      <h1 className="font-display font-semibold text-2xl text-ink">Page not found</h1>
      <p className="mt-2 text-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-full bg-forest text-paper text-sm font-medium hover:bg-forest-dark">
        Back to Dashboard
      </Link>
    </div>
  );
}
