import Link from "next/link";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

const productSignals = [
  ["01", "Routine-first", "Judge the address against the places that already shape your week."],
  ["02", "Evidence-led", "See journey times, weekly burden and tolerance outcomes without mystery scoring."],
  ["03", "Honest by design", "Live, partial and saved-demo results are clearly distinguished."],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen text-ink">
      <header className="border-b border-border/90 bg-parchment/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full border border-moss/40 bg-paper">
              <span className="h-2.5 w-2.5 rounded-full bg-transit-coral" />
            </span>
            <span>
              <span className="block font-mono text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted-ink">Address intelligence</span>
              <span className="block text-sm font-semibold tracking-[-0.02em] transition-colors group-hover:text-moss">Decoded</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-ink">Sydney rental decision support</span>
            <a href="#analyse" className="text-sm font-semibold underline decoration-border underline-offset-4 hover:decoration-moss">Analyse an address</a>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-moss">Rental intelligence for real life</span>
              <span className="h-px w-14 bg-moss/50" aria-hidden="true" />
            </div>

            <h1 className="font-editorial max-w-4xl text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[0.84] tracking-[-0.055em]">
              Know how an address
              <span className="block italic text-moss">fits your life.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-7 text-muted-ink sm:text-lg sm:leading-8">
              A rental can look perfect on paper and still cost you hours every week. Decoded turns your regular destinations into a clear picture of commute burden, routine fit and everyday trade-offs before you sign.
            </p>
          </div>

          <div className="lg:pb-2">
            <div className="route-rule h-5" aria-hidden="true" />
            <dl className="mt-5 grid grid-cols-3 gap-4 border-y border-border py-5">
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-ink">Input</dt>
                <dd className="mt-2 text-sm font-semibold">1 property</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-ink">Routine</dt>
                <dd className="mt-2 text-sm font-semibold">Up to 4 places</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-ink">Output</dt>
                <dd className="mt-2 text-sm font-semibold">Explainable report</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-muted-ink">
              Built to support a decision, not manufacture certainty. Approximation, unavailable modules and saved demo data remain visible in the interface.
            </p>
          </div>
        </div>
      </section>

      <section id="analyse" className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-12 lg:px-10 lg:pb-28">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="border-t border-ink pt-5">
            <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-ink">How to read Decoded</p>
            <div className="mt-6 space-y-0">
              {productSignals.map(([index, title, copy]) => (
                <div key={index} className="grid grid-cols-[2.25rem_1fr] gap-3 border-t border-border py-5 first:border-t-0 first:pt-0">
                  <span className="font-mono text-xs text-moss">{index}</span>
                  <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-ink">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="surface-paper border border-border bg-paper/95">
          <OnboardingFlow />
        </div>
      </section>

      <footer className="border-t border-border bg-paper/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-7 text-xs leading-5 text-muted-ink sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>Decoded · address intelligence for pre-lease decisions.</p>
          <p>Route outputs may be approximate and depend on provider availability.</p>
        </div>
      </footer>
    </main>
  );
}
