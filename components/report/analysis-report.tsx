import type { AddressTruthReport, ReportModule } from "@/lib/domain/analysis";

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours > 0 ? `${hours}h ${remainder}m` : `${remainder}m`;
}

function moduleMessage(module: ReportModule) {
  if (module.coverage === "partial") return module.message ?? "Some results are unavailable.";
  return module.status === "unavailable" ? module.message : undefined;
}

export function AnalysisReport({ report, onEdit }: { report: AddressTruthReport; onEdit: () => void }) {
  const transportMessage = moduleMessage(report.modules.transport);
  const unavailableModules = [
    ["TimeLens", report.modules.timeLens],
    ["ShadowCommute", report.modules.shadowCommute],
    ["Everyday Access", report.modules.amenities],
    ["Safety Context", report.modules.safety],
  ] as const;

  return (
    <section aria-labelledby="report-heading" className="border border-border bg-paper p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-5">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-moss">Your life at this address</p>
          <h2 id="report-heading" tabIndex={-1} className="mt-2 text-2xl font-semibold tracking-[-0.03em] outline-none">
            {report.property.address}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-ink">
            Analysis generated {new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.generatedAt))}.
          </p>
        </div>
        <button type="button" onClick={onEdit} className="button-secondary min-h-0 px-4 py-2 text-sm">Edit details</button>
      </div>

      {transportMessage && (
        <p role="status" className="mt-6 border-l-2 border-amber bg-amber/10 px-4 py-3 text-sm leading-6 text-ink">
          {transportMessage}
        </p>
      )}

      <dl className="mt-7 grid gap-px border border-border bg-border sm:grid-cols-3">
        <div className="bg-paper p-4">
          <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Routine Fit</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{report.routineFit ? `${report.routineFit.percentage}%` : "—"}</dd>
          <p className="mt-2 text-sm leading-5 text-muted-ink">{report.routineFit?.explanation ?? "No route could be assessed."}</p>
        </div>
        <div className="bg-paper p-4">
          <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Weekly travel</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{formatMinutes(report.summary.weeklyTravelMinutes)}</dd>
          <p className="mt-2 text-sm leading-5 text-muted-ink">Estimated return travel across your routine.</p>
        </div>
        <div className="bg-paper p-4">
          <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Destinations analysed</dt>
          <dd className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{report.summary.analysedAnchors}</dd>
          <p className="mt-2 text-sm leading-5 text-muted-ink">Of {report.summary.analysedAnchors + report.failedAnchors.length} submitted.</p>
        </div>
      </dl>

      <section aria-labelledby="routes-heading" className="mt-9">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">LifeRadius</p>
            <h3 id="routes-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em]">Your regular journeys</h3>
          </div>
          <p className="text-right text-xs leading-5 text-muted-ink">One-way route times; weekly total includes return travel.</p>
        </div>

        {report.routes.length > 0 ? <ul className="divide-y divide-border">
          {report.routes.map((route) => {
            const anchor = report.anchors.find((item) => item.id === route.anchorId);
            return (
              <li key={route.anchorId} className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold">{anchor?.name ?? "Regular destination"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-ink">
                    {route.transportMode} · {route.transfers === 0 ? "no transfers" : `${route.transfers} transfer${route.transfers === 1 ? "" : "s"}`} · {route.walkingMinutes} min walking
                  </p>
                </div>
                <div className="flex items-end justify-between gap-6 sm:block sm:text-right">
                  <p className="text-2xl font-semibold tracking-[-0.04em]">{route.durationMinutes}m</p>
                  <p className={route.withinTolerance ? "text-sm font-medium text-moss" : "text-sm font-medium text-danger"}>
                    {route.withinTolerance ? "Within your limit" : "Over your limit"}
                  </p>
                </div>
              </li>
            );
          })}
        </ul> : <p className="py-6 text-sm leading-6 text-muted-ink">No live journeys were available for this request. You can edit the details and try again.</p>}

        {report.failedAnchors.length > 0 && <ul className="mt-3 space-y-2">
          {report.failedAnchors.map((anchor) => <li key={anchor.anchorId} className="border border-amber/40 bg-amber/10 px-4 py-3 text-sm leading-6"><strong>{anchor.name}:</strong> {anchor.message}</li>)}
        </ul>}
      </section>

      {report.insights.length > 0 && <section aria-labelledby="insights-heading" className="mt-9 border-t border-border pt-7">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">What stands out</p>
        <h3 id="insights-heading" className="mt-1 text-xl font-semibold tracking-[-0.03em]">Key insights</h3>
        <ul className="mt-4 space-y-3">
          {report.insights.map((insight) => <li key={insight.id} className="border-l-2 border-moss pl-4"><p className="font-medium">{insight.title}</p><p className="mt-1 text-sm leading-6 text-muted-ink">{insight.explanation}</p></li>)}
        </ul>
      </section>}

      <section aria-label="Data availability" className="mt-9 border-t border-border pt-6">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-ink">Data availability</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-ink">
          {unavailableModules.flatMap(([name, module]) => {
            const message = moduleMessage(module);
            return message ? [<li key={name}><strong className="font-medium text-ink">{name}:</strong> {message}</li>] : [];
          })}
        </ul>
      </section>
    </section>
  );
}
