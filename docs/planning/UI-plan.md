# AddressTruth UI/UX Blueprint

## Summary

Create `docs/planning/AddressTruth-UI-Plan.md` as the cohesive design source of truth for the hackathon UI.

The document will acknowledge that Jira already defines functional UI work—primarily AN-3 and AN-18 through AN-25—but lacks visual direction, screen composition, interaction details, responsive rules, and accessibility standards. It will refine those tickets without changing Jira or expanding the MVP.

## UI Plan Contents

- Define the product experience around one state-driven journey: introduction → property and life-anchor setup → analysis/loading → “Your Life at This Address” report → edit and re-analyse.
- Use an editorial-cartography direction:
  - Newsreader for editorial display text; existing Geist Sans for interface copy and Geist Mono for metrics.
  - Parchment `#F5F1E8`, paper `#FFFDF8`, ink `#17231D`, moss `#426957`, transit coral `#D96B48`, muted blue `#6F9DA3`, amber `#B77A2A`.
  - Fine map-grid lines, coordinate/index labels, restrained route motifs, tactile cards, generous whitespace, and minimal purposeful motion.
  - Avoid generic SaaS gradients, glassmorphism, excessive rounded cards, gamified scores, and unsupported safety or reliability claims.
- Specify the responsive screen composition:
  - Branded masthead and concise “Know how this address fits your life” introduction.
  - Progressive property and 1–4 anchor editor with categories, visit frequency, travel tolerance, inline validation, and optional TimeLens controls.
  - Credible loading sequence describing routing and personalised analysis without fake percentage progress.
  - Report header with address, generation/data status, edit action, Routine Fit, weekly travel burden, and analysed-destination count.
  - LifeRadius journey cards showing duration, frequency, weekly burden, walking, transfers, modes, and tolerance outcome.
  - Compact TimeLens comparison, evidence-based ShadowCommute panel, deterministic insights, partial-failure notices, and optional supporting map.
  - Provenance and approximation notes explaining live transport data, estimated return travel, heuristics, and unavailable modules.
- Define component anatomy, hierarchy, spacing, icon treatment, copy voice, button/input states, focus treatments, skeletons, empty/error/partial-success states, and desktop/tablet/mobile behavior.
- Include a field-to-UI crosswalk for the existing `AnalysisRequest` and `AddressTruthReport`; no provider-specific data or new public schema will be introduced.
- Include a Jira crosswalk covering AN-9, AN-10, and AN-18–AN-25, with P0/P1 sequencing and explicit dependencies.
- End with an implementation checklist and visual definition of done suitable for direct frontend execution.

## Verification

Validate the completed Markdown plan against these scenarios:

- First-time user can understand the value proposition and submit one valid property/anchor analysis.
- Four anchors remain usable on mobile without an overwhelming form.
- Full, partial, and fully failed transport results have distinct honest presentation.
- TimeLens, ShadowCommute, amenities, and map can each be omitted without leaving broken spacing or empty shells.
- Routine Fit never appears as an unexplained or AI-generated score.
- Keyboard navigation, visible focus, semantic headings, labels, reduced motion, and WCAG AA colour contrast are explicitly covered.
- The primary report story remains understandable without colour, animation, map access, or optional modules.
- Every planned element maps to current repo capabilities, documented project goals, or an identified Jira ticket.

## Assumptions

- The artifact is a design and implementation blueprint, not a Jira rewrite.
- The hackathon MVP remains one property, up to four anchors, no authentication, no persistence, and no comparison workflow.
- Existing Tailwind CSS v4 and Next.js architecture are retained.
- The map remains a supporting P1 visual; core report comprehension cannot depend on it.
- Existing uncommitted analysis work is preserved and treated as evolving backend contract state.
