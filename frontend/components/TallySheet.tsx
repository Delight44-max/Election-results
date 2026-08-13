import { PartyStanding } from "@/types";
import { partyColor } from "@/lib/partyColors";

// The signature element of the app: a results block styled after a paper collation
// sheet — the kind agents in this dataset would have filled out by hand — with a
// stamped "seal" marking the winner and dotted leader-lines connecting party names
// to their tallies.
export default function TallySheet({
  title,
  subtitle,
  totalVotes,
  winner,
  standings,
}: {
  title: string;
  subtitle?: string;
  totalVotes: number;
  winner: PartyStanding | null;
  standings: PartyStanding[];
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b border-line bg-forest/[0.03] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-ink">{title}</h3>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {winner && (
          <div className="flex items-center gap-2.5">
            <span className="seal w-12 h-12 text-[9px] bg-seal-radial">
              {winner.party}
            </span>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted">Leading</p>
              <p className="stat-figure text-sm font-semibold text-ink">
                {winner.votes.toLocaleString()} votes
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 py-2">
        {standings.length === 0 ? (
          <p className="py-6 text-sm text-muted text-center">No results recorded yet.</p>
        ) : (
          standings.map((s, i) => (
            <div key={s.party} className="tally-row">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: partyColor(s.party, i) }}
                  aria-hidden
                />
                <span className="font-medium text-sm text-ink truncate">{s.party}</span>
              </div>
              <span className="tally-leader" aria-hidden />
              <div className="flex items-baseline gap-2 shrink-0">
                <span className="stat-figure text-sm text-ink">{s.votes.toLocaleString()}</span>
                <span className="text-xs text-muted w-12 text-right">{s.percentage}%</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 sm:px-6 py-3 border-t border-line bg-forest/[0.02] flex items-center justify-between text-xs">
        <span className="text-muted uppercase tracking-wider">Total recorded</span>
        <span className="stat-figure font-semibold text-ink">{totalVotes.toLocaleString()} votes</span>
      </div>
    </div>
  );
}
