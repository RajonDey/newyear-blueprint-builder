/* Hallmark · design-system: design.md · designed-as-app
 * Guide statement — full-width amber band, centred for balance.
 */

export function Guide() {
  return (
    <section className="border-y border-amber/20 bg-amber-wash">
      <div className="container py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] tracking-tight leading-[1.12] text-foreground">
            YearInReview is the calm system between your ambition and your
            week.
          </h2>
          <p className="text-muted-foreground mt-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Not another productivity dashboard. A guided yearly practice for
            thoughtful people who want clarity, not noise — built around a
            single loop that turns intentions into habits, and habits into
            proof.
          </p>
        </div>
      </div>
    </section>
  )
}
