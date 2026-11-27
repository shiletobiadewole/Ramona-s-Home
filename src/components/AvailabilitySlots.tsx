import { CalendarClock, Check, ArrowRight, Globe, X } from 'lucide-react';
import type { AvailableSlot, UnavailableResponse } from '../types/viewing';
import { SafeHtmlRenderer } from './SafeHtmlRenderer';

interface AvailabilitySlotsProps {
  response: UnavailableResponse;
  selectedSlotDateTime: string | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  onConfirmSelectedSlot: () => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

function formatSlotDateTimeDisplay(slot: AvailableSlot): {
  dateText: string;
  timeText: string;
} {
  const parsed = new Date(slot.dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return { dateText: slot.label, timeText: '' };
  }

  try {
    const dateText = new Intl.DateTimeFormat('en-CA', {
      timeZone: slot.timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(parsed);

    const timeText = new Intl.DateTimeFormat('en-CA', {
      timeZone: slot.timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(parsed);

    return { dateText, timeText };
  } catch {
    return { dateText: slot.label, timeText: '' };
  }
}

export function AvailabilitySlots({
  response,
  selectedSlotDateTime,
  onSelectSlot,
  onConfirmSelectedSlot,
  onDismiss,
  isSubmitting,
}: AvailabilitySlotsProps) {
  const hasSlots = response.availableSlots.length > 0;
  const hasHtmlNotice = Boolean(response.html);

  return (
    <section
      role="alert"
      aria-live="assertive"
      aria-label="Viewing time availability update"
      className="animate-viewing-slide-right border-2 border-[#57482D] bg-[#FCF0D8]/80 p-4 sm:p-6 space-y-5 rounded-sm shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="relative shrink-0 mt-0.5">
            <CalendarClock
              className="w-5 h-5 text-[#57482D]"
              aria-hidden="true"
            />
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FADF1E] opacity-85" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#57482D]" />
            </span>
          </div>

          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#57482D]">
              Schedule Notice · Requested Time Unavailable
            </p>
            {!hasHtmlNotice && (
              <p className="text-sm sm:text-base text-[#151513] leading-relaxed">
                {response.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs font-medium text-[#151513] bg-white border border-[#B6AF9D] hover:border-[#151513] transition-colors rounded-sm shrink-0"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Dismiss</span>
        </button>
      </div>

      {hasHtmlNotice && response.html && (
        <SafeHtmlRenderer html={response.html} hideEmbeddedForm={hasSlots} />
      )}

      {hasSlots ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#151513]">
            Select an available alternative below to update your request and verify with
            our scheduling team:
          </p>

          <div
            role="radiogroup"
            aria-label="Available alternative viewing slots"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3"
          >
            {response.availableSlots.map((slot) => {
              const isSelected = selectedSlotDateTime === slot.dateTime;
              const formatted = formatSlotDateTimeDisplay(slot);

              return (
                <button
                  key={`${slot.dateTime}-${slot.timezone}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isSubmitting}
                  onClick={() => onSelectSlot(slot)}
                  className={`text-left p-4 border transition-colors duration-150 rounded-sm flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-2 border-[#57482D] text-[#151513]'
                      : 'bg-white border-[#B6AF9D] text-[#151513] hover:border-[#151513]'
                  } disabled:opacity-60`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#151513]">
                        {slot.label}
                      </p>
                      {formatted.timeText && (
                        <p className="mt-1 text-xs text-[#534F46] tabular-nums">
                          {formatted.dateText} · {formatted.timeText}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                        isSelected ? 'text-[#57482D]' : 'text-[#534F46]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" aria-hidden="true" />
                          Selected
                        </>
                      ) : (
                        'Select'
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#534F46] pt-2 border-t border-[#B6AF9D]/35">
                    <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{slot.timezone}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedSlotDateTime && (
            <div className="pt-3 flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-stretch justify-between gap-4 border-t border-[#B6AF9D]/55">
              <p className="text-xs text-[#534F46]">
                Selecting a slot updates your requested date and time. Final confirmation
                is verified upon submission.
              </p>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmSelectedSlot}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto lg:w-full min-h-[46px] px-6 py-3 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] disabled:opacity-60 transition-colors rounded-sm whitespace-nowrap shrink-0"
              >
                {isSubmitting ? 'Verifying Slot...' : 'Submit Selected Alternative'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      ) : (
        !hasHtmlNotice && (
          <p className="text-sm text-[#534F46] pt-2 border-t border-[#B6AF9D]/45">
            No preset alternative times were returned. Please choose a different date and
            time in the form below and submit again.
          </p>
        )
      )}
    </section>
  );
}
