import Link from "next/link";
import { MotionStory } from "@/components/marketing/motion-story";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { CheckIcon, ClockIcon, RouteIcon, SparkIcon, ArrowRightIcon } from "@/components/ui/icons";

export default function Home() {
  return (
    <main className="w-full max-w-full overflow-x-hidden bg-parchment text-ink">
      <header className="border-b border-border/90 bg-parchment/92 backdrop-blur-sm">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[94rem] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3" aria-label="Decoded home">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full border border-moss/40 bg-paper shadow-[0_5px_16px_rgba(23,35,29,0.04)]"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-transit-coral transition-transform duration-200 group-hover:scale-125" />
            </span>
            <span>
              <span className="block font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-ink">
                Rental intelligence for real life
              </span>
              <span className="mt-0.5 block text-sm font-semibold tracking-[-0.02em] transition-colors group-hover:text-moss">
                Decoded
              </span>
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="flex items-center gap-4">
          <a
            href="#analyse"
            className="button-primary desktop-only min-h-11 items-center gap-4 px-4 py-2 text-sm"
          >
            <span>Start with the address</span>
            <ArrowRightIcon className="h-4 w-4" />
          </a>
          <a href="#analyse" className="button-primary mobile-only min-h-11 items-center gap-3 px-4 py-2 text-sm">Start <ArrowRightIcon className="h-4 w-4" /></a>
          </nav>
        </div>
      </header>

      <section
        id="analyse"
        className="mx-auto grid w-full max-w-[94rem] gap-10 px-5 py-10 sm:px-8 sm:py-12 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[minmax(0,1.12fr)_minmax(430px,0.88fr)] lg:items-center lg:gap-14 lg:px-10 lg:py-10 xl:gap-20"
      >
        <div className="relative">
          <div className="mb-6 flex items-center gap-3 sm:mb-7">
            <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-moss">
              Before the lease becomes your life
            </span>
            <span className="h-px w-12 bg-moss/45 sm:w-16" aria-hidden="true" />
          </div>

          <h1 className="hero-title font-editorial max-w-4xl text-[clamp(3.4rem,6.1vw,6.1rem)] font-medium leading-[0.98] tracking-[-0.045em]">
            Decode your life
            <span className="hero-gradient-text mt-[5px] block italic">before you sign.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-7 text-muted-ink sm:text-lg sm:leading-8 lg:max-w-2xl">
            A rental is more than a bedroom count and weekly price. Decoded
            checks how an address fits the places you actually need to be,
            every week.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-[auto_1fr] gap-4 border-y border-border py-5 sm:mt-9">
            <div className="pt-1" aria-hidden="true">
              <span className="block h-2.5 w-2.5 rounded-full bg-transit-coral" />
              <span className="mx-auto mt-1 block h-10 w-px bg-border" />
              <span className="mx-auto block h-2 w-2 rounded-full border border-moss bg-parchment" />
            </div>
            <p className="max-w-lg text-sm leading-6 text-muted-ink">
              Add your university, work, gym, partner or other regular
              destinations. We&apos;ll turn the commute into a weekly-life
              picture you can judge before moving.
            </p>
          </div>
        </div>

        <div className="relative lg:translate-y-[-0.25rem]">
          <div className="pointer-events-none absolute -left-7 top-12 hidden items-center lg:flex" aria-hidden="true">
            <span className="h-px w-7 bg-moss/60" />
            <span className="h-2.5 w-2.5 rounded-full border-2 border-moss bg-parchment" />
          </div>

          <div className="surface-paper overflow-hidden border border-border bg-paper/96 ring-1 ring-ink/[0.015]">
            <OnboardingFlow />
          </div>

          <div className="mt-4 flex items-center justify-between gap-5 px-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted-ink">
            <span>Potential property</span>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span>Every week</span>
          </div>
        </div>
      </section>

      <section id="why" className="border-y border-border bg-paper px-5 py-24 sm:px-8 md:py-32 lg:px-10">
        <div className="mx-auto w-full max-w-[94rem]">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" aria-hidden="true" />A better moving decision</p>
              <h2 className="font-editorial mt-5 max-w-md text-5xl leading-[0.95] tracking-[-0.05em] sm:text-6xl">Make the invisible parts of a move visible.</h2>
            </div>
            <div>
              <p className="max-w-2xl text-xl leading-8 tracking-[-0.025em] text-muted-ink sm:text-2xl sm:leading-9">The best address is not always the one with the lowest rent or the shortest commute. It is the one that lets your real week keep its shape.</p>
              <div className="mt-10 grid grid-flow-dense grid-cols-2 gap-3 lg:grid-cols-4 lg:grid-rows-2">
                <article className="group relative col-span-2 row-span-2 min-h-64 overflow-hidden border border-ink bg-ink p-6 text-paper transition-transform duration-500 hover:-translate-y-1 sm:p-8">
                  <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full border border-paper/20 transition-transform duration-700 ease-out group-hover:scale-110" aria-hidden="true" />
                  <RouteIcon className="relative h-7 w-7 text-transit-coral" />
                  <h3 className="relative mt-24 max-w-md font-editorial text-3xl leading-[1.02] tracking-[-0.04em] sm:text-4xl">Your week, drawn from the places you actually go.</h3>
                  <p className="relative mt-4 max-w-md text-sm leading-6 text-[#d8e1dc]">Add a rental and the anchors that make up your life. The report follows the connections between them.</p>
                </article>
                <article className="group col-span-2 min-h-44 overflow-hidden border border-border bg-[#e9f0f1] p-6 transition-transform duration-500 hover:-translate-y-1 sm:p-8">
                  <ClockIcon className="h-6 w-6 text-muted-blue transition-transform duration-700 group-hover:scale-105" />
                  <h3 className="mt-10 font-editorial text-2xl leading-[1.02] tracking-[-0.04em] sm:text-3xl">See the time, not just the distance.</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-muted-ink">Morning and evening routes reveal the shape of a day before you move in.</p>
                </article>
                <article className="group min-h-44 overflow-hidden border border-border bg-[#e9efec] p-5 transition-transform duration-500 hover:-translate-y-1 sm:p-6">
                  <CheckIcon className="h-6 w-6 text-moss transition-transform duration-700 group-hover:scale-105" />
                  <h3 className="mt-10 font-editorial text-2xl leading-[1.02] tracking-[-0.04em]">Your limit sets the lens.</h3>
                </article>
                <article className="group min-h-44 overflow-hidden border border-border bg-[#f4e8df] p-5 transition-transform duration-500 hover:-translate-y-1 sm:p-6">
                  <SparkIcon className="h-6 w-6 text-transit-coral transition-transform duration-700 group-hover:scale-105" />
                  <h3 className="mt-10 font-editorial text-2xl leading-[1.02] tracking-[-0.04em]">Evidence over theatre.</h3>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MotionStory />

      <footer className="bg-ink text-paper">
        <div className="mx-auto w-full max-w-[94rem] px-5 py-24 sm:px-8 md:py-32 lg:px-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#b8c9c0]">Ready when you are</p>
              <h2 className="font-editorial mt-5 max-w-3xl text-6xl leading-[0.9] tracking-[-0.06em] sm:text-8xl">Move with the<br /><span className="text-transit-coral">whole picture.</span></h2>
            </div>
            <a href="#analyse" className="button-inverse button-large w-full sm:w-auto">Decode an address <ArrowRightIcon className="h-5 w-5" /></a>
          </div>
          <div className="mt-20 flex flex-col gap-3 border-t border-white/20 pt-5 text-xs leading-5 text-[#b8c9c0] sm:flex-row sm:items-center sm:justify-between"><p><strong className="font-semibold text-paper">Decoded</strong> — rental intelligence shaped around real lives.</p><p className="font-mono uppercase tracking-[0.12em]">Sydney · TfNSW-backed prototype</p></div>
        </div>
      </footer>
    </main>
  );
}
