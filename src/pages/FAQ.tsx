import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Does submitting a viewing date and time guarantee immediate availability?',
    answer:
      'No. Selecting a date and time submits your preferred request to our live scheduling workflow for verification. If your requested time is unavailable, the system returns alternative open slots from our calendar so you can choose another time and confirm.',
  },
  {
    question: 'Which cities and timezones are supported for viewings?',
    answer:
      'We coordinate viewings across Toronto (America/Toronto), Montreal (America/Toronto), Calgary (America/Edmonton), and Vancouver (America/Vancouver). Your selected viewing date and time are automatically aligned with the chosen city’s local timezone.',
  },
  {
    question: 'Can I inquire about multiple building types in a single request?',
    answer:
      'Yes. On the Request a Viewing page, you can select one or any combination of Plexes, Laneway Houses & Garden Suites, and Movable Houses so our team prepares relevant architectural studies and availability for your visit.',
  },
  {
    question: 'Why do the property pages show architectural studies without street addresses or prices?',
    answer:
      'Ramona’s Home presents verified architectural typology studies online and shares active site-specific inventory, pricing, and floor plans directly upon viewing inquiry rather than publishing speculative or outdated listing details.',
  },
  {
    question: 'Do I need to type +1 or format my phone number manually?',
    answer:
      'No. The +1 code for Canada and the US is already applied automatically—simply enter your 10-digit area code and phone number. Spaces, dashes, parentheses, or a pasted +1 prefix are handled automatically.',
  },
  {
    question: 'What happens if I navigate from a specific property details page?',
    answer:
      'The property reference ID, title, and category carry automatically into your viewing request so our team knows exactly which residence study prompted your inquiry. You can also clear that selection at any time if you prefer a general consultation.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFAF0] text-[#151513]">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        {/* Intro */}
        <section className="py-12 sm:py-16 border-b border-[#B6AF9D]/50 bg-[#FCF0D8]/60">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#57482D] mb-3">
              Viewing Guide &amp; FAQ
            </p>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-[-0.025em] leading-[1.1] text-[#151513]">
              How private viewings &amp; property inquiries work.
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#534F46] max-w-2xl">
              Clear answers about scheduling, city timezones, building categories, and
              how we coordinate live availability.
            </p>
          </div>
        </section>

        {/* Accordion */}
        <section aria-label="Frequently asked questions" className="py-14 sm:py-20">
          <div className="max-w-4xl mx-auto px-5 sm:px-8">
            <div className="bg-white border border-[#B6AF9D]/70 divide-y divide-[#B6AF9D]/50">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openIndex === idx;
                const panelId = `faq-panel-${idx}`;
                const buttonId = `faq-button-${idx}`;

                return (
                  <div key={item.question}>
                    <h2>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                        className="w-full px-5 sm:px-8 py-6 text-left flex items-start justify-between gap-4 hover:bg-[#FDFAF0]/70 transition-colors"
                      >
                        <span className="text-base sm:text-lg font-medium text-[#151513] leading-snug">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 shrink-0 text-[#57482D] mt-0.5 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    </h2>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        className="px-5 sm:px-8 pb-6 text-sm sm:text-base leading-relaxed text-[#534F46]"
                      >
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 p-6 sm:p-10 bg-[#FCF0D8] border border-[#B6AF9D]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-medium text-[#151513]">
                  Ready to submit a viewing request?
                </h2>
                <p className="mt-2 text-sm text-[#534F46]">
                  Share your preferred city, date, and residential typologies.
                </p>
              </div>
              <Link
                to="/request-viewing"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[48px] px-7 py-3.5 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] transition-colors rounded-sm whitespace-nowrap shrink-0"
              >
                Request a Viewing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
