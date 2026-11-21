import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PropertyGallery } from '../components/PropertyGallery';
import { getCategorySlug, getPropertyByIdOrSlug } from '../data/properties';

export function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const property = id ? getPropertyByIdOrSlug(id) : undefined;

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
        <Header />
        <main className="flex-1 pt-32 pb-24 px-5 sm:px-8 max-w-3xl mx-auto w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D]">
            Property Not Found
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-medium tracking-tight text-[#151513]">
            This residence record could not be found.
          </h1>
          <p className="mt-4 text-base text-[#534F46]">
            Return to our properties gallery to browse available architectural studies
            or submit a viewing inquiry directly.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4">
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] rounded-sm"
            >
              Explore Properties
            </Link>
            <Link
              to="/request-viewing"
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-3 text-sm font-medium text-[#151513] bg-white border border-[#B6AF9D] hover:border-[#151513] rounded-sm"
            >
              Request a Viewing
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const viewingSearch = new URLSearchParams({
    propertyId: property.id,
    propertyName: property.title,
    propertyCategory: property.category,
  }).toString();

  const viewingState = {
    propertyId: property.id,
    propertyName: property.title,
    propertyCategory: property.category,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="py-5 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#534F46]"
          >
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 hover:text-[#57482D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Explore Properties
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/properties?category=${getCategorySlug(property.category)}`}
              className="hover:text-[#57482D] transition-colors"
            >
              {property.category}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#151513] font-medium">{property.title}</span>
          </nav>

          {/* Property Title Header */}
          <header className="pt-4 pb-8 sm:pb-10 border-b border-[#B6AF9D]/50">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#57482D]">
              <span>{property.category}</span>
              {property.isTypologyStudy && (
                <>
                  <span aria-hidden="true" className="text-[#878276]">
                    ·
                  </span>
                  <span className="text-[#534F46]">Architectural Study</span>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.02em] leading-tight text-[#151513] max-w-3xl">
                {property.title}
              </h1>

              <Link
                to={`/request-viewing?${viewingSearch}`}
                state={viewingState}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-7 py-3.5 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm whitespace-nowrap self-start lg:self-auto shrink-0"
              >
                Request a Viewing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </header>

          {/* Hero & Gallery */}
          <section aria-label="Property gallery" className="py-10 sm:py-12">
            <PropertyGallery
              images={property.gallery}
              propertyTitle={property.title}
            />
          </section>

          {/* Description & Supplied Metadata */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-4 pb-12 border-t border-[#B6AF9D]/50">
            <div className="lg:col-span-7 space-y-6 pt-6">
              <h2 className="text-2xl font-medium tracking-tight text-[#151513]">
                Architectural Overview
              </h2>
              <p className="text-base leading-relaxed text-[#534F46]">
                {property.description}
              </p>

              {property.features && property.features.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#151513] mb-4">
                    Key Design Characteristics
                  </h3>
                  <ul className="space-y-3">
                    {property.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm sm:text-base text-[#534F46]"
                      >
                        <Check
                          className="w-4 h-4 text-[#57482D] shrink-0 mt-1"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar: Supplied Details Only */}
            <aside className="lg:col-span-5 pt-6">
              <div className="border border-[#B6AF9D] bg-white p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-medium text-[#151513]">
                  Property Context
                </h2>

                <dl className="space-y-4 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 pb-3 border-b border-[#B6AF9D]/45">
                    <dt className="text-[#534F46]">Category</dt>
                    <dd className="font-medium text-[#151513] sm:text-right">
                      {property.category}
                    </dd>
                  </div>

                  {property.location && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 pb-3 border-b border-[#B6AF9D]/45">
                      <dt className="text-[#534F46]">Location</dt>
                      <dd className="font-medium text-[#151513] sm:text-right">
                        {property.location}
                      </dd>
                    </div>
                  )}

                  {property.budgetOrPrice && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 pb-3 border-b border-[#B6AF9D]/45">
                      <dt className="text-[#534F46]">Pricing</dt>
                      <dd className="font-medium text-[#151513] sm:text-right tabular-nums">
                        {property.budgetOrPrice}
                      </dd>
                    </div>
                  )}

                  {property.specifications &&
                    property.specifications.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 pb-3 border-b border-[#B6AF9D]/45"
                      >
                        <dt className="text-[#534F46]">{spec.label}</dt>
                        <dd className="font-medium text-[#151513] sm:text-right tabular-nums">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                </dl>

                {property.isTypologyStudy && (
                  <p className="text-xs leading-relaxed text-[#534F46]">
                    This entry illustrates our {property.category} architectural
                    approach. Specific site availability, pricing, and floor plans are
                    shared directly when you request a viewing.
                  </p>
                )}

                <Link
                  to={`/request-viewing?${viewingSearch}`}
                  state={viewingState}
                  className="inline-flex items-center justify-center gap-2 w-full min-h-[48px] px-6 py-3.5 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm text-center"
                >
                  Request a Viewing for This Residence
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
