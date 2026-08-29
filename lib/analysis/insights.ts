import type { AnalysedAnchor } from "@/lib/domain/analysed-anchor";
import type { Insight } from "@/lib/domain/insight";
import type { RoutineFitResult } from "@/lib/domain/routine-fit";

export function generateCoreInsights(anchors: AnalysedAnchor[], routineFit: RoutineFitResult | null,): Insight[] {
  const insights: Insight[] = [];

  if (routineFit) {
    insights.push({
      id: "routine-fit",
      type: "routine-fit",
      title: "Routine Fit",
      explanation: routineFit.explanation,
      severity: routineFit.percentage >= 75 ? "positive" : routineFit.percentage >= 50 ? "info" : "warning",
      evidence: [
        `${routineFit.passingVisitsPerWeek} of ${routineFit.totalVisitsPerWeek} regular weekly destination visits are within your travel limits.`,
      ],
    });
  }

  const largestBurden = [...anchors].sort(
    (left, right) => right.weeklyTravelMinutes - left.weeklyTravelMinutes,
  )[0];

  const totalWeeklyTravelMinutes = anchors.reduce(
    (total, anchor) => total + anchor.weeklyTravelMinutes,
    0,
  );

  if (largestBurden && totalWeeklyTravelMinutes > 0) {
    const share = Math.round((largestBurden.weeklyTravelMinutes / totalWeeklyTravelMinutes) * 100,);

    insights.push({
      id: `weekly-burden-${largestBurden.id}`,
      type: "route",
      title: `${largestBurden.name} is your biggest travel commitment`,
      explanation: `It accounts for ${share}% of your estimated weekly travel time (${formatWeeklyDuration(largestBurden.weeklyTravelMinutes)}).`,
      severity: "info",
      evidence: [
        `${largestBurden.weeklyTravelMinutes} estimated travel minutes per week`,
        `${share}% of total estimated weekly travel`,
      ],
    });
  }

  for (const anchor of anchors.filter((item) => !item.withinTravelTolerance,)) {
    const overBy = anchor.route.durationMinutes - anchor.maxTravelMinutes;

    insights.push({
      id: `travel-tolerance-${anchor.id}`,
      type: "route",
      title: `${anchor.name} is outside your travel preference`,
      explanation: `${anchor.route.durationMinutes} minutes each way is ${overBy} minute${overBy === 1 ? "" : "s"} above your $${anchor.maxTravelMinutes}-minute limit.`,
      severity: "warning",
      evidence: [
        `${anchor.route.durationMinutes} minutes estimated one way`,
        `${anchor.maxTravelMinutes} minute preferred maximum`,
      ],
    });
  }

  return insights;
}

function formatWeeklyDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours === 0 ? `${remainingMinutes}m` : `${hours}h ${remainingMinutes}m`;
}