import { CalendarClock, Check, ArrowRight, Globe } from 'lucide-react';
import type { AvailableSlot, UnavailableResponse } from '../types/viewing';

interface AvailabilitySlotsProps {
  response: UnavailableResponse;
  selectedSlotDateTime: string | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  onConfirmSelectedSlot: () => void;
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
  isSubmitting,
}: AvailabilitySlotsProps) {
  const hasSlots = response.availableSlots.length > 0;

  return (
    <section
      aria-live="polite"
      aria-label="Viewing time availability update"
      className="border border-[#B6AF9D] bg-[#FDFAF0] p-5 sm:p-8 space-y-6"
    >
      <div className="flex items-start gap-3">
        <CalendarClock
          className="w-5 h-5 text-[#57482D] shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#57482D]">
            Requested Time Unavailable
          </p>
          <p className="text-sm sm:text-base text-[#151513] leading-relaxed">
            {response.message}
          </p>
        </div>
      </div>

      {hasSlots ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#151513]">
            Select an available alternative below to update your request and verify with
            our scheduling team:
          </p>

          <div
            role="radiogroup"
            aria-label="Available alternative viewing slots"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
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
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#B6AF9D]/55">
              <p className="text-xs text-[#534F46]">
                Selecting a slot updates your requested date and time. Final confirmation
                is verified upon submission.
              </p>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onConfirmSelectedSlot}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[46px] px-6 py-3 text-sm font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] disabled:opacity-60 transition-colors rounded-sm whitespace-nowrap shrink-0"
              >
                {isSubmitting ? 'Verifying Slot...' : 'Submit Selected Alternative'}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#534F46] pt-2 border-t border-[#B6AF9D]/45">
          No preset alternative times were returned. Please choose a different date and
          time in the form below and submit again.
        </p>
      )}
    </section>
  );
}
