export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  pagination?: Pagination;
}

export interface ApiFailure {
  success: false;
  error: { message: string; details?: unknown };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface StateSummary {
  stateId: number;
  stateName: string;
  lgaCount: number;
}

export interface LgaSummary {
  uniqueId: number;
  lgaId: number;
  lgaName: string;
  stateName: string;
  wardCount: number;
  pollingUnitCount: number;
}

export interface WardSummary {
  uniqueId: number;
  wardId: number;
  wardName: string;
  lgaId: number;
  lga?: { uniqueId: number; lgaName: string };
}

export interface PollingUnitSummary {
  uniqueId: number;
  pollingUnitId: number;
  pollingUnitNumber: string | null;
  pollingUnitName: string;
  wardName: string | null;
  lgaName: string;
  stateName: string;
}

export interface PartyStanding {
  party: string;
  votes: number;
  percentage: number;
}

export interface ResultDetail {
  totalVotes: number;
  winner: PartyStanding | null;
  standings: PartyStanding[];
}

export interface PollingUnitResults extends ResultDetail {
  pollingUnit: {
    uniqueId: number;
    pollingUnitName: string;
    pollingUnitNumber: string | null;
    wardName: string | null;
    lgaName: string;
  };
}

export interface LgaResults extends ResultDetail {
  lga: { uniqueId: number; lgaId: number; lgaName: string };
}

export interface Party {
  id: number;
  partyId: string;
  partyName: string;
  totalPuVotes: number;
  totalLgaVotes: number;
}

export interface PartyAnalysis {
  party: { id: number; partyId: string; partyName: string };
  totalPuVotes: number;
  totalLgaVotes: number;
  lgasWon: number;
  pollingUnitsWon: number;
  percentageOfPuVotes: number;
  strongestLga: { name: string; votes: number } | null;
  strongestPollingUnit: { name: string; votes: number } | null;
}

export interface Agent {
  nameId: number;
  firstname: string;
  lastname: string;
  email: string | null;
  phone: string;
  pollingUnit: { uniqueId: number; name: string } | null;
}

export interface Overview {
  totalStates: number;
  totalLgas: number;
  totalWards: number;
  totalPollingUnits: number;
  totalParties: number;
  totalAgents: number;
  totalVotesRecorded: number;
  puVotesRecorded: number;
  lgaVotesRecorded: number;
  resultsEntered: number;
}

export interface PartyAnalyticsPoint {
  party: string;
  votes: number;
  percentage: number;
}

export interface LgaAnalyticsPoint {
  lgaId: number;
  lgaName: string;
  totalVotes: number;
  winner: { party: string; votes: number } | null;
}

export interface ResultRow {
  resultId: number;
  party: string;
  votes: number;
  dateEntered: string;
  pollingUnitId: number;
  pollingUnitName: string;
  wardName: string | null;
  lgaName: string;
  stateName: string;
}

export interface SearchResults {
  query: string;
  results: {
    states: { type: "state"; stateId: number; name: string }[];
    lgas: { type: "lga"; uniqueId: number; name: string; stateName: string }[];
    wards: { type: "ward"; uniqueId: number; name: string; lgaName: string }[];
    pollingUnits: { type: "pollingUnit"; uniqueId: number; name: string; lgaName: string; wardName: string | null }[];
    parties: { type: "party"; partyId: string; name: string }[];
  };
}
