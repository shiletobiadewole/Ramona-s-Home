import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HERO_IMAGE } from '../data/properties';

export function Hero() {
  return (
    <section
      aria-label="Ramona's Home hero"
      className="relative min-h-[85vh] lg:min-h-[90vh] w-full flex items-end bg-[#151513] overflow-hidden"
    >
      <img
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#151513]/85 via-[#151513]/40 to-[#151513]/35"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-14 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-medium tracking-[0.18em] uppercase text-[#FCF0D8] mb-4">
            Architectural Residential Living
          </p>
          <h1 className="text-[clamp(2.25rem,4.8vw,4.15rem)] font-medium tracking-[-0.025em] leading-[1.08] text-[#FDFAF0]">
            Spaces Designed Around the Way You Live.
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#FCF0D8]/95 max-w-2xl">
            Discover thoughtfully designed homes that bring together modern architecture,
            comfort and the freedom to live differently.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4">
            <Link
              to="/request-viewing"
              className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-7 py-3.5 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] border border-[#B6AF9D]/45 transition-colors duration-150 rounded-sm whitespace-nowrap"
            >
              Request a Viewing
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3.5 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#151513]/60 hover:bg-[#151513]/85 border border-[#FDFAF0]/60 transition-colors duration-150 rounded-sm whitespace-nowrap backdrop-blur-xs"
            >
              Explore Properties
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
