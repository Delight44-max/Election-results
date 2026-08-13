export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="seal w-8 h-8 text-[9px]">DC</span>
          <div>
            <p className="font-display font-semibold text-sm text-ink">Delta Collation</p>
            <p className="text-xs text-muted">Election results, collated and verified.</p>
          </div>
        </div>
        <p className="text-xs text-muted max-w-md sm:text-right">
          Built on the original Bincom election dataset. Figures reflect results as entered by
          collation agents and are shown for reference and analysis.
        </p>
      </div>
    </footer>
  );
}
