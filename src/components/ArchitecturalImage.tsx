import { useState } from 'react';
import { Home } from 'lucide-react';

interface ArchitecturalImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'eager' | 'lazy';
}

export function ArchitecturalImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  loading = 'lazy',
}: ArchitecturalImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-[#FCF0D8] border border-[#B6AF9D]/50 text-[#534F46] p-6 text-center ${className}`}
      >
        <Home className="w-7 h-7 text-[#57482D] mb-2" strokeWidth={1.5} aria-hidden="true" />
        <span className="text-xs tracking-wide text-[#534F46] max-w-xs">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden bg-[#FCF0D8]/40 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
