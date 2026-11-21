import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  transparentOverHero?: boolean;
}

const NAV_ITEMS = [
  { label: 'Properties', to: '/properties' },
  { label: 'Architecture', to: '/architecture' },
  { label: 'Locations', to: '/locations' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
] as const;

export function Header({ transparentOverHero = false }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const useLightText = transparentOverHero && !scrolled && !mobileOpen;

  const isRouteActive = (to: string) => {
    if (to === '/properties') {
      return location.pathname.startsWith('/properties');
    }
    return location.pathname === to;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        useLightText
          ? 'bg-gradient-to-b from-[#151513]/70 to-transparent text-[#FDFAF0] border-b border-white/15'
          : 'bg-[#FDFAF0]/95 backdrop-blur-md text-[#151513] border-b border-[#B6AF9D]/55'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className={`text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap shrink-0 transition-colors ${
            useLightText
              ? 'text-[#FDFAF0] hover:text-white'
              : 'text-[#151513] hover:text-[#57482D]'
          }`}
        >
          Ramona&apos;s Home
        </Link>

        {/* Zone 2: Primary Text Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-5 lg:gap-8"
        >
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium tracking-wide whitespace-nowrap shrink-0 transition-colors duration-150 py-1 border-b ${
                  active
                    ? useLightText
                      ? 'border-[#FDFAF0] text-[#FDFAF0]'
                      : 'border-[#57482D] text-[#57482D]'
                    : useLightText
                    ? 'border-transparent text-[#FDFAF0]/90 hover:text-white hover:border-white/70'
                    : 'border-transparent text-[#534F46] hover:text-[#151513] hover:border-[#57482D]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/request-viewing"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors duration-150 whitespace-nowrap shrink-0 rounded-sm"
          >
            Request a Viewing
          </Link>

          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`md:hidden inline-flex items-center justify-center w-11 h-11 rounded-sm transition-colors ${
              useLightText
                ? 'text-[#FDFAF0] hover:bg-white/15'
                : 'text-[#151513] hover:bg-[#FCF0D8]'
            }`}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          id="mobile-navigation-drawer"
          className="md:hidden bg-[#FDFAF0] text-[#151513] border-b border-[#B6AF9D]/60 px-5 py-6"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2">
            <Link
              to="/"
              className={`text-base font-medium py-3 border-b border-[#B6AF9D]/35 ${
                location.pathname === '/' ? 'text-[#57482D] font-semibold' : 'text-[#151513]'
              }`}
            >
              Home
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-base font-medium py-3 border-b border-[#B6AF9D]/35 ${
                  isRouteActive(item.to)
                    ? 'text-[#57482D] font-semibold'
                    : 'text-[#151513]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/request-viewing"
              className="mt-4 inline-flex items-center justify-center w-full min-h-[48px] px-5 py-3 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm"
            >
              Request a Viewing
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
