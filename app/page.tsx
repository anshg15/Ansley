import Link from "next/link";

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

          <section
            aria-labelledby="property-heading"
            className="border border-border bg-paper p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-6 border-b border-border pb-5">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-ink">
                  Step 01
                </p>
                <h2
                  id="property-heading"
                  className="mt-2 text-2xl font-semibold tracking-[-0.03em]"
                >
                  Start with the address
                </h2>
              </div>

              <span
                aria-hidden="true"
                className="font-mono text-3xl leading-none text-muted-blue"
              >
                ⌖
              </span>
            </div>

            <form className="mt-7">
              <label
                htmlFor="property-address"
                className="block text-sm font-medium"
              >
                Potential property
              </label>

              <p
                id="property-address-help"
                className="mt-1 text-sm leading-6 text-muted-ink"
              >
                Enter the rental address you&apos;re considering.
              </p>

              <input
                id="property-address"
                name="propertyAddress"
                type="text"
                autoComplete="street-address"
                aria-describedby="property-address-help"
                placeholder="e.g. 42 King Street, Newtown NSW"
                className="mt-4 w-full border border-border bg-paper px-4 py-3.5 text-base text-ink outline-none transition-colors placeholder:text-muted-ink/60 focus:border-moss"
              />

              <button
                type="button"
                className="mt-6 flex w-full items-center justify-between bg-ink px-5 py-4 text-left text-sm font-semibold text-paper transition-opacity hover:opacity-90"
              >
                <span>Continue to your routine</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-5">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-ink">
                  Analyse
                </p>
                <p className="mt-1 text-sm font-medium">Real routes</p>
              </div>

              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-ink">
                  Compare
                </p>
                <p className="mt-1 text-sm font-medium">Your tolerance</p>
              </div>

              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-ink">
                  Reveal
                </p>
                <p className="mt-1 text-sm font-medium">Weekly burden</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
