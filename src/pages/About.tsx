import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import {
  CATEGORY_OVERVIEWS,
  HERO_IMAGE,
  INTERIOR_DETAIL_IMAGE,
} from '../data/properties';

const PRINCIPLES = [
  {
    number: '01',
    title: 'Proportion Over Excess',
    description:
      'Every floor plan begins with natural daylight paths, acoustic privacy between suites, and intuitive circulation rather than oversized decorative square footage.',
  },
  {
    number: '02',
    title: 'Indoor-Outdoor Continuity',
    description:
      'Floor-to-ceiling openings, sheltered terraces, and stone-paved garden courts extend daily living seamlessly into quiet outdoor landscapes.',
  },
  {
    number: '03',
    title: 'Adaptable Residential Footprints',
    description:
      'Whether a multi-unit urban plex, a rear-lot garden suite, or a relocatable pavilion, each residence is conceived to evolve alongside your household.',
  },
  {
    number: '04',
    title: 'Transparent Viewing Guidance',
    description:
      'We verify specific property availability, site conditions, and timing directly with you through our dedicated viewing request coordination.',
  },
];

const CITIES = [
  {
    city: 'Toronto',
    timezone: 'America/Toronto',
    focus: 'Multi-residence urban plexes and mature residential laneway suites.',
  },
  {
    city: 'Vancouver',
    timezone: 'America/Vancouver',
    focus: 'Timber-forward garden suites and courtyard-oriented architectural residences.',
  },
  {
    city: 'Montreal',
    timezone: 'America/Toronto',
    focus: 'Refined duplex and triplex architecture respecting neighborhood streetscapes.',
  },
  {
    city: 'Calgary',
    timezone: 'America/Edmonton',
    focus: 'Four-season movable houses and adaptable multi-generational dwellings.',
  },
];

export function About() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* Intro Header */}
        <section className="py-12 sm:py-20 border-b border-[#B6AF9D]/50 bg-[#FCF0D8]/60">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
              About Ramona&apos;s Home
            </p>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.025em] leading-[1.1] text-[#151513] max-w-3xl">
              Quiet residential architecture crafted for the way people actually live.
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#534F46] max-w-2xl">
              Ramona&apos;s Home brings together architectural discipline, natural
              materials, and thoughtful residential planning across Plexes, Laneway
              Houses &amp; Garden Suites, and Movable Houses.
            </p>
          </div>
        </section>

        {/* Asymmetric Editorial Image + Narrative */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-7">
              <ArchitecturalImage
                src={HERO_IMAGE.src}
                alt={HERO_IMAGE.alt}
                loading="eager"
                className="aspect-[16/10] w-full border border-[#B6AF9D]/45"
              />
            </div>

            <div className="lg:col-span-5 space-y-6 text-base leading-relaxed text-[#534F46]">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#151513]">
                Living differently without compromising calm or comfort.
              </h2>
              <p>
                Modern households rarely fit inside a single rigid housing model.
                Extended families share lots across generations, homeowners seek
                quiet studio dwellings tucked behind leafy gardens, and others
                prioritize architectural homes capable of moving with their land.
              </p>
              <p>
                We focus exclusively on residential typologies that honor human
                scale—avoiding anonymous high-rise corridors in favor of sunlit living
                rooms, tactile stone and timber, and genuine connection to outdoors.
              </p>
              <div className="pt-2">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#57482D] hover:text-[#423620] transition-colors"
                >
                  Explore Architectural Studies
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Four Core Principles */}
        <section
          aria-labelledby="principles-heading"
          className="py-16 sm:py-24 bg-white border-y border-[#B6AF9D]/45"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
                Our Approach
              </p>
              <h2
                id="principles-heading"
                className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#151513]"
              >
                Principles guiding every residence.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {PRINCIPLES.map((item) => (
                <div
                  key={item.number}
                  className="pt-6 border-t border-[#B6AF9D]/60 space-y-3"
                >
                  <p className="text-xs font-semibold tracking-wider text-[#57482D] tabular-nums">
                    {item.number}
                  </p>
                  <h3 className="text-xl font-medium text-[#151513]">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[#534F46]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities & Regional Focus */}
        <section className="py-16 sm:py-24 bg-[#FDFAF0]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D]">
                Where We Coordinate Viewings
              </p>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#151513]">
                Four Canadian cities, coordinated in local time.
              </h2>
              <p className="text-base leading-relaxed text-[#534F46]">
                Private viewing appointments are arranged across Toronto, Vancouver,
                Montreal, and Calgary—respecting each city&apos;s climate, zoning
                context, and local scheduling timezone.
              </p>
              <div className="pt-4">
                <ArchitecturalImage
                  src={INTERIOR_DETAIL_IMAGE.src}
                  alt={INTERIOR_DETAIL_IMAGE.alt}
                  className="aspect-[4/3] w-full border border-[#B6AF9D]/45"
                />
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {CITIES.map((item) => (
                <div
                  key={item.city}
                  className="bg-white border border-[#B6AF9D]/65 p-6 sm:p-7 flex flex-col justify-between gap-4"
                >
                  <div>
                    <h3 className="text-xl font-medium text-[#151513]">
                      {item.city}
                    </h3>
                    <p className="mt-1 text-xs text-[#57482D] font-medium">
                      {item.timezone}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#534F46]">
                      {item.focus}
                    </p>
                  </div>
                  <Link
                    to="/request-viewing"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#57482D] hover:text-[#423620] transition-colors"
                  >
                    Request Viewing in {item.city}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 sm:py-20 bg-[#FCF0D8] border-t border-[#B6AF9D]/55">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#151513]">
                Explore our architectural studies or schedule a conversation.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#534F46]">
                Select the residential typologies you are considering and tell us when
                you would like to connect.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
              <Link
                to="/request-viewing"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3.5 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm whitespace-nowrap"
              >
                Request a Viewing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/properties"
                className="inline-flex items-center justify-center min-h-[48px] px-7 py-3.5 text-sm sm:text-base font-medium text-[#151513] bg-[#FDFAF0] border border-[#B6AF9D] hover:border-[#151513] transition-colors rounded-sm whitespace-nowrap"
              >
                Browse Typologies
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
