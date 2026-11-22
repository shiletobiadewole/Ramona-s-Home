import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { HERO_VIDEO } from '../data/properties';

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      videoEl.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  const handleTogglePlayback = () => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }

    if (videoEl.paused) {
      const playPromise = videoEl.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(true);
      }
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      aria-label="Ramona's Home hero"
      className="relative min-h-[85vh] lg:min-h-[90vh] w-full flex items-end bg-[#151513] overflow-hidden"
    >
      {!videoFailed ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={HERO_VIDEO.posterSrc}
          aria-label={HERO_VIDEO.alt}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
        >
          <source src={HERO_VIDEO.src} type="video/mp4" />
          <img
            src={HERO_VIDEO.posterSrc}
            alt={HERO_VIDEO.alt}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </video>
      ) : (
        <img
          src={HERO_VIDEO.posterSrc}
          alt={HERO_VIDEO.alt}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#151513]/85 via-[#151513]/42 to-[#151513]/38"
      />

      {!videoFailed && (
        <button
          type="button"
          onClick={handleTogglePlayback}
          aria-label={isPlaying ? 'Pause background architectural video' : 'Play background architectural video'}
          aria-pressed={!isPlaying}
          className="absolute top-20 right-5 sm:top-auto sm:bottom-8 sm:right-8 z-20 inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 text-xs font-medium tracking-wider uppercase text-[#FDFAF0] bg-[#151513]/55 hover:bg-[#151513]/80 border border-[#FDFAF0]/35 transition-colors rounded-sm backdrop-blur-xs cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Play</span>
            </>
          )}
        </button>
      )}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-14 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl">
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
