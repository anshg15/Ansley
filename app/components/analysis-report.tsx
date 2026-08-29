import type { AddressTruthReport } from "@/lib/domain/analysis";

type AnalysisReportProps = {
  report: AddressTruthReport;
};

function formatWeeklyMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder} min`;
  }

  if (remainder === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

function routeModeLabel(
  modes: string[],
  walkingMinutes: number,
  durationMinutes: number,
) {
  if (
    modes.length === 0 &&
    walkingMinutes > 0 &&
    walkingMinutes >= durationMinutes - 1
  ) {
    return "Walking";
  }

  const walkingShare =
    durationMinutes > 0 ? walkingMinutes / durationMinutes : 0;

  if (walkingShare >= 0.8) {
    return "Mostly walking";
  }

  if (modes.length > 0) {
    return modes.join(" + ");
  }

  if (walkingMinutes > 0) {
    return "Walking";
  }

  return "Route";
}

export function AnalysisReport({ report }: AnalysisReportProps) {
  return (
    <section
      aria-labelledby="analysis-report-heading"
      aria-live="polite"
      className="mt-12 border-t border-border pt-10"
    >
      <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-moss">
            Decoded report
          </p>

          <h2
            id="analysis-report-heading"
            tabIndex={-1}
            className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
          >
            How this address fits your week.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-ink sm:text-base">
            {report.property.address}
          </p>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">
          {report.summary.analysedAnchors}{" "}
          {report.summary.analysedAnchors === 1
            ? "destination"
            : "destinations"}{" "}
          analysed
        </p>
      </div>

      <div className="grid border-b border-border sm:grid-cols-3">
        <div className="border-b border-border py-7 sm:border-b-0 sm:border-r sm:pr-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-ink">
            Routine Fit
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            {report.routineFit ? `${report.routineFit.percentage}%` : "—"}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-ink">
            {report.routineFit
              ? "of your regular destination visits fit the limits you set"
              : "Not enough route data to calculate"}
          </p>
        </div>

        <div className="border-b border-border py-7 sm:border-b-0 sm:border-r sm:px-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-ink">
            Weekly travel
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            {formatWeeklyMinutes(report.summary.weeklyTravelMinutes)}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-ink">
            estimated return travel across your regular week
          </p>
        </div>

        <div className="py-7 sm:pl-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted-ink">
            Live routing
          </p>

          <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
            {report.modules.transport.status === "available" ? "Live" : "—"}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-ink">
            {report.modules.transport.status === "available"
              ? "journeys analysed with current transport data"
              : report.modules.transport.message}
          </p>
        </div>
      </div>

      {report.anchors.length > 0 ? (
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold tracking-[-0.025em]">
              Your regular journeys
            </h3>

            <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-ink">
              One-way travel
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {report.anchors.map((anchor) => (
              <article
                key={anchor.id}
                className="border border-border bg-paper p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-5 border-b border-border pb-5">
                  <div>
                    <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-ink">
                      {anchor.category}
                    </p>

                    <h4 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      {anchor.name}
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-muted-ink">
                      {anchor.address}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 border px-2.5 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
                      anchor.withinTravelTolerance
                        ? "border-moss text-moss"
                        : "border-transit-coral text-transit-coral"
                    }`}
                  >
                    {anchor.withinTravelTolerance
                      ? "Within limit"
                      : "Over limit"}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-ink">
                      One way
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      {anchor.route.durationMinutes} min
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-ink">
                      Walking
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      {anchor.route.walkingMinutes} min
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-ink">
                      Transfers
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      {anchor.route.transfers}
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-ink">
                      Per week
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                      {formatWeeklyMinutes(anchor.weeklyTravelMinutes)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4 text-sm leading-6 text-muted-ink">
                  <span className="font-medium text-ink">
                    Route mode:{" "}
                    {routeModeLabel(
                      anchor.route.modes,
                      anchor.route.walkingMinutes,
                      anchor.route.durationMinutes,
                    )}
                  </span>
                  {" · "}
                  {anchor.visitsPerWeek}{" "}
                  {anchor.visitsPerWeek === 1 ? "visit" : "visits"} per week
                  {" · "}
                  your limit is {anchor.maxTravelMinutes} min
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {report.failedAnchors.length > 0 ? (
        <div className="mt-8 border border-transit-coral/40 bg-paper p-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-transit-coral">
            Some journeys could not be analysed
          </p>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-ink">
            {report.failedAnchors.map((anchor) => (
              <li key={anchor.anchorId}>
                <span className="font-medium text-ink">{anchor.name}:</span>{" "}
                {anchor.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
