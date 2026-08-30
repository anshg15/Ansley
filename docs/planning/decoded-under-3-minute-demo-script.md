# Decoded — under-three-minute showcase demo

**Target:** approximately 2 minutes 35–45 seconds of spoken demo, leaving buffer for clicks and live loading.

**Core story:** A rental can look good on paper while making the renter's actual week difficult. Decoded tests a potential home against the places that shape that person's life and turns real transport journeys into a clear, explainable decision.

## Before recording

- Open Decoded on the address-entry screen.
- Keep **Try the saved demo** available as the backup.
- For the live walkthrough, use:
  - Potential property: `42 King Street, Newtown NSW`
  - University: `University of Sydney, Camperdown NSW` — 4 visits/week — 30-minute limit
  - City work: `Martin Place, Sydney NSW` — 3 visits/week — 40-minute limit
- The maximum travel time is a **one-way total journey limit**, including walking and public transport.
- Live TfNSW journey times can change. Always read the values currently on screen rather than promising a fixed score.
- Use two destinations in the recorded demo. The product supports up to four, but adding more does not strengthen the three-minute story.
- Pause briefly when the report appears. The report reveal is the payoff.

---

## Run of show

### 0:00–0:18 — The problem

**Show:** Landing screen with the Decoded headline visible.

**Say:**

> Rental listings tell you the rent, bedrooms and location. But they do not tell you whether that address actually works for your life.
>
> A place can look perfect on paper, then leave you spending hours every week getting to university, work, the gym, or the people you see regularly.

---

### 0:18–0:35 — Introduce Decoded

**Show:** Enter the potential property address.

**Say:**

> Decoded helps renters test that before signing. You enter a potential home, then the destinations that shape your actual week.
>
> Instead of asking whether a suburb is generally good, Decoded asks whether this exact address works for this person.

---

### 0:35–0:58 — Build the personal routine

**Show:** Add University and City work. Point to visits per week and maximum one-way travel time.

**Say:**

> For each destination, I add how often I go there and the longest one-way journey I would personally accept.
>
> So this is not a generic suburb score. Two people can analyse the same property and get completely different answers because their lives are different.

---

### 0:58–1:20 — Reveal the result

**Show:** Review the routine, click analyse, then pause when the report appears.

**Say:**

> Decoded checks those journeys using live Transport for NSW data, then turns them into a personalised decision report.
>
> The headline result is Routine Fit: the percentage of your regular weekly visits that fall inside the travel limits you chose.

**Presenter:** Read the **actual Routine Fit shown on screen**. Do not script a fixed live percentage.

---

### 1:20–1:45 — Make the score trustworthy

**Show:** Routine Fit, **Why this score**, and weekly travel summary.

**Say:**

> And it is deliberately explainable. A destination you visit five times a week matters more than one you visit once, so Routine Fit is frequency-weighted rather than an arbitrary black-box score.
>
> We also calculate the estimated return-travel burden across the whole week, so you can see the cost of an address in time, not just distance.

---

### 1:45–2:05 — Show where the week goes

**Show:** **Where your week goes** and the individual journey cards.

**Say:**

> Here we can see exactly where that time goes. Each journey shows the one-way duration, walking, transfers and whether it fits the renter's own limit.
>
> Instead of discovering after moving that one regular trip dominates your week, the trade-off is visible before you sign.

---

### 2:05–2:25 — TimeLens and ShadowCommute

**Show:** TimeLens and ShadowCommute.

**Say:**

> We also avoid pretending that one fastest route tells the whole story. TimeLens compares representative travel periods, while ShadowCommute highlights route complexity and resilience.
>
> These are transparent signals, not predictions. We show what the available transport evidence supports and clearly label anything unavailable.

---

### 2:25–2:43 — Technical credibility

**Show:** Stay on the report. There is no need to switch to code.

**Say:**

> Underneath, TfNSW responses are normalised server-side into our own domain model, and the report is generated through deterministic calculations rather than invented AI scoring.
>
> We also preserve successful journeys when individual routes fail instead of hiding uncertainty.

---

### 2:43–2:55 — Close on the decision

**Show:** Return to the main verdict or report headline.

**Say:**

> Decoded turns a rental address into a question that is actually personal:
>
> **Does this home fit the life I already have?**
>
> Decode your life before you sign.

---

## Saved-demo backup

If the live TfNSW request is slow or unavailable, switch immediately to **Try the saved demo**.

**Say:**

> To keep the walkthrough reliable, I'm switching to a saved TfNSW analysis. It is explicitly labelled as saved data rather than live data, but it runs through the same Decoded report experience.

Then continue from the report section of the normal script.

The saved snapshot currently demonstrates:

- **67% Routine Fit**
- **7h 8m** estimated weekly return travel
- **3 destinations analysed**
- TimeLens
- ShadowCommute
- weekly travel burden
- deterministic insights

Do not apologise for using the fallback. The explicit source labelling demonstrates that Decoded distinguishes live data from saved evidence rather than pretending a failed provider call succeeded.

---

## Judging points to make visible

| Judging signal | What Decoded demonstrates |
| --- | --- |
| **Problem / idea** | Rental listings describe the property but not whether it fits the renter's actual weekly routine. |
| **Personalisation** | The renter chooses the destinations, visit frequency and travel limits that matter to them. |
| **Implementation** | Live TfNSW journeys are normalised server-side before entering Decoded's provider-independent domain and analysis layers. |
| **Explainability** | Routine Fit is deterministic, frequency-weighted and compared directly against user-defined limits. |
| **Depth** | Weekly burden, TimeLens, ShadowCommute and route-level evidence add context without hiding the simple headline answer. |
| **Reliability** | Partial failures preserve successful journeys, unavailable modules are labelled honestly, and a saved demo is never presented as live data. |
| **Design** | The report progressively reveals detail while keeping Routine Fit and the weekly-life trade-off visually dominant. |
| **Impact** | A renter can identify an unsustainable routine before signing a lease rather than after moving in. |

---

## Presenter reminders

- Do not spend the video typing three or four destinations. Two is enough to prove personalisation.
- Have addresses ready to paste if necessary.
- Read live journey values from the screen.
- Do not claim groceries, listing ingestion or other deferred features.
- Do not describe ShadowCommute as disruption prediction.
- Do not describe Decoded as deciding whether a suburb is objectively good or safe.
- If technical implementation comes up, explain:
  - external provider data is normalised server-side;
  - the analysis layer operates on Decoded-owned domain models;
  - Routine Fit is deterministic and frequency-weighted;
  - provider failures are represented explicitly.
- Finish on the renter's decision, not the technology:

> **Decoded helps people choose a home that fits the life they already have.**
