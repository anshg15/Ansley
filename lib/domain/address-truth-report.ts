import type { AmenityResult } from "./amenity";
import type { Insight } from "./insight";
import type { PropertyProfile } from "./property";
import type { ReportSummary } from "./report-summary";
import type { RouteAnalysis } from "./route-analysis";
import type { RoutineFitResult } from "./routine-fit";
import type { ShadowCommuteResult } from "./shadow-commute";
import type { TimeLensResult } from "./time-lens";
import type { FailedAnchor } from "./failed-anchor";

export interface AddressTruthReport {
    property: PropertyProfile;
    summary: ReportSummary;
    routes: RouteAnalysis[];
    failedAnchors: FailedAnchor[];
    routineFit: RoutineFitResult | null;
    timeLens?: TimeLensResult[];
    shadowCommute?: ShadowCommuteResult[];
    amenities?: AmenityResult[];
    communityAccess?: AmenityResult[];
    safety?: Insight[];
    insights: Insight[];
    generatedAt: string;
}