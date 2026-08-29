import Link from "next/link";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default function Home() {
  return (
    <main className="min-h-screen bg-parchment text-ink">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="font-mono text-sm font-semibold uppercase tracking-[0.18em]"
          >
            Decoded
          </Link>

          <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-muted-ink sm:block">
            Rental intelligence for real life
          </span>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-center">
          <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-moss">
            Before the lease becomes your life
          </p>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Decode your life
            <br />
            before you sign.
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-ink sm:text-lg sm:leading-8">
            A rental is more than a bedroom count and weekly price. Decoded
            checks how an address fits the places you actually need to be,
            every week.
          </p>

          <div className="mt-10 flex max-w-xl items-start gap-4 border-t border-border pt-5">
            <span
              aria-hidden="true"
              className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-transit-coral"
            />
            <p className="text-sm leading-6 text-muted-ink">
              Add your university, work, gym, partner or other regular
              destinations. We&apos;ll turn the commute into a weekly-life
              picture you can judge before moving.
            </p>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-6 top-10 hidden h-px w-12 bg-moss lg:block"
          />

          <OnboardingFlow />
        </div>
      </section>
    </main>
  );
}
