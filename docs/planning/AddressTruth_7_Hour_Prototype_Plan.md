# AddressTruth — 7-Hour High-Quality Working Prototype Plan

**Hackathon:** SYNCS HACK 2026  
**Theme:** Blocks That Make Up The World  
**Primary Challenge:** What tools can we use to ensure accessibility to our essential resources?  
**Team Size:** 2 developers  
**Prototype Target:** Fully working and deployed within ~7 hours  
**Hard Submission Deadline:** 12:00 PM Sunday 30 August 2026, Sydney time

---

# 1. The Product We Are Actually Building

## AddressTruth

> **Rental sites tell you what the property is. AddressTruth tells you what your life there will be like.**

The user gives us:

- a prospective rental;
- who/what makes up their weekly life;
- places they regularly visit;
- lifestyle and essential-service preferences;
- optionally a life-stage preset.

We return:

# **Your Life at This Address**

with:

1. **LifeRadius** — how this address connects to their real routine.
2. **Routine Fit** — whether their regular journeys meet *their* tolerances.
3. **TimeLens** — how travel changes morning/evening/weekend.
4. **ShadowCommute** — how fragile/annoying journeys are.
5. **Everyday Access** — groceries, healthcare, parks, etc.
6. **Community & Culture Access** — explicitly selected cultural/lifestyle needs.
7. **Map** — visual context.
8. **Explainable verdict** — the important trade-offs.

## Not the 7-hour prototype

- property comparison;
- listing-site scraping;
- authentication;
- database;
- sophisticated AI scoring;
- ML;
- detailed restaurant recommender;
- comprehensive safety modelling;
- planning/noise/flood/broadband/etc.

Those are future modules.

---

# 2. The 7-Hour Success Condition

The internal target should be to have this exact story working by the end of the seven-hour build window:

```text
Enter rental
    ↓
Choose Student / Professional / Family / Custom
    ↓
Add 3–4 important destinations
    ↓
Choose 2–3 everyday/lifestyle preferences
    ↓
Analyse
    ↓
REAL TfNSW + POI data
    ↓
Your Life at This Address
    ↓
LifeRadius + TimeLens + ShadowCommute
+ Everyday Access + Map + Verdict
```

If that works beautifully, the project is already a strong hackathon submission.

Everything beyond it is bonus.

---

# 3. Final Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Language | **TypeScript** | One language end-to-end |
| Framework | **Existing Next.js project** | Full-stack without another service |
| UI | **React + existing styling setup** | Don't migrate styling frameworks now |
| Server | **Next.js Route Handlers / server functions** | Hides keys; no separate backend |
| Transit | **TfNSW Trip Planner API** | Official NSW trip planning |
| Transit location lookup | **TfNSW Stop Finder** | Produces locations intended for Trip Planner |
| POIs | **Geoapify Places API** | Nearby category search; broad amenity taxonomy |
| Amenity walking | **Geoapify Routing `walk`** | Same key/provider as POIs |
| Map rendering | **MapLibre GL JS** | Good interactive map layer |
| Map tiles | **MapTiler Cloud** | Easy web maps; generous free plan |
| Safety later | **BOCSAR static/open dataset** | Official NSW crime data |
| Persistence | **None required** | React state/localStorage is enough |
| Deployment | **Existing preferred deployment path, likely Vercel if already configured** | Don't introduce infrastructure |

### Current API notes

TfNSW Stop Finder can handle known addresses/places and Trip Planner provides NSW public-transport options including walking legs and real-time information.

The standard TfNSW API allowance is large enough for a hackathon prototype, but requests should still be kept under the documented rate limit.

Geoapify is useful because its Places API supports many nearby amenity categories, including supermarkets, restaurants, healthcare, parks, education, and community-related resources.

It also supports pedestrian routing.

MapTiler provides a lightweight map-hosting path for the prototype.

---

# 4. System Architecture

Keep it **one Next.js application**.

```text
┌──────────────────── CLIENT ─────────────────────┐
│                                                │
│ Property Form                                  │
│ Life-stage Preset                              │
│ Anchor Editor                                  │
│ Lifestyle Preferences                         │
│                                                │
│                 Analyse                        │
│                    │                           │
└────────────────────┼───────────────────────────┘
                     │
                     ▼
┌────────────── NEXT.JS SERVER ───────────────────┐
│                                                │
│ /api/analyse                                   │
│       │                                        │
│       ├──── TfNSW Adapter                      │
│       │      ├ Stop Finder                     │
│       │      └ Trip Planner                    │
│       │                                        │
│       ├──── Geoapify Adapter                   │
│       │      ├ Places                          │
│       │      └ Walking routes                  │
│       │                                        │
│       └──── optional Safety Adapter            │
│                                                │
│                 ↓                              │
│          NORMALISED DOMAIN DATA                │
│                 ↓                              │
│             Analysis Engine                    │
│                 ↓                              │
│          AddressTruthReport                    │
└────────────────────┬───────────────────────────┘
                     │
                     ▼
┌──────────────────── CLIENT ─────────────────────┐
│                                                │
│ Hero metrics                                   │
│ LifeRadius                                     │
│ TimeLens                                       │
│ ShadowCommute                                  │
│ Everyday / Community Access                    │
│ Map                                            │
│ Insights                                       │
│ Life Fit Verdict                               │
│                                                │
└────────────────────────────────────────────────┘
```

The most important architectural rule:

> **The UI never sees raw TfNSW or Geoapify objects.**

That lets both developers work independently.

---

# 5. Domain Contract

Create the types **before doing more integrations**.

Conceptually:

```ts
PropertyProfile
- address
- rentPerWeek
- coordinates
- dwellingType?
- securityFeatures?

UserProfile
- lifeStage
- rentBudget?

Anchor
- id
- name
- address
- visitsPerWeek
- maxTravelMinutes
- category

LifestylePreference
- id
- label
- category
- query?
- importance?

RouteAnalysis
- anchorId
- durationMinutes
- walkingMinutes
- walkingDistanceMetres
- transfers
- modes
- departureTime
- arrivalTime
- alternativeDurationMinutes?

TimeLensResult
- anchorId
- periods[]

ShadowCommuteResult
- level
- score
- reasons[]

AmenityResult
- preferenceId
- places[]
- nearestDistance
- walkingMinutes?

Insight
- type
- title
- text
- severity

AddressTruthReport
- property
- summary
- anchors[]
- routineFit
- weeklyTravelMinutes
- timeLens[]
- shadowCommutes[]
- amenities[]
- insights[]
```

## Important

Make advanced fields **optional**.

This remains a valid report:

```text
LifeRadius ✓
TimeLens ✓
ShadowCommute ✓
Amenities ✕
Safety ✕
```

The frontend simply doesn't render unavailable sections.

---

# 6. Core Calculations

Do **not** use AI for core analysis.

## Weekly Travel Burden

```text
weeklyMinutes =
oneWayMinutes × 2 × visitsPerWeek
```

Explicitly label the return journey as an approximation.

---

## Routine Fit

Let the renter define acceptable travel time.

Example:

```text
University
4 visits/week
maximum acceptable: 45 min
actual: 33 min
→ PASS
```

Then:

```text
Routine Fit =
visits/week belonging to passing anchors
────────────────────────────────────── × 100
total weekly visits
```

Example:

```text
University 4 ✓
Work       3 ✓
Gym        4 ✕
Friends    2 ✓

9 / 13 = 69%
```

Explain it as:

> **69% of your regular weekly destination visits fall within the travel limits you set.**

That's credible and explainable.

---

# 7. LifeRadius

This is the core report module.

Show:

```text
🎓 University
33 min each way
4× / week
4h 24m estimated weekly travel
✓ Within your 45m preference

💼 Work
41 min
3× / week
4h 06m weekly
⚠ 1m above your preference
```

Then:

> **Estimated weekly travel: 9h 42m**

Automatically identify major contributors:

> University accounts for **45% of your weekly travel burden**.

This feels intelligent while remaining deterministic.

---

# 8. TimeLens

This is the highest-value ambitious feature because it reuses TfNSW.

Don't query every conceivable time.

For the 7-hour version use **two periods**:

### Weekday morning
For example: 8:00 AM.

### Weekday evening
For example: 6:00 PM.

If ahead, add:

### Weekend daytime

Then:

```text
University

8 AM      31 min
6 PM      39 min

Variation: +8 min
```

Insight:

> Your university journey becomes approximately **26% longer in the evening**.

For social destinations, eventually analyse late-night return journeys.

This directly supports student realities such as:

- university;
- part-time work;
- gym;
- Friday-night plans.

---

# 9. ShadowCommute

Keep this extremely simple and explainable.

## Transfers

```text
0 → 0
1 → 1
2+ → 2
```

## Walking

```text
≤8 min   → 0
9–15 min → 1
>15 min  → 2
```

## Backup Route Penalty

```text
≤10 min slower     → 0
11–20 min slower   → 1
>20/no alternative → 2
```

## Total

```text
0–1 → Low
2–3 → Medium
4–6 → High
```

Output:

> **Medium ShadowCommute**  
> 1 transfer · 12 min walking · alternative route +17 min.

Never claim reliability probabilities.

---

# 10. Everyday Access

For the 7-hour prototype, let users choose **up to three** preferences.

Examples:

```text
☑ Supermarket
☑ Pharmacy
☑ Park
```

or:

```text
☑ Aldi
☑ Gym
☑ Cafes
```

Then show something like:

> ### Groceries
> Woolworths Metro  
> **620 m · ~8 min walk**

Use real walking routes where feasible rather than straight-line distance.

---

# 11. Community & Culture Access

Architect it **now**, but keep implementation narrow.

Do not create a separate backend.

It's the same preference system:

```text
LifestylePreference
```

Examples:

- Vietnamese groceries;
- Indian groceries;
- halal food;
- vegetarian restaurants;
- community centres;
- religious institutions.

The important ethical/product rule:

> **Never infer cultural preferences from ethnicity.**

The user chooses them explicitly.

If keyword-based discovery proves unreliable, support only the categories that work reliably in the prototype.

Don't burn excessive time perfecting culturally-specific POI classification.

---

# 12. Life-Stage Presets

These are cheap and high-value.

Don't build separate applications.

Each preset simply populates suggested fields.

## Student

Suggest:

- university;
- work;
- groceries;
- gym;
- friends;
- late-night/social destination.

## Professional

Suggest:

- work;
- groceries;
- gym;
- cafes;
- healthcare;
- weekend activity.

## Family

Suggest:

- work;
- childcare/school;
- supermarket;
- healthcare;
- park;
- family/community destination.

## Custom

Nothing preselected.

Everything remains editable.

This makes AddressTruth feel relevant beyond university students without adding major backend complexity.

---

# 13. Safety

## Architect for it, but do **not put it on the 7-hour critical path**

Official BOCSAR crime data can support future area context.

The eventual model:

```text
AREA CONTEXT
BOCSAR
       +
PROPERTY CONTEXT
apartment / house
controlled entry
intercom
floor
secure parking
       +
ROUTINE CONTEXT
late-night travel
walking
       ↓
SAFETY CONTEXT
```

## Never output

> Safety 82/100.

Or:

> Low break-in risk because apartment.

## Prefer

> Reported break-and-enter data provides area context. This dwelling also appears to have controlled-access characteristics that differ from a street-access property.

For the seven-hour prototype:

**P2 after the core prototype works.**

---

# 14. Screenshot / Listing Ingestion

Also keep it off the first seven-hour critical path.

The manual flow should be excellent first:

```text
Address
Weekly rent
Dwelling type
Bedrooms
Bathrooms
```

Then later, if there is time:

```text
Screenshot
   ↓
vision extraction
   ↓
confirm/edit
   ↓
same PropertyProfile
```

The analysis engine must not care whether property details came from:

- manual input;
- screenshot;
- future authorised listing API.

Do not rely on prohibited listing-site scraping.

---

# 15. Map

Do not spend an hour drawing sophisticated route geometry.

## P0 Map

Show:

- property marker;
- anchor markers;
- selected amenity markers.

That's it.

## If Ahead

Add:

- selected anchor route;
- highlight active item.

The map is a **supporting visual**, not the application.

---

# 16. Report UX

Recommended order:

```text
YOUR LIFE AT
17 Example Street, Newtown

──────── HERO ────────

74% Routine Fit
8h 32m weekly travel
$720/week

──────── MAP ─────────

Property + life anchors

────── LIFERADIUS ────

University     31m ✓
Work           37m ✓
Gym            26m ✕
Friends        18m ✓

────── TIMELENS ──────

Morning        31m
Evening        39m

──── SHADOWCOMMUTE ───

Moderate
1 transfer · 11m walking

──── EVERYDAY ACCESS ─

Groceries      8m walk
Pharmacy       6m walk
Park           4m walk

──── KEY INSIGHTS ────

→ Uni = 43% of weekly travel
→ Gym exceeds your tolerance
→ Evening commute adds 8 minutes

────── VERDICT ───────

Mostly works for your routine...
```

That's enough.

Don't add 15 dashboard cards.

---

# 17. Deterministic Insight Engine

One of the easiest ways to make the prototype feel sophisticated.

No LLM required.

Example rules:

```text
if largestAnchorShare > 0.40:
    "University accounts for 43% of your weekly travel."

if route > maxTolerance:
    "Your gym trip exceeds your preferred maximum by 7 minutes."

if evening > morning * 1.2:
    "This commute becomes substantially longer in the evening."

if shadowCommute == HIGH:
    "This route is particularly sensitive to transfers and alternatives."
```

You'll get clean, consistent explanations every time.

---

# 18. API Design

Avoid lots of frontend endpoints.

Make the frontend primarily use:

```text
POST /api/analyse
```

Conceptual request:

```json
{
  "property": {},
  "anchors": [],
  "preferences": [],
  "options": {
    "timeLens": true
  }
}
```

Response:

```text
AddressTruthReport
```

Internally:

```text
TfNSWAdapter
GeoapifyAdapter
```

If autocomplete is needed:

```text
GET /api/locations?q=
```

That's enough.

---

# 19. Concurrency

TfNSW has request-rate limits.

Don't do:

```text
Promise.all(50 requests)
```

For:

- 4 anchors;
- 2 time periods;

you have roughly 8 route calls.

Run them in small batches, such as 2–3 concurrent requests.

---

# 20. Failure Handling

This matters enormously for judging.

## TfNSW fails

Don't crash the report.

Show:

> Live transport analysis is temporarily unavailable.

If using a known demo scenario:

> Showing saved TfNSW demo snapshot captured at [timestamp].

Clearly label it.

---

## Geoapify fails

Hide:

- Everyday Access;
- Community Access.

Everything else renders.

---

## Map fails

The report continues.

---

## TimeLens fails

Use the primary route only.

---

## ShadowCommute lacks alternatives

Say:

> Backup route data unavailable.

Don't manufacture a high-risk score.

---

## Optional module fails

Server should return something conceptually like:

```text
module.status = unavailable
```

Not HTTP 500 for the entire report.

---

# 21. Demo Fixture

Once the real APIs work, save **one excellent example**.

Example student profile:

```text
Property:
Newtown apartment

Anchors:
USYD            4×
Part-time work  3×
Gym             3×
Friends/Friday  1×
```

Preferences:

```text
Woolworths
Park
Vietnamese groceries / another reliably found preference
```

This gives the complete pitch story.

Never pretend a fixture is live if it is being used as fallback.

---

# 22. Repository Structure

Keep it boring:

```text
app/
  page.tsx

  analyse/
    page.tsx

  report/
    ...

  api/
    analyse/
      route.ts
    locations/
      route.ts

components/
  onboarding/
  report/
  map/

lib/
  domain/
    property.ts
    anchor.ts
    report.ts
    route.ts
    preference.ts

  providers/
    tfnsw/
      client.ts
      normalise.ts

    geoapify/
      client.ts
      normalise.ts

  analysis/
    routine-fit.ts
    weekly-burden.ts
    shadow-commute.ts
    time-lens.ts
    insights.ts

  mocks/
    report.ts

  demo/
    fixture.json
```

Avoid overengineering structures such as:

```text
services/
repositories/
controllers/
entities/
use-cases/
factories/
dependency-injection/
```

You have seven hours, not seven weeks.

---

# 23. Environment Variables

Likely:

```text
TFNSW_API_KEY=
GEOAPIFY_API_KEY=
NEXT_PUBLIC_MAPTILER_KEY=
```

Potential later:

```text
OPENAI_API_KEY=
```

Only if screenshot decoding is actually implemented.

Don't add it speculatively.

---

# 24. No Database

Do not install PostgreSQL for this prototype.

Use:

```text
React state
+
URL/session state if useful
+
localStorage optionally
```

You do not currently require:

- accounts;
- long-term persistence;
- collaboration;
- saved reports;
- large internal datasets.

A database earns essentially zero judging value at this stage.

---

# 25. No Authentication

Same reasoning.

The optimal demo flow is:

```text
Open app
→
Analyse property
```

Authentication would slow the user down and add risk without improving the core judging story.

---

# 26. Two-Developer Split

This is one of the most important delivery decisions.

## Developer A — Data / Intelligence

Own:

```text
domain contracts
TfNSW
routing normalisation
weekly calculations
Routine Fit
TimeLens
ShadowCommute
Geoapify
insight generation
/api/analyse
```

## Developer B — Product / UX

Own:

```text
onboarding
life-stage presets
property form
anchor editor
preference selector
report layout
charts/cards
map
loading/error states
responsive design
```

Both work against:

```text
AddressTruthReport
```

Developer B should begin using **mock report data**.

Do not wait for Developer A.

---

# 27. Exact 7-Hour Plan

## First 30 Minutes

### Both Together

Lock:

- domain contract;
- UI route;
- analysis request;
- sample `AddressTruthReport`;
- demo property/profile.

Create Jira tickets.

Then split.

**No debating typography yet.**

---

## Next 90 Minutes

### Developer A

Make this work:

```text
property
→ TfNSW
→ one anchor
→ real trip
→ RouteAnalysis
```

Then immediately extend to 3–4 anchors.

### Developer B

Build:

```text
property screen
→ preset selection
→ anchor form
→ loading
→ mock report
```

Create the full report skeleton using mock data.

### Checkpoint

Must have:

- real TfNSW output;
- working onboarding;
- report rendering from mock data.

If not, **stop all stretch work**.

---

## Integration Hour

Connect:

```text
frontend
→ /api/analyse
→ TfNSW
→ report
```

Implement:

- weekly burden;
- Routine Fit;
- deterministic insights.

Deploy it.

### Checkpoint

At this point you should already possess a valid hackathon submission.

Everything from here improves it.

---

## Intelligence Upgrade Hour

### Developer A

Build:

- TimeLens;
- ShadowCommute.

### Developer B

Build:

- polished LifeRadius;
- hero metrics;
- map.

Integrate immediately.

---

## Everyday Access Hour

### Developer A

Implement:

```text
Geoapify Places
→ nearest POIs
→ walking routing
→ AmenityResult
```

Use just:

- supermarket;
- healthcare/pharmacy;
- park;

first.

### Developer B

Build preference selection and report section.

Expose broader community/cultural preferences only where search quality works reliably.

---

## Product Polish Hour

Both:

- life-stage presets;
- strong loading UI;
- error handling;
- empty states;
- responsive layout;
- deterministic verdict;
- clear data-source labels;
- report visual hierarchy.

No new providers.

---

## Demo Hardening Hour

Do not build another major feature.

Do:

- save demo fixture;
- API failure fallback;
- deploy;
- test incognito;
- test phone width;
- test a new property;
- test the known demo;
- test missing optional modules;
- test refresh;
- test production API keys;
- fix console/server errors.

At the end:

# Feature freeze.

You should now have a polished prototype while retaining substantial remaining hackathon time as buffer.

---

# 28. Jira Structure

Use only five epics.

## Epic 1 — Core Domain & Analysis

### P0

- Define AddressTruth report contract
- Implement weekly travel calculation
- Implement Routine Fit
- Generate deterministic insights

---

## Epic 2 — Transport Intelligence

### P0

- Integrate TfNSW Stop Finder
- Integrate TfNSW Trip Planner
- Normalise route response

### P1

- Implement TimeLens
- Implement ShadowCommute

---

## Epic 3 — Lifestyle Access

### P1

- Integrate Geoapify Places
- Implement amenity walking route
- Build preference selector
- Build Everyday Access report

### P2

- Expand community/culture preferences

---

## Epic 4 — Product Experience

### P0

- Property form
- Life-stage presets
- Anchor editor
- Report shell
- LifeRadius UI
- Hero summary

### P1

- Map
- TimeLens UI
- ShadowCommute UI
- Everyday Access UI

---

## Epic 5 — Demo Reliability

### P0

- Production deployment
- Graceful API failures
- Demo fixture
- Responsive QA
- Full demo rehearsal

### P2

- Screenshot decoder
- Safety Context
- Property comparison

---

# 29. Explicitly Do NOT Do Before Feature Freeze

Even if tempting:

- BOCSAR integration;
- screenshots;
- listing URL parsing;
- property comparison;
- AI-generated recommendations;
- user accounts;
- database;
- fancy map routes;
- 15 POI categories;
- complex animations;
- machine learning;
- live disruption modelling.

The current core already provides:

> **real external data + personalisation + multiple algorithms + geospatial UX + explainable analytics + multiple API integrations + a strong theme narrative.**

That's enough technical substance for a strong prototype.

---

# 30. After the 7-Hour Prototype

Use the remaining hackathon time intelligently.

## Later Tonight

Potential stretch order:

1. screenshot property extraction;
2. culture/community search improvements;
3. BOCSAR Safety Context;
4. richer TimeLens;
5. route polylines.

## Tomorrow Morning

Do **not** reserve tomorrow morning for major implementation.

Use it for:

- pitch;
- video;
- README;
- Devpost;
- screenshots;
- judges' narrative;
- backup recording;
- final deployment test;
- submission well before noon.

---

# 31. Pitch Architecture

The demo should follow a **human story**, not the technical architecture.

Example:

> I'm a university student. I go to campus four times a week, work three shifts, go to the gym, and usually see friends on Friday night.
>
> This apartment looks perfect on the listing.
>
> But what will my life actually look like here?

Enter it.

Analyse.

Then reveal:

> AddressTruth estimates **9.2 hours of weekly travel**.

Show LifeRadius.

> University looks fine—but getting to work in the evening is much worse.

Show TimeLens.

> And that commute relies on a transfer with a poor fallback.

Show ShadowCommute.

> My preferred supermarket and pharmacy are close, though.

Show Everyday Access.

Then:

> Rental sites tell me the property has two bedrooms and a balcony.
>
> **AddressTruth tells me whether I can actually live my life here.**

Strong finish.

---

# 32. Theme Framing

Lead with Challenge **#4**:

> **What tools can we use to ensure accessibility to our essential resources?**

The “blocks” of someone's world aren't just buildings.

They are:

```text
home
education
work
food
healthcare
community
relationships
culture
recreation
```

AddressTruth asks:

> **Does this address connect you to those blocks?**

The cultural/community preference layer gives a subtle secondary connection to the culture challenge without forcing it.

---

# 33. Strongest Judging Signals

## Implementation

- real TfNSW integration;
- real POI integration;
- deterministic analysis engine;
- timed routing;
- modular provider architecture;
- graceful failure.

## Idea

The personalisation is the innovation:

> Not “Is Newtown good?”

but:

> **“Is this exact address good for *my particular life*?”**

## Design

Make the report visually excellent.

Don't overload the user with settings.

## Pitch

One renter.

One property.

One story.

One reveal.

---

# 34. The Architecture Decision to Protect Above Everything Else

Build this first:

```text
AddressTruthReport
```

The data developer produces it.

The UI developer consumes it.

Everything else hangs off that contract.

That prevents the frontend from depending on provider-specific structures such as:

```text
journeys[0].legs[2].interchange...
```

and allows:

```text
TfNSW
Geoapify
BOCSAR
Vision
```

to be replaced or removed without touching most of the app.

For a two-person hackathon:

> **The AddressTruthReport interface is the team boundary.**

---

# 35. Final Scope Lock

## P0 — Must Exist Tonight

- one property;
- manual property input;
- life-stage preset;
- 3–4 personal anchors;
- visit frequency;
- user travel tolerance;
- real TfNSW routes;
- LifeRadius;
- weekly travel burden;
- Routine Fit;
- deterministic insights;
- report;
- deployed app.

## P1 — Target Within Seven Hours

- TimeLens;
- ShadowCommute;
- map;
- 2–3 Everyday Access preferences;
- polished verdict;
- graceful fallback.

## P1.5 — Do If Surprisingly Fast

- Community & Culture Access using the same preference engine.

## P2 — After Prototype Is Frozen

- Safety Context;
- screenshot property decoder;
- richer lifestyle discovery;
- route visualisations.

## Post-Hackathon

- property comparison;
- listing APIs;
- saved renter profiles;
- full crime-context engine;
- planning/noise/flood/internet/parking;
- multilingual accessibility;
- mobility/accessibility routing;
- sophisticated community discovery.

---

# Immediate Next Move

Do not design anything else before establishing the shared contract.

The two developers should spend the first ~30 minutes locking:

1. `AddressTruthReport`
2. related domain interfaces
3. one representative mock report

Then split:

## Developer A

```text
property
→ TfNSW
→ RouteAnalysis
```

## Developer B

```text
onboarding
→ mock AddressTruthReport
→ polished report UI
```

When those branches meet, the project has its technical spine.

The goal is to create something **ambitious, technically credible, beautiful, and genuinely working within seven hours**, while leaving most of the remaining hackathon time available to turn a good prototype into an excellent submission.

---

# Core Product Rule

> **AddressTruth does not try to decide how everybody should live. It asks what matters to this renter, then measures how well this exact address connects them to the blocks that make up their life.**
