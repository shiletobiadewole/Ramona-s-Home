import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PropertyCard } from '../components/PropertyCard';
import {
  CATEGORY_OVERVIEWS,
  PROPERTY_PORTFOLIO,
  getCategoryFromSlug,
  getCategorySlug,
} from '../data/properties';
import type { PropertyCategory } from '../types/property';

type FilterValue = 'All' | PropertyCategory;

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: 'All Categories', value: 'All' },
  { label: 'Plexes', value: 'Plexes' },
  {
    label: 'Laneway Houses & Garden Suites',
    value: 'Laneway Houses & Garden Suites',
  },
  { label: 'Movable Houses', value: 'Movable Houses' },
];

export function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlugParam = searchParams.get('category');

  const activeCategory: FilterValue = useMemo(
    () => getCategoryFromSlug(categorySlugParam),
    [categorySlugParam]
  );

  const filteredProperties = useMemo(() => {
    if (activeCategory === 'All') {
      return PROPERTY_PORTFOLIO;
    }
    return PROPERTY_PORTFOLIO.filter(
      (property) => property.category === activeCategory
    );
  }, [activeCategory]);

  const activeOverview = useMemo(
    () =>
      activeCategory === 'All'
        ? null
        : CATEGORY_OVERVIEWS.find((c) => c.category === activeCategory) ?? null,
    [activeCategory]
  );

  const handleSelectCategory = (value: FilterValue) => {
    if (value === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: getCategorySlug(value) });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24">
        {/* Editorial Intro */}
        <section className="py-12 sm:py-16 border-b border-[#B6AF9D]/50 bg-[#FCF0D8]/60">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
              Explore Properties
            </p>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.025em] leading-[1.1] text-[#151513] max-w-3xl">
              Architectural living across three residential typologies.
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#534F46] max-w-2xl">
              {activeOverview
                ? `${activeOverview.summary} ${activeOverview.architecturalFocus}`
                : 'Browse our architectural studies across Plexes, Laneway Houses & Garden Suites, and Movable Houses. Each residence is designed for daylight, privacy, and enduring comfort.'}
            </p>

            {/* Category Navigation / Filter Bar */}
            <div
              role="tablist"
              aria-label="Filter properties by architectural category"
              className="mt-9 flex flex-wrap items-center gap-2.5"
            >
              {FILTER_OPTIONS.map((option) => {
                const isActive = activeCategory === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleSelectCategory(option.value)}
                    className={`min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors duration-150 text-left sm:whitespace-nowrap ${
                      isActive
                        ? 'bg-[#57482D] border-[#57482D] text-[#FDFAF0]'
                        : 'bg-white border-[#B6AF9D] text-[#151513] hover:border-[#57482D] hover:text-[#57482D]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Transparent Portfolio Notice */}
        <section className="py-5 border-b border-[#B6AF9D]/40 bg-[#FDFAF0]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#534F46]">
            <p>
              <strong className="font-semibold text-[#151513]">
                Architectural Study Showcase:
              </strong>{' '}
              Entries below present Ramona&apos;s Home typology designs. Verified site
              addresses, pricing, and viewing availability are confirmed directly upon
              request.
            </p>
            <span className="font-medium text-[#151513] tabular-nums shrink-0">
              {filteredProperties.length}{' '}
              {filteredProperties.length === 1 ? 'study' : 'studies'} shown
            </span>
          </div>
        </section>

        {/* Property Gallery Grid */}
        <section aria-label="Property gallery" className="py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="border border-[#B6AF9D] bg-white p-8 sm:p-10 text-center max-w-xl mx-auto">
                <p className="text-base font-medium text-[#151513]">
                  No properties match this category yet.
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('All')}
                  className="mt-4 min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] rounded-sm"
                >
                  Show All Categories
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Viewing CTA */}
        <section className="py-16 sm:py-20 bg-[#FCF0D8] border-t border-[#B6AF9D]/50">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#151513]">
                Ready to discuss a residence in Toronto, Vancouver, Montreal, or
                Calgary?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#534F46]">
                Submit a viewing request with your preferred city, building types, and
                target schedule.
              </p>
            </div>
            <Link
              to="/request-viewing"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-7 py-3.5 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm whitespace-nowrap shrink-0"
            >
              Request a Viewing
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
