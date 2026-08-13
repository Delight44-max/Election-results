"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/results", label: "Results" },
  { href: "/polling-units", label: "Polling Units" },
  { href: "/lgas", label: "LGAs" },
  { href: "/parties", label: "Parties" },
  { href: "/agents", label: "Agents" },
  { href: "/analytics", label: "Analytics" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-forest text-paper border-b border-forest-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="seal w-9 h-9 text-[10px] leading-none border-gold-light text-gold-light group-hover:bg-gold-light/10 transition-colors">
              DC
            </span>
            <span className="font-display font-semibold text-lg tracking-tight hidden sm:block">
              Delta Collation
            </span>
          </Link>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Search polling units, LGAs, parties…"
                className="w-full bg-forest-dark/60 placeholder:text-paper/50 text-sm rounded-full pl-4 pr-10 py-2 border border-forest-light/40 focus:outline-none focus:ring-2 focus:ring-gold-light/70"
                aria-label="Global search"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-paper/70 hover:text-gold-light"
                aria-label="Search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-full transition-colors ${
                    active ? "bg-paper text-forest-dark" : "text-paper/85 hover:bg-forest-dark/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            className="lg:hidden p-2 -mr-2 text-paper"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-forest-dark bg-forest px-4 pb-4 pt-2">
          <form onSubmit={onSearch} className="mb-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="search"
              placeholder="Search…"
              className="w-full bg-forest-dark/60 placeholder:text-paper/50 text-sm rounded-full px-4 py-2.5 border border-forest-light/40 focus:outline-none focus:ring-2 focus:ring-gold-light/70"
              aria-label="Global search"
            />
          </form>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-lg ${
                    active ? "bg-paper text-forest-dark" : "text-paper/85 hover:bg-forest-dark/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
