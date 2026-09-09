/**
 * Structured Area Code Narrative & City Guide Data Types.
 * Stored in Firestore under `areaCodeNarratives/{code}`.
 */

export interface AreaCodeNarrative {
  /** 3-digit Area Code, e.g. "212" */
  code: string;
  /** Primary City Name, e.g. "New York City" */
  city: string;
  /** Primary Region or County, e.g. "Manhattan" */
  region: string;
  /** State or Province Name, e.g. "New York" */
  state: string;
  /** Country, e.g. "US", "Canada", "Caribbean" */
  country: string;
  /** Primary Timezone, e.g. "Eastern Time (ET)" */
  timezone: string;
  /** Dominant Carrier / CLEC, e.g. "Verizon New York Inc." */
  carrier?: string;

  /** Executive summary / 2-3 sentence overview */
  summary: string;
  /** In-depth telecommunications origins, original 1947 Bell System plan, exhaust & splits */
  history: string;
  /** Geographic boundaries, key boroughs, districts, or landmarks covered */
  geographicCoverage: string;
  /** Economic prestige, commercial demand, population and calling profile */
  economicProfile: string;
  /** Dialing procedures (10-digit mandates), overlay codes (e.g. 646, 332), TCPA calling windows */
  dialingRules: string;
  /** 2 to 4 notable cultural, pop-culture, or telecom fun facts */
  funFacts: string[];
  /** Search tags and keywords */
  tags: string[];

  /** Whether this record was synthesized by AI */
  aiGenerated: boolean;
  /** Model or engine used (e.g. "gemini-2.0-flash" or "telecom-intelligence-engine") */
  modelUsed?: string;
  /** Last updated ISO timestamp */
  lastUpdated: string;
  /** Editorial status */
  status: "published" | "draft";
}
