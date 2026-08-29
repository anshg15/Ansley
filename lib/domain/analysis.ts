export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type PropertyProfile = {
  address: string;
  rentPerWeek?: number;
  coordinates?: Coordinates;
  dwellingType?: string;
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

export type InsightSeverity = "positive" | "warning" | "neutral";

export type Insight = {
  type: "routine-fit" | "weekly-burden" | "travel-tolerance";
  title: string;
  text: string;
  severity: InsightSeverity;
};

export type ModuleStatus = "available" | "unavailable";

export type AddressTruthReport = {
  property: PropertyProfile;
  anchors: AnalysedAnchor[];
  failedAnchors: FailedAnchor[];
  summary: {
    weeklyTravelMinutes: number;
    weeklyTravelHours: number;
    analysedAnchors: number;
  };
  routineFit: RoutineFit | null;
  insights: Insight[];
  modules: {
    transport: { status: ModuleStatus; message?: string };
    timeLens: { status: ModuleStatus; message?: string };
    shadowCommute: { status: ModuleStatus; message?: string };
    amenities: { status: ModuleStatus; message?: string };
  };
  generatedAt: string;
};
