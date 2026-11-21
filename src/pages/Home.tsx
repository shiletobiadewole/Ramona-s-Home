import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { PropertyCard } from '../components/PropertyCard';
import {
  CATEGORY_OVERVIEWS,
  INTERIOR_DETAIL_IMAGE,
  PROPERTY_PORTFOLIO,
} from '../data/properties';

export function Home() {
  const featuredStudies = PROPERTY_PORTFOLIO.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header transparentOverHero />

      <main className="flex-1">
        <Hero />

        {/* Section 2: Brand Introduction (Asymmetrical Editorial Layout) */}
        <section
          id="about"
          aria-labelledby="about-heading"
          className="py-20 sm:py-28 lg:py-32 bg-[#FDFAF0]"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-4xl mb-14 sm:mb-20">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-4">
                About Ramona&apos;s Home
              </p>
              <h2
                id="about-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.02em] leading-[1.15] text-[#151513]"
              >
                Residential architecture built around human rhythm, natural light, and
                quiet longevity.
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-7">
                <ArchitecturalImage
                  src={INTERIOR_DETAIL_IMAGE.src}
                  alt={INTERIOR_DETAIL_IMAGE.alt}
                  className="aspect-[4/3] w-full"
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between gap-10">
                <div className="space-y-5 text-base leading-relaxed text-[#534F46]">
                  <p>
                    Ramona&apos;s Home curates and develops contemporary residential
                    spaces for people seeking more thoughtful ways to live—from
                    multi-residence urban plexes to serene garden suites and adaptable
                    movable homes.
                  </p>
                  <p>
                    Every space prioritizes honest materials, calm spatial proportions,
                    and effortless indoor-outdoor flow so each home feels grounded from
                    the moment you step inside.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-6">
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#57482D] hover:text-[#423620] transition-colors"
                    >
                      Read Our Story
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/architecture"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#151513] hover:text-[#57482D] transition-colors"
                    >
                      Architecture &amp; Craft
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                <div className="hidden sm:block max-w-xs lg:ml-auto w-full">
                  <ArchitecturalImage
                    src={CATEGORY_OVERVIEWS[1].image.src}
                    alt={CATEGORY_OVERVIEWS[1].image.alt}
                    className="aspect-[4/3] w-full border border-[#B6AF9D]/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Centered Editorial Statement */}
        <section
          aria-label="Architectural philosophy"
          className="py-20 sm:py-28 bg-[#FCF0D8] border-y border-[#B6AF9D]/50"
        >
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-[-0.02em] leading-[1.3] text-[#151513]">
              &ldquo;Architecture should never ask you to fit inside a rigid template. A
              home belongs to the light it welcomes, the quiet it protects, and the way
              your life unfolds within it.&rdquo;
            </blockquote>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#534F46]">
              Ramona&apos;s Home · Design Philosophy
            </p>
          </div>
        </section>

        {/* Section 4: Three Property Categories */}
        <section
          aria-labelledby="categories-heading"
          className="py-20 sm:py-28 lg:py-32 bg-[#FDFAF0]"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
                  Property Categories
                </p>
                <h2
                  id="categories-heading"
                  className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] leading-tight text-[#151513]"
                >
                  Three distinct ways to experience modern residential living.
                </h2>
              </div>

              <Link
                to="/properties"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#151513] bg-white border border-[#B6AF9D] hover:border-[#57482D] hover:text-[#57482D] transition-colors self-start md:self-auto whitespace-nowrap"
              >
                Explore All Categories
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CATEGORY_OVERVIEWS.map((cat) => (
                <article
                  key={cat.slug}
                  className="group flex flex-col border-b border-[#B6AF9D]/60 pb-8"
                >
                  <Link
                    to={`/properties?category=${cat.slug}`}
                    className="block aspect-[4/3] w-full overflow-hidden mb-6"
                  >
                    <ArchitecturalImage
                      src={cat.image.src}
                      alt={cat.image.alt}
                      className="w-full h-full"
                      imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </Link>

                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#151513]">
                    <Link
                      to={`/properties?category=${cat.slug}`}
                      className="hover:text-[#57482D] transition-colors"
                    >
                      {cat.title}
                    </Link>
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#534F46] flex-1">
                    {cat.summary}
                  </p>

                  <div className="mt-6">
                    <Link
                      to={`/properties?category=${cat.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#57482D] hover:text-[#423620] transition-colors"
                    >
                      Explore {cat.title}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Featured Architectural Studies Gallery */}
        <section
          aria-labelledby="featured-heading"
          className="py-20 sm:py-28 bg-[#FCF0D8]/65 border-t border-[#B6AF9D]/45"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
                  Featured Portfolio Studies
                </p>
                <h2
                  id="featured-heading"
                  className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] leading-tight text-[#151513]"
                >
                  Architectural studies across every typology.
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#534F46]">
                  Explore representative residences illustrating spatial layout and
                  material direction. Current availability is confirmed directly upon
                  viewing inquiry.
                </p>
              </div>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#57482D] hover:text-[#423620] transition-colors whitespace-nowrap"
              >
                View Full Gallery
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredStudies.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>

        {/* Section 6: Lifestyle & Architectural Detail (Alternating 50/50 Splits) */}
        <section aria-label="Lifestyle and architectural craftsmanship" className="bg-[#FDFAF0]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20 sm:py-28 space-y-20 sm:space-y-28">
            {/* Split 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
              <div className="lg:col-span-6">
                <ArchitecturalImage
                  src={CATEGORY_OVERVIEWS[0].image.src}
                  alt={CATEGORY_OVERVIEWS[0].image.alt}
                  className="aspect-[4/3] lg:aspect-auto lg:h-full w-full"
                />
              </div>

              <div className="lg:col-span-6 flex flex-col justify-center py-2 lg:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
                  Materiality &amp; Craft
                </p>
                <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] leading-tight text-[#151513]">
                  Honest stone, warm timber, and quiet neighborhood presence.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[#534F46]">
                  From multi-unit plex facades to sheltered garden courtyards, every
                  material is selected to weather gracefully and soften the boundary
                  between interior rooms and outdoor greenery.
                </p>
                <div className="mt-8">
                  <Link
                    to="/architecture"
                    className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 text-sm font-medium text-[#151513] bg-white border border-[#B6AF9D] hover:border-[#57482D] hover:text-[#57482D] transition-colors"
                  >
                    Explore Materiality &amp; Craft
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Split 2 (Reversed) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
              <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col justify-center py-2 lg:py-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
                  Adaptable Living
                </p>
                <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] leading-tight text-[#151513]">
                  Freedom to grow, relocate, or welcome multiple generations.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[#534F46]">
                  Whether adding a sunlit garden suite behind an existing residence or
                  placing a movable pavilion on open land, our homes adapt as life
                  evolves across Toronto, Vancouver, Montreal, and Calgary.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/properties?category=laneway-houses-garden-suites"
                    className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 text-sm font-medium text-[#151513] bg-white border border-[#B6AF9D] hover:border-[#57482D] hover:text-[#57482D] transition-colors"
                  >
                    Garden Suites
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/properties?category=movable-houses"
                    className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 text-sm font-medium text-[#151513] bg-white border border-[#B6AF9D] hover:border-[#57482D] hover:text-[#57482D] transition-colors"
                  >
                    Movable Houses
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 order-1 lg:order-2">
                <ArchitecturalImage
                  src={CATEGORY_OVERVIEWS[2].image.src}
                  alt={CATEGORY_OVERVIEWS[2].image.alt}
                  className="aspect-[4/3] lg:aspect-auto lg:h-full w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Final Editorial CTA */}
        <section
          aria-labelledby="final-cta-heading"
          className="py-20 sm:py-28 bg-[#FCF0D8] border-t border-[#B6AF9D]/55"
        >
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-4">
              Private Viewings
            </p>
            <h2
              id="final-cta-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.02em] leading-tight text-[#151513]"
            >
              Experience the spaces in person.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#534F46] max-w-2xl mx-auto">
              Share your preferred city, building type, and schedule to arrange a
              private viewing with our residential team.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-4">
              <Link
                to="/request-viewing"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-4 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm"
              >
                Request a Viewing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/properties"
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-4 text-sm sm:text-base font-medium text-[#151513] bg-[#FDFAF0] border border-[#B6AF9D] hover:border-[#151513] transition-colors rounded-sm"
              >
                Explore Properties
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
