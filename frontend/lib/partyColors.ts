// A fixed categorical palette so each party keeps the same color everywhere in the app.
// Colors chosen to be distinguishable and to sit well against the paper/forest theme —
// deliberately not the parties' real-world campaign colors (this is 2011 test data).
const PALETTE: Record<string, string> = {
  PDP: "#1F5C46",
  DPP: "#B8892B",
  ACN: "#A6432E",
  PPA: "#3E6D9C",
  CDC: "#7A5C9E",
  JP: "#C46A2E",
  ANPP: "#4B8F8C",
  LABO: "#8A6D3B",
  LABOUR: "#8A6D3B",
  CPP: "#6B7F45",
};

const FALLBACK = ["#1F5C46", "#B8892B", "#A6432E", "#3E6D9C", "#7A5C9E", "#C46A2E", "#4B8F8C", "#8A6D3B", "#6B7F45"];

export function partyColor(party: string, index = 0): string {
  return PALETTE[party.toUpperCase()] || FALLBACK[index % FALLBACK.length];
}
