import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArchitecturalImage } from '../components/ArchitecturalImage';
import { CATEGORY_OVERVIEWS, INTERIOR_DETAIL_IMAGE } from '../data/properties';

const MATERIAL_PALETTE = [
  {
    material: 'Honed Limestone & Travertine',
    application: 'Facades, kitchen islands, and thermally grounded interior hearths.',
    character: 'Tactile matte surfaces that soften daylight glare and age gracefully.',
  },
  {
    material: 'Vertical Western Red Cedar & White Oak',
    application: 'Exterior cladding, recessed soffits, custom joinery, and stairways.',
    character: 'Warm organic grain bringing calm rhythm to both urban and rural sites.',
  },
  {
    material: 'Anodized Architectural Bronze & Steel',
    application: 'Slim-profile glazing frames, standing-seam roofs, and structural chassis.',
    character: 'Crisp sightlines and durable weather protection across Canadian seasons.',
  },
];

export function Architecture() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* Intro */}
        <section className="py-12 sm:py-20 border-b border-[#B6AF9D]/50 bg-[#FCF0D8]/60">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
              Architecture &amp; Craft
            </p>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.025em] leading-[1.1] text-[#151513] max-w-3xl">
              Material honesty, natural light, and structural clarity across every
              typology.
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#534F46] max-w-2xl">
              Each Ramona&apos;s Home building type solves a distinct spatial challenge
              while sharing a unified architectural vocabulary of limestone, timber, and
              expansive courtyard glazing.
            </p>
          </div>
        </section>

        {/* Typology Deep-Dives */}
        <section aria-label="Architectural typologies" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-20 sm:space-y-28">
            {CATEGORY_OVERVIEWS.map((item, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <div
                  key={item.slug}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch"
                >
                  <div
                    className={`lg:col-span-6 ${
                      reversed ? 'lg:order-2' : 'lg:order-1'
                    }`}
                  >
                    <ArchitecturalImage
                      src={item.image.src}
                      alt={item.image.alt}
                      className="aspect-[4/3] lg:aspect-auto lg:h-full w-full border border-[#B6AF9D]/45"
                    />
                  </div>

                  <div
                    className={`lg:col-span-6 flex flex-col justify-center py-2 lg:py-8 ${
                      reversed ? 'lg:order-1' : 'lg:order-2'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
                      Typology 0{idx + 1}
                    </p>
                    <h2 className="text-2xl sm:text-4xl font-medium tracking-[-0.02em] text-[#151513]">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#534F46]">
                      {item.summary}
                    </p>
                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#534F46]">
                      <strong className="font-semibold text-[#151513]">
                        Architectural Focus:
                      </strong>{' '}
                      {item.architecturalFocus}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link
                        to={`/properties?category=${item.slug}`}
                        className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm"
                      >
                        View {item.title} Studies
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Material Palette */}
        <section className="py-16 sm:py-24 bg-white border-t border-[#B6AF9D]/50">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D]">
                Material Direction
              </p>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.02em] text-[#151513]">
                Surfaces chosen to patina with quiet warmth.
              </h2>
              <p className="text-base leading-relaxed text-[#534F46]">
                Rather than synthetic finishes that date quickly, our interiors and
                facades rely on solid stone, natural timber, and matte metalwork that
                feel serene across changing light.
              </p>
              <ArchitecturalImage
                src={INTERIOR_DETAIL_IMAGE.src}
                alt={INTERIOR_DETAIL_IMAGE.alt}
                className="aspect-[3/4] w-full max-w-md border border-[#B6AF9D]/45"
              />
            </div>

            <div className="lg:col-span-7 divide-y divide-[#B6AF9D]/50 border-y border-[#B6AF9D]/50">
              {MATERIAL_PALETTE.map((entry) => (
                <div key={entry.material} className="py-7 space-y-2">
                  <h3 className="text-xl font-medium text-[#151513]">
                    {entry.material}
                  </h3>
                  <p className="text-sm text-[#57482D] font-medium">
                    {entry.application}
                  </p>
                  <p className="text-sm sm:text-base leading-relaxed text-[#534F46]">
                    {entry.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#FCF0D8] border-t border-[#B6AF9D]/55">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#151513]">
              See the craftsmanship and proportions firsthand.
            </h2>
            <p className="mt-4 text-base text-[#534F46]">
              Request a private viewing tailored to your preferred city and building
              type.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/request-viewing"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-8 py-3.5 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm"
              >
                Request a Viewing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/faq"
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3.5 text-sm sm:text-base font-medium text-[#151513] bg-[#FDFAF0] border border-[#B6AF9D] hover:border-[#151513] transition-colors rounded-sm"
              >
                Read Viewing Guide &amp; FAQ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
