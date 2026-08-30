# Decoded — under-three-minute showcase demo

**Target length:** 2 minutes 35–55 seconds.
**Story:** A rental can look good on paper but still make a person's actual week difficult. Decoded turns a property address and a person's regular places into a clear, evidence-led decision.

This script is designed for the latest UI-improve experience: the calm editorial address-and-routine flow, live TfNSW route analysis, Routine Fit, weekly-travel summary, the **Why this score** explanation, the **Where your week goes** chart, TimeLens, and ShadowCommute.

## Before you start

- Open the app at the address-entry screen and keep the saved demo available as a one-click backup.
- For a live run, use a normal, fully written address and add one to three destinations. A dependable example is:
  - Potential property: `1 King Street, Newtown NSW 2042`
  - University: `University of Sydney, Camperdown NSW` — 4 visits/week — 30 minutes
  - City work: `Martin Place, Sydney NSW` — 3 visits/week — 40 minutes
- The maximum is a **one-way total travel-time limit**, including public transport and walking. It is not walking-only and is not a return-trip limit.
- Live journey durations may change. When presenting live data, read the numbers currently on screen instead of promising a fixed score. If the provider is slow or unavailable, use **Try the saved demo**; its results are explicitly labelled as a saved snapshot, not live data.
- Speak at a calm pace and pause briefly after the main report appears. The core script is about 360 spoken words: roughly 2 minutes 25 seconds at a natural pace, leaving useful room for clicks and pauses while staying under three minutes.

## Run of show

### 0:00–0:18 — Start with the human problem

**Show:** The address-entry screen.

**Say:**

> Rental listings tell us the rent and bedrooms. But before signing a lease, the real question is: can I actually live my life from this address? Will university, work and essentials still be reachable every week?

### 0:18–0:38 — Introduce Decoded

**Show:** Enter the potential property address.

**Say:**

> This is Decoded. It starts with a potential home, then the places that shape *your* week. Instead of asking whether a suburb is generally good, it asks whether this exact address works for this person.

### 0:38–1:03 — Make the input feel personal and easy

**Show:** Add University and City work. Point out the visits-per-week and maximum-travel-time fields; add a gym if time permits.

**Say:**

> Here I add university four times a week and city work three times a week. For each place, I choose frequency and the longest one-way journey I would consider reasonable. The helper text makes it clear that this is the *total* journey, including walking and public transport. The input stays small, personal and realistic.

### 1:03–1:30 — Reveal a useful, trustworthy answer

**Show:** Click analyse, then let the report settle on the summary cards.

**Say:**

> Decoded checks the journeys using TfNSW transport data and turns them into an answer a renter can act on. Routine Fit is not a mysterious score: it is the share of regular weekly visits within the limits chosen. We also show estimated weekly return-travel time and the number of destinations assessed.

### 1:30–1:52 — Explain *why* the result is what it is

**Show:** The **Why this score** card and **Where your week goes** chart.

**Say:**

> The explanation makes the result auditable: how many visits fit, weighted by how often each place matters. This chart shows where the time goes. The largest bar is the journey quietly taking the biggest share of the week, so the trade-off is visible before moving.

### 1:52–2:12 — Demonstrate depth without losing clarity

**Show:** Scroll to TimeLens and ShadowCommute.

**Say:**

> We go beyond a single fastest route. TimeLens compares representative travel times, while ShadowCommute surfaces route fragility—where the routine can become harder if the usual option is disrupted. The first answer remains simple.

### 2:12–2:38 — Close on impact and judging value

**Show:** Return to the verdict or report headline.

**Say:**

> Decoded supports a high-stakes rental decision with a person's real routine in mind. It connects home, education, work, health and community to one address using real transport data and transparent calculations. Rather than discovering an unsustainable commute after signing, a renter can see the trade-offs early and choose a home that supports their life.

## If you use the saved-demo backup

Keep the same script, but replace the live-data sentence at 1:03 with this:

> To make the walkthrough reliable, I am using a saved TfNSW demo snapshot. It is clearly labelled as saved data; the product never presents it as a live route. The same report shows a 67% Routine Fit, 7 hours 8 minutes of estimated weekly return travel, and three destinations analysed.

That transparency is a strength: the demo still shows the complete experience while being honest about its data source.

## How this meets the judging criteria

| Criterion | Evidence to make explicit in the demo |
| --- | --- |
| **Idea — 15 points** | A realistic, high-stakes problem: listings omit whether a home works for the renter's actual life. Decoded makes that decision personal through places, visit frequency and chosen limits. |
| **Implementation — 30 points** | TfNSW journey data is normalised server-side into deterministic, frequency-weighted scores, weekly return-travel estimates and route-level insights. The live run—and honest saved-data fallback—demonstrates a functional end-to-end product. |
| **Design — 15 points** | The refined emerald editorial identity, clear two-step flow, helper copy, concise report cards and progressive detail make an information-heavy decision understandable and accessible. |
| **Pitch — 10 points** | Open on the renter's human problem, prove the answer with a live personal routine, explain the trade-off, then end on the life impact—not the technology. |

## Presenter reminders

- Do not spend time typing on camera if it feels slow—have the form prefilled, then briefly change one field to show that it is personalised.
- Read the actual report values aloud. Do not claim a score or journey time you cannot see.
- Avoid technical implementation jargon unless asked. If a judge asks, explain that journeys are normalised server-side and the score is a deterministic, frequency-weighted comparison against the renter's stated limits.
- Finish on the decision, not the technology: **"Decoded helps people choose a home that fits the life they already have."**
