import { Link } from 'react-router-dom';
import { ArrowRight, Globe, MapPin } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { CATEGORY_OVERVIEWS } from '../data/properties';

const CITY_GUIDES = [
  {
    city: 'Toronto',
    province: 'Ontario',
    timezone: 'America/Toronto',
    typologies: ['Plexes', 'Laneway Houses & Garden Suites'],
    description:
      'Focused on quiet tree-lined neighborhoods suited to multi-unit plex conversions, rear-lot laneway houses, and multi-generational garden suites.',
    image: CATEGORY_OVERVIEWS[0].image,
  },
  {
    city: 'Vancouver',
    province: 'British Columbia',
    timezone: 'America/Vancouver',
    typologies: ['Laneway Houses & Garden Suites', 'Plexes'],
    description:
      'Warm cedar and bronze-glazed residences designed for coastal light, landscaped courtyard living, and serene rear-lane dwellings.',
    image: CATEGORY_OVERVIEWS[1].image,
  },
  {
    city: 'Montreal',
    province: 'Quebec',
    timezone: 'America/Toronto',
    typologies: ['Plexes', 'Laneway Houses & Garden Suites'],
    description:
      'Honoring classic Montreal plex proportions through contemporary limestone facades, recessed upper terraces, and acoustic separation.',
    image: CATEGORY_OVERVIEWS[0].image,
  },
  {
    city: 'Calgary',
    province: 'Alberta',
    timezone: 'America/Edmonton',
    typologies: ['Movable Houses', 'Laneway Houses & Garden Suites'],
    description:
      'Four-season architectural envelopes built for crisp prairie light, adaptable land placement, and efficient thermal comfort.',
    image: CATEGORY_OVERVIEWS[2].image,
  },
];

export function Locations() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28">
        <section className="py-12 sm:py-16 border-b border-[#B6AF9D]/50 bg-[#FCF0D8]/60">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
              Cities &amp; Regional Focus
            </p>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.025em] leading-[1.1] text-[#151513] max-w-3xl">
              Architectural living across four Canadian cities.
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#534F46] max-w-2xl">
              Viewing requests are coordinated directly in each city&apos;s local
              timezone across Toronto, Vancouver, Montreal, and Calgary.
            </p>
          </div>
        </section>

        <section aria-label="City architectural guides" className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {CITY_GUIDES.map((guide) => (
              <article
                key={guide.city}
                className="bg-white border border-[#B6AF9D]/65 flex flex-col"
              >
                <ArchitecturalImage
                  src={guide.image.src}
                  alt={`${guide.city} residential architecture — ${guide.image.alt}`}
                  className="aspect-[16/10] w-full"
                />

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#534F46]">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#57482D]">
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        {guide.province}
                      </span>
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                        {guide.timezone}
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl sm:text-3xl font-medium tracking-tight text-[#151513]">
                      {guide.city}
                    </h2>

                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#534F46]">
                      {guide.description}
                    </p>

                    <p className="mt-4 text-xs font-medium text-[#534F46]">
                      Primary typologies: {guide.typologies.join(' · ')}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-[#B6AF9D]/45 flex flex-wrap items-center justify-between gap-4">
                    <Link
                      to="/request-viewing"
                      className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm"
                    >
                      Request {guide.city} Viewing
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>

                    <Link
                      to="/properties"
                      className="text-sm font-medium text-[#151513] hover:text-[#57482D] transition-colors"
                    >
                      Explore Studies
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
