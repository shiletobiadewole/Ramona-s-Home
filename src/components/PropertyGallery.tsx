import { useState } from 'react';
import type { PropertyImage } from '../types/property';
import { ArchitecturalImage } from './ArchitecturalImage';

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyTitle: string;
}

export function PropertyGallery({ images, propertyTitle }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const current = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <figure>
        <ArchitecturalImage
          src={current.src}
          alt={current.alt}
          loading="eager"
          className="aspect-[16/10] w-full border border-[#B6AF9D]/50"
        />
        {current.caption && (
          <figcaption className="mt-3 text-xs sm:text-sm text-[#534F46]">
            {current.caption}
          </figcaption>
        )}
      </figure>

      {images.length > 1 && (
        <div
          role="region"
          aria-label={`${propertyTitle} image gallery thumbnails`}
          className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2"
        >
          {images.map((image, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={`${image.src}-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View gallery image ${idx + 1}: ${image.alt}`}
                aria-pressed={isSelected}
                className={`relative aspect-[4/3] overflow-hidden border-2 transition-all duration-150 focus-visible:outline-[#57482D] ${
                  isSelected
                    ? 'border-[#57482D] opacity-100'
                    : 'border-[#B6AF9D]/45 opacity-75 hover:opacity-100 hover:border-[#151513]'
                }`}
              >
                <ArchitecturalImage
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
