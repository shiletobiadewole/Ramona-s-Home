import { useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ViewingForm } from '../components/ViewingForm';
import type { PropertyCategory } from '../types/property';
import { BUILDING_TYPE_OPTIONS, type PropertyContext } from '../types/viewing';

function isPropertyCategory(val: unknown): val is PropertyCategory {
  return (
    typeof val === 'string' &&
    (BUILDING_TYPE_OPTIONS as readonly string[]).includes(val)
  );
}

export function RequestViewing() {
  const routerLocation = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clearedManually, setClearedManually] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hasUnavailableNotice, setHasUnavailableNotice] = useState(false);

  const initialPropertyContext: PropertyContext = useMemo(() => {
    if (clearedManually) {
      return {
        propertyId: null,
        propertyName: null,
        propertyCategory: null,
      };
    }

    const stateObj =
      routerLocation.state && typeof routerLocation.state === 'object'
        ? (routerLocation.state as Partial<PropertyContext>)
        : {};

    const idFromQuery = searchParams.get('propertyId');
    const nameFromQuery = searchParams.get('propertyName');
    const categoryFromQuery = searchParams.get('propertyCategory');

    const propertyId = stateObj.propertyId ?? (idFromQuery || null);
    const propertyName = stateObj.propertyName ?? (nameFromQuery || null);
    const rawCategory = stateObj.propertyCategory ?? categoryFromQuery;
    const propertyCategory = isPropertyCategory(rawCategory) ? rawCategory : null;

    return {
      propertyId,
      propertyName,
      propertyCategory,
    };
  }, [clearedManually, routerLocation.state, searchParams]);

  const handleClearPropertyContext = () => {
    setClearedManually(true);
    const next = new URLSearchParams(searchParams);
    next.delete('propertyId');
    next.delete('propertyName');
    next.delete('propertyCategory');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header />

      <main className="flex-1 pt-24 sm:pt-32 pb-20 sm:pb-28">
        <div
          className={`${
            hasUnavailableNotice && !isConfirmed ? 'max-w-7xl' : 'max-w-4xl'
          } mx-auto px-5 sm:px-8 transition-[max-width] duration-300`}
        >
          {!isConfirmed && (
            <header className="mb-8 sm:mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
                Request a Viewing
              </p>
              <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.025em] leading-[1.1] text-[#151513]">
                Let&apos;s Find a Time to See You Home.
              </h1>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#534F46] max-w-2xl">
                Tell us a little about what you&apos;re looking for, and we&apos;ll help
                arrange a viewing.
              </p>
            </header>
          )}

          <ViewingForm
            initialPropertyContext={initialPropertyContext}
            onClearPropertyContext={handleClearPropertyContext}
            onConfirmationChange={setIsConfirmed}
            onUnavailableChange={setHasUnavailableNotice}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
