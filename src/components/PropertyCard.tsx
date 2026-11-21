import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { PropertyRecord } from '../types/property';
import { ArchitecturalImage } from './ArchitecturalImage';

interface PropertyCardProps {
  property: PropertyRecord;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const viewingParams = new URLSearchParams({
    propertyId: property.id,
    propertyName: property.title,
    propertyCategory: property.category,
  }).toString();

  return (
    <article className="group flex flex-col border border-[#B6AF9D]/65 bg-white transition-colors duration-150 hover:border-[#57482D]">
      <Link
        to={`/properties/${property.slug}`}
        className="block relative aspect-[4/3] w-full overflow-hidden"
      >
        <ArchitecturalImage
          src={property.heroImage.src}
          alt={property.heroImage.alt}
          className="w-full h-full"
          imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex-1 flex flex-col p-6 sm:p-7">
        {/* Clean unboxed metadata (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium tracking-wide text-[#534F46]">
          <span className="text-[#57482D] font-semibold">{property.category}</span>
          {property.isTypologyStudy && (
            <>
              <span aria-hidden="true">·</span>
              <span>Architectural Study</span>
            </>
          )}
          {property.location && (
            <>
              <span aria-hidden="true">·</span>
              <span>{property.location}</span>
            </>
          )}
        </div>

        <h3 className="mt-3 text-xl sm:text-2xl font-medium tracking-tight text-[#151513] leading-snug">
          <Link
            to={`/properties/${property.slug}`}
            className="hover:text-[#57482D] transition-colors"
          >
            {property.title}
          </Link>
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-[#534F46] flex-1">
          {property.shortDescription}
        </p>

        {property.budgetOrPrice && (
          <p className="mt-4 text-sm font-medium text-[#151513] tabular-nums">
            {property.budgetOrPrice}
          </p>
        )}

        <div className="mt-6 pt-5 border-t border-[#B6AF9D]/45 flex flex-wrap items-center justify-between gap-4">
          <Link
            to={`/properties/${property.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#151513] hover:text-[#57482D] transition-colors whitespace-nowrap"
          >
            View Details
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            to={`/request-viewing?${viewingParams}`}
            state={{
              propertyId: property.id,
              propertyName: property.title,
              propertyCategory: property.category,
            }}
            className="text-sm font-semibold text-[#57482D] hover:text-[#423620] transition-colors whitespace-nowrap"
          >
            Request Viewing
          </Link>
        </div>
      </div>
    </article>
  );
}
