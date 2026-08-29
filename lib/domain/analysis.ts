export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PropertyProfile = {
  address: string;
  rentPerWeek?: number;
  coordinates?: Coordinates;
  dwellingType?: string;
  localGovernmentArea?: string;
  securityFeatures?: PropertySecurityFeature[];
  source?: "manual" | "extracted";
};

export type PropertySecurityFeature = {
  feature: "controlled-entry" | "intercom" | "secure-parking" | "upper-floor" | "street-level-access";
  source: "listing" | "user-confirmed";
};

export type AnchorCategory = "work" | "education" | "health" | "social" | "exercise" | "other";

export type Anchor = {
  id: string;
  name: string;
  address: string;
  visitsPerWeek: number;
  maxTravelMinutes: number;
  category: AnchorCategory;
};

export type AnalysisRequest = {
  property: PropertyProfile;
  anchors: Anchor[];
  options?: AnalysisOptions;
  userProfile?: UserProfile;
  preferences?: LifestylePreference[];
};

export type TimeLensPeriodId = "weekday-morning" | "weekday-evening";

export type AnalysisOptions = {
  timeLens?: boolean | {
    anchorIds?: string[];
    periodIds?: TimeLensPeriodId[];
  };
};

export type RepresentativeDeparture = {
  date: string;
  time: string;
  timeZone: "Australia/Sydney";
};

export type RouteAnalysis = {
  anchorId: string;
  durationMinutes: number;
  walkingMinutes: number;
  walkingDistanceMetres?: number;
  transfers: number;
  modes: string[];
  departureTime?: string;
  arrivalTime?: string;
  alternativeDurationMinutes?: number;
};

export type AnalysedAnchor = Anchor & {
  route: RouteAnalysis;
  weeklyTravelMinutes: number;
  withinTravelTolerance: boolean;
};

export type FailedAnchor = {
  anchorId: string;
  name: string;
  message: string;
};

export type RoutineFit = {
  percentage: number;
  passingVisitsPerWeek: number;
  totalVisitsPerWeek: number;
  explanation: string;
};

export type InsightSeverity = "positive" | "info" | "warning";

export type Insight = {
  id: string;
  type: "route" | "routine-fit" | "time-lens" | "shadow-commute" | "amenity" | "community-access" | "safety" | "general";
  title: string;
  explanation: string;
  evidence: string[];
  severity: InsightSeverity;
};

export type TimeLensPeriod = {
  id: TimeLensPeriodId;
  label: string;
  durationMinutes: number;
};

export type TimeLensResult = {
  anchorId: string;
  status: ModuleStatus;
  periods: TimeLensPeriod[];
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  variationMinutes?: number;
  message?: string;
};

export type ShadowCommuteLevel = "low" | "medium" | "high";

export type ShadowCommuteResult = {
  anchorId: string;
  level: ShadowCommuteLevel;
  score: number;
  reasons: string[];
  backupRoute: {
    status: ModuleStatus;
    penaltyMinutes?: number;
    message?: string;
  };
};

export type ModuleStatus = "available" | "unavailable";

export type ReportModuleCoverage = "complete" | "partial" | "none";

export type ReportModuleSource = "live" | "derived" | "not-requested" | "not-enabled";

/**
 * Provider-independent metadata for rendering an honest module state.
 * It deliberately contains no raw provider payloads, credentials, or claims
 * beyond the analysis that was actually completed for this report.
 */
export type ReportModule = {
  status: ModuleStatus;
  coverage: ReportModuleCoverage;
  source: ReportModuleSource;
  message?: string;
};

export type SafetySource = {
  label: "official-data" | "listing-derived" | "user-confirmed" | "addresstruth-heuristic";
  name: string;
  url?: string;
  dataPeriod?: string;
  retrievedAt?: string;
  freshness?: "current" | "stale";
};

export type SafetyContext = {
  area: {
    status: ModuleStatus;
    localGovernmentArea?: string;
    observations: Array<{
      offence: string;
      ratePer100k: number;
      source: SafetySource;
    }>;
    message?: string;
  };
  property: Array<{
    text: string;
    source: SafetySource;
  }>;
  routine: Array<{
    text: string;
    source: SafetySource;
  }>;
  disclaimer: string;
};

export type AddressTruthReport = {
  property: PropertyProfile;
  anchors: AnalysedAnchor[];
  routes: ReportRouteAnalysis[];
  failedAnchors: FailedAnchor[];
  summary: {
    weeklyTravelMinutes: number;
    weeklyTravelHours: number;
    analysedAnchors: number;
  };
  routineFit: RoutineFit | null;
  insights: Insight[];
  timeLens: TimeLensResult[];
  shadowCommutes: ShadowCommuteResult[];
  modules: {
    transport: ReportModule;
    timeLens: ReportModule;
    shadowCommute: ReportModule;
    amenities: ReportModule;
    safety: ReportModule;
  };
  safetyContext: SafetyContext;
  generatedAt: string;
};
import type { LifestylePreference } from "./lifestyle-preference";
import type { RouteAnalysis as ReportRouteAnalysis } from "./route-analysis";
import type { UserProfile } from "./user-profile";
