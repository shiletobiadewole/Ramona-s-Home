import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#151513] text-[#FDFAF0] border-t border-[#534F46]/40">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 md:gap-12 pb-12 border-b border-white/15">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-5">
            <Link
              to="/"
              className="inline-block text-2xl font-semibold tracking-tight text-[#FDFAF0] hover:text-[#FCF0D8] transition-colors"
            >
              Ramona&apos;s Home
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[#B6AF9D] max-w-md">
              Architectural residential properties designed around modern proportions,
              natural light, and enduring livability across Plexes, Laneway Houses &amp;
              Garden Suites, and Movable Houses.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#B6AF9D] mb-4">
              Explore
            </h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/properties"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Explore Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/architecture"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Architecture &amp; Craft
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Cities &amp; Locations
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  About Ramona&apos;s Home
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Viewing Guide &amp; FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/request-viewing"
                  className="text-[#FCF0D8] hover:text-white font-medium transition-colors"
                >
                  Request a Viewing
                </Link>
              </li>
            </ul>
          </div>

          {/* Typologies Column */}
          <div className="md:col-span-4">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#B6AF9D] mb-4">
              Residential Typologies
            </h2>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/properties?category=plexes"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Plexes
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?category=laneway-houses-garden-suites"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Laneway Houses &amp; Garden Suites
                </Link>
              </li>
              <li>
                <Link
                  to="/properties?category=movable-houses"
                  className="text-[#FDFAF0]/90 hover:text-white transition-colors"
                >
                  Movable Houses
                </Link>
              </li>
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-[#B6AF9D]">
              Private viewings are coordinated across Toronto, Vancouver, Montreal, and
              Calgary through our viewing request workflow.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#B6AF9D]">
          <p>&copy; {currentYear} Ramona&apos;s Home. All rights reserved.</p>
          <p>
            Architectural study previews shown; active availability is confirmed upon
            viewing request.
          </p>
        </div>
      </div>
    </footer>
  );
}
