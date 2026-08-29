# Haley Implementation Journal

This is a plain-English record of the work implemented for AddressTruth so far. It is intended to answer three questions whenever you return to the project:

1. What was built?
2. How does it work?
3. Why was it built this way?

The product goal is not to rate a suburb or make a generic property score. It helps a renter understand how one address fits *their* regular life: travel to important places, time spent travelling, route trade-offs, and carefully qualified optional context.

## Current branch and delivery status

At the time this journal was written:

| Work area | State | Where it is |
| --- | --- | --- |
| P0 address-analysis foundation | Committed | `6f0d52f` |
| TimeLens and ShadowCommute | Committed | `04d2892` on `haley` |
| GitHub Actions CI | Committed | `9d806f5` on `main` |
| BOCSAR Safety Context | Implemented and verified, awaiting commit | working tree on `haley` |

Important: the safety files are currently uncommitted on `haley`. The CI workflow exists on `main`; merge or cherry-pick it into `haley` before relying on CI from that branch.

## Project shape in one picture

```text
Request from UI/API
  property + 1–4 personal anchors
          |
          v
validate request and preserve AddressTruth-owned fields
          |
          v
TfNSW adapter --> normalised routes --> deterministic analysis engine
                                      |-- weekly burden
                                      |-- Routine Fit
                                      |-- explanatory insights
                                      |-- optional TimeLens
                                      |-- ShadowCommute
                                      `-- optional Safety Context (BOCSAR + sourced facts)
          |
          v
stable AddressTruth report returned by /api/analyse
```

The important design choice is that provider-specific responses do not escape into the application contract. TfNSW and BOCSAR can change independently while the rest of the product continues to use the normalised report.

## Task AN-7 — Connect one real TfNSW journey

### What we built

A server-only TfNSW client that converts an origin address and one destination address into a journey request.

### How it works

- [`lib/providers/tfnsw/client.ts`](../../lib/providers/tfnsw/client.ts) resolves the property and anchor addresses using TfNSW Stop Finder.
- It caches location lookups during one analysis run, so the property address is not resolved repeatedly.
- It sends the resolved locations to TfNSW Trip Planner using the server-side `TFNSW_API_KEY`.
- When the key is missing, the client returns a clear configuration error rather than leaking a secret or crashing the whole report.

### Why we did it this way

Address strings alone are ambiguous. Stop Finder gives TfNSW the chance to resolve them before trip planning. Keeping the API key server-only protects it from browser exposure, and the graceful failure means a partially useful report is still possible if live routing is unavailable.

### Verification

[`lib/providers/tfnsw/client.test.ts`](../../lib/providers/tfnsw/client.test.ts) uses mocked network responses to check Stop Finder, Trip Planner, authentication headers, and error handling without using real credentials.

## Task AN-8 — Normalise TfNSW journey data

### What we built

A small translator from TfNSW’s provider-shaped journey response to the app’s `RouteAnalysis` model.

### How it works

[`lib/providers/tfnsw/normalise.ts`](../../lib/providers/tfnsw/normalise.ts) extracts:

- one-way duration;
- walking duration and distance;
- number of transfers;
- transport modes;
- departure/arrival times when available; and
- the quickest alternative route’s extra time.

It accepts the response formats that matter to the current API, converts numeric seconds and ISO durations to minutes, and rejects malformed journeys instead of inventing data.

### Why we did it this way

The analysis engine should care about travel concepts, not TfNSW JSON nesting. This keeps the rest of the code readable and makes a future provider replacement much safer.

### Verification

[`lib/providers/tfnsw/normalise.test.ts`](../../lib/providers/tfnsw/normalise.test.ts) tests the committed fixture in [`fixtures/tfnsw-journey.json`](../../fixtures/tfnsw-journey.json), including duration-unit conversion and transfer counting.

## Tasks AN-12 and AN-13 — Multiple anchors and weekly burden

### What we built

An analysis request can contain one to four personal anchors: work, study, healthcare, social, exercise, or another chosen destination. Each anchor has a weekly visit frequency and maximum comfortable one-way travel time.

### How it works

- [`lib/domain/validation.ts`](../../lib/domain/validation.ts) validates the request, accepts only supported categories, prevents duplicate anchor IDs, and caps requests at four anchors.
- [`lib/analysis/analyse.ts`](../../lib/analysis/analyse.ts) analyses up to two routes concurrently to be considerate of TfNSW.
- [`lib/analysis/weekly-burden.ts`](../../lib/analysis/weekly-burden.ts) calculates return travel as `one-way minutes × visits per week × 2`.
- If one anchor fails, it is returned in `failedAnchors`; successful anchors still produce a report.

### Why we did it this way

A home is not defined by one commute. Multiple anchors make the output personally meaningful, while the cap, concurrency limit, and partial-failure model keep the prototype fast, inexpensive, and honest.

### Verification

[`lib/analysis/analyse.test.ts`](../../lib/analysis/analyse.test.ts) verifies multi-anchor totals and that one failed journey does not discard successful results. [`app/api/analyse/route.test.ts`](../../app/api/analyse/route.test.ts) verifies invalid requests return helpful `400` responses and missing TfNSW configuration remains a usable `200` report with an unavailable transport module.

## Task AN-14 — Routine Fit

### What we built

A transparent Routine Fit percentage in [`lib/analysis/routine-fit.ts`](../../lib/analysis/routine-fit.ts).

### How it works

For every analysed anchor, the route either meets or exceeds the user’s own one-way tolerance. Routine Fit is the percentage of weekly visits that meet that tolerance, weighted by visit frequency.

Example: if work is visited five times each week and exceeds the tolerance while the gym is visited once and passes, the result is `1 / 6 = 17%`, not `50%`. The frequent commitment appropriately matters more.

### Why we did it this way

It is a user-controlled measure, not an unexplained AI score. The report also includes the passing and total visits plus explanatory text so the number can be questioned and understood.

## Task AN-15 — Deterministic insights

### What we built

Short, rule-based explanation cards in [`lib/analysis/insights.ts`](../../lib/analysis/insights.ts).

### How it works

The insight generator reads the same routes, weekly burden, and Routine Fit already present in the report. It explains meaningful consequences such as an anchor exceeding the user’s tolerance or a high weekly travel commitment. It does not call an LLM or make hidden inferences.

### Why we did it this way

For an early decision tool, reproducible reasoning is more trustworthy and easier to test than generated persuasion. Every insight can be traced back to a visible calculation.

## Task AN-16 — TimeLens

### What we built

Optional representative-time comparison for the routes that matter most.

### How it works

- [`lib/analysis/time-lens.ts`](../../lib/analysis/time-lens.ts) evaluates the next Sydney weekday at 8:00 AM and 6:00 PM.
- It selects at most two anchors (either chosen by the user or the two most frequent).
- It makes at most two extra route calls per selected anchor, then reports the minimum, maximum, and variation.
- If these extra calls fail, it shows the primary route and clearly marks TimeLens as unavailable.

### Why we did it this way

Travel times are time-dependent, but unrestricted time sampling would be slow, expensive, and falsely precise. Two representative periods demonstrate the trade-off while retaining a strict provider-load budget.

### Verification

[`lib/analysis/time-lens.test.ts`](../../lib/analysis/time-lens.test.ts) checks Sydney weekday selection, fixed representative times, the two-anchor/two-period caps, and fallback behavior.

## Task AN-17 — ShadowCommute

### What we built

A concise route-fragility explanation, named ShadowCommute, in [`lib/analysis/shadow-commute.ts`](../../lib/analysis/shadow-commute.ts).

### How it works

The module uses only visible route factors:

- number of transfers;
- walking minutes; and
- how much longer the fastest available alternative is.

Those factors form a small transparent score that maps to low, medium, or high and is always returned with human-readable reasons. Missing alternative-route data is explicitly labelled unavailable and does **not** make a route appear worse.

### Why we did it this way

The goal is not to predict disruption. It is to make route complexity and the cost of a fallback visible before someone rents a property.

### Verification

[`lib/analysis/shadow-commute.test.ts`](../../lib/analysis/shadow-commute.test.ts) checks both the explanation and the important missing-backup-route case.

## Tasks AN-38 and AN-39 — BOCSAR Safety Context and sourced safety heuristics

### What we built

An optional Safety Context that combines three clearly separated kinds of information:

| Context | Source label | Example |
| --- | --- | --- |
| Broad area context | `official-data` | BOCSAR LGA-level violent/property crime rates |
| Property fact | `listing-derived` or `user-confirmed` | controlled entry, intercom, secure parking |
| Routine description | `addresstruth-heuristic` | an analysed route includes nine minutes of walking |

### How it works

- [`lib/providers/bocsar/client.ts`](../../lib/providers/bocsar/client.ts) downloads BOCSAR’s official LGA rankings workbook, accepts only official BOCSAR hosts, and extracts the latest violent- and property-crime rates for the supplied `property.localGovernmentArea`.
- The BOCSAR adapter is isolated behind `SafetyProvider`, so it can be removed without changing transport analysis.
- [`lib/analysis/safety-context.ts`](../../lib/analysis/safety-context.ts) builds source-labelled area, property, and routine statements.
- [`lib/domain/analysis.ts`](../../lib/domain/analysis.ts) defines the stable `SafetyContext` contract.
- [`lib/domain/validation.ts`](../../lib/domain/validation.ts) accepts only a small allowed set of property features and requires the evidence source for each one.
- [`app/api/analyse/route.ts`](../../app/api/analyse/route.ts) attaches the BOCSAR adapter to the report.

### Why we did it this way

Crime statistics describe a large area, not a person, building, or likelihood of an incident. Property features also do not prove safety. The module therefore contains an explicit disclaimer and intentionally never outputs:

- a safe/unsafe suburb score;
- a break-in probability;
- an assertion that an apartment is inherently safe; or
- a prediction about a renter’s experience.

This follows the project’s safety guidance in [`docs/planning/AddressTruth-System-Desig-Architecture-Lead-1st-plan.md`](../planning/AddressTruth-System-Desig-Architecture-Lead-1st-plan.md).

### Security decision worth remembering

The first workbook parser considered had an unpatched high-severity dependency advisory. It was removed before delivery. The final implementation uses the small `fflate` ZIP dependency, only reads workbooks from official BOCSAR hosts, and finished with `npm audit` reporting zero vulnerabilities.

### Verification

- [`lib/analysis/safety-context.test.ts`](../../lib/analysis/safety-context.test.ts) checks source labels, disclaimers, and the absence of a safety score.
- [`lib/providers/bocsar/client.test.ts`](../../lib/providers/bocsar/client.test.ts) checks the real workbook layout and rejects non-BOCSAR source URLs.
- A read-only live check successfully retrieved Inner West’s violent and property crime rates for April 2025–March 2026.

## Testing foundation

### What we built

The project uses Node’s built-in test runner through `tsx`:

```bash
npm test
```

Tests live beside the code they protect. This makes it easy to find the behavior and its proof together.

### Why we did it this way

The project needs fast, dependency-light automated checks before a complex UI or live API credentials are required. External services are mocked for normal tests, while live checks are kept explicit and read-only.

## GitHub Actions CI

### What we built

[The CI workflow on `main`](https://github.com/HaleyyT/Ansley/blob/main/.github/workflows/ci.yml) runs on pushes and pull requests to `main`.

It uses Node 22 from `.nvmrc`, installs exactly locked dependencies with `npm ci`, then runs:

```bash
npm test
npm run lint
npm run build
```

### Why we did it this way

The same checks run locally and in GitHub, reducing “works on my machine” differences. Dependency caching speeds repeat runs; least-privilege permissions and concurrency cancellation keep the workflow practical and safe.

## Everyday verification checklist

Before committing or opening a pull request, run:

```bash
npm test
npm run lint
npm run build
npm audit
git diff --check
```

For Safety Context only, a separate read-only live BOCSAR check is useful when the upstream workbook changes. Normal tests do not need network access or API keys.

## Tasks AN-43 and AN-44 — Honest module states and deterministic API integration

### What we built

The `AddressTruthReport.modules` contract now gives the frontend three safe, provider-independent facts for every module:

- `status`: whether there is usable output;
- `coverage`: whether the output is complete, partial, or absent; and
- `source`: whether it comes from a live provider, a derived calculation, an intentionally unrequested module, or a module not yet enabled.

For example, if one of two anchors cannot be routed, transport remains available but reports `coverage: "partial"` with a concise user-safe explanation. This lets the report UI render the successful destination while honestly identifying the gap.

[`app/api/analyse/route.ts`](../../app/api/analyse/route.ts) also exports a small handler factory. Production still constructs the real TfNSW, BOCSAR, and NSW LGA clients on the server. Tests can instead pass deterministic provider doubles, with no credentials or network access.

### Why we did it this way

Ansh owns the report experience and needs a stable, simple signal for loading, unavailable, and partial-result states. The UI should not inspect TfNSW or BOCSAR failures or know their response formats. These fields are additive to the shared report contract, so they do not displace the existing route, safety, TimeLens, or ShadowCommute data.

### Verification

[`app/api/analyse/route.test.ts`](../../app/api/analyse/route.test.ts) now covers the complete request parsing → analysis → JSON response pipeline in two important cases:

1. a fully successful route and official safety-context response; and
2. a partial transport failure where one route succeeds and one is unavailable.

The deterministic tests prove the exact response that the frontend integrates with, while production continues to use real server-side provider clients.

## Important implementation principles

1. **The user sets the preferences.** Travel tolerance and anchor frequency come from the request; the app does not silently decide what matters.
2. **Facts, rules, and uncertainty are visible.** Provider outages, partial results, missing alternatives, and optional modules are labelled rather than hidden.
3. **Do not leak provider formats.** Keep TfNSW and BOCSAR adapters behind domain models.
4. **Keep optional modules removable.** Amenities, map, and safety must not block core routing and routine analysis.
5. **Prefer deterministic explanations.** Clear calculations are easier to trust, maintain, and test than opaque scores.
6. **Treat safety claims cautiously.** Broad official statistics and building characteristics are context, never predictions about an individual’s safety.

## Best next reading order

1. [`docs/planning/AddressTruth_7_Hour_Prototype_Plan.md`](../planning/AddressTruth_7_Hour_Prototype_Plan.md) for the original product and scope decisions.
2. [`lib/domain/analysis.ts`](../../lib/domain/analysis.ts) for the current request/report contract.
3. [`lib/analysis/analyse.ts`](../../lib/analysis/analyse.ts) for the orchestration flow.
4. The test files beside each module for concrete examples of expected behavior.
5. [`docs/planning/UI-plan.md`](../planning/UI-plan.md) before building the next frontend experience.
