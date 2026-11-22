import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface TimePickerFieldProps {
  id: string;
  value: string; // HH:mm (24h)
  minTime?: string; // HH:mm (24h) when date is today
  hasError?: boolean;
  ariaDescribedBy?: string;
  onChange: (timeStr: string) => void;
}

type PeriodFilter = 'all' | 'morning' | 'afternoon' | 'evening';

interface TimeOption {
  value: string; // HH:mm
  label: string; // e.g. 9:30 AM
  period: Exclude<PeriodFilter, 'all'>;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatTimeDisplay(hhmm: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) {
    return '';
  }
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) {
    return '';
  }
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${pad2(minute)} ${suffix}`;
}

function buildTimeSlots(): TimeOption[] {
  const slots: TimeOption[] = [];
  // 8:00 AM through 8:00 PM in 30-minute increments
  for (let hour = 8; hour <= 20; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 20 && minute === 30) {
        continue;
      }
      const value = `${pad2(hour)}:${pad2(minute)}`;
      const period: TimeOption['period'] =
        hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      slots.push({
        value,
        label: formatTimeDisplay(value),
        period,
      });
    }
  }
  return slots;
}

const ALL_TIME_SLOTS = buildTimeSlots();

const PERIOD_TABS: { key: PeriodFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
];

export function TimePickerField({
  id,
  value,
  minTime,
  hasError = false,
  ariaDescribedBy,
  onChange,
}: TimePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Custom exact time state inside popover
  const [customHour12, setCustomHour12] = useState('10');
  const [customMinute, setCustomMinute] = useState('00');
  const [customAmPm, setCustomAmPm] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (value) {
      const match = /^(\d{2}):(\d{2})$/.exec(value);
      if (match) {
        const h24 = Number(match[1]);
        const min = match[2];
        const ampm: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
        const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
        setCustomHour12(String(h12));
        setCustomMinute(min);
        setCustomAmPm(ampm);
      }
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const visibleSlots = useMemo(() => {
    if (periodFilter === 'all') {
      return ALL_TIME_SLOTS;
    }
    return ALL_TIME_SLOTS.filter((slot) => slot.period === periodFilter);
  }, [periodFilter]);

  const displayText = value ? formatTimeDisplay(value) : '';

  const applyCustomTime = () => {
    let h24 = Number(customHour12) % 12;
    if (customAmPm === 'PM') {
      h24 += 12;
    }
    const candidate = `${pad2(h24)}:${customMinute}`;
    if (minTime && candidate < minTime) {
      return;
    }
    onChange(candidate);
    setIsOpen(false);
  };

  const customCandidate24 = useMemo(() => {
    let h24 = Number(customHour12) % 12;
    if (customAmPm === 'PM') {
      h24 += 12;
    }
    return `${pad2(h24)}:${customMinute}`;
  }, [customHour12, customMinute, customAmPm]);

  const isCustomDisabled = Boolean(minTime && customCandidate24 < minTime);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-w-0 h-12 px-4 flex items-center justify-between gap-3 bg-white border rounded-sm text-sm sm:text-base text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#57482D]/25 ${
          hasError
            ? 'border-[#9B1C1C] focus:border-[#9B1C1C]'
            : isOpen
            ? 'border-[#57482D] ring-2 ring-[#57482D]/20'
            : 'border-[#B6AF9D] hover:border-[#57482D]'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Clock
            className="w-4 h-4 shrink-0 text-[#57482D]"
            aria-hidden="true"
          />
          <span
            className={`truncate tabular-nums ${
              displayText ? 'text-[#151513] font-medium' : 'text-[#534F46]'
            }`}
          >
            {displayText || 'Select your time'}
          </span>
        </span>

        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#57482D] transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Select your viewing time"
          className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-[360px] z-40 mt-2 bg-white border border-[#B6AF9D] shadow-xl rounded-sm overflow-hidden"
        >
          {/* Header + Period Tabs */}
          <div className="px-4 py-3 bg-[#FCF0D8] border-b border-[#B6AF9D]/55 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#57482D]">
                Select Your Time
              </span>
              {displayText && (
                <span className="text-xs font-semibold text-[#151513] tabular-nums">
                  Current: {displayText}
                </span>
              )}
            </div>

            <div
              role="tablist"
              aria-label="Filter times by part of day"
              className="grid grid-cols-4 gap-1.5"
            >
              {PERIOD_TABS.map((tab) => {
                const active = periodFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPeriodFilter(tab.key)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-sm transition-colors ${
                      active
                        ? 'bg-[#57482D] text-[#FDFAF0]'
                        : 'bg-white/80 text-[#534F46] hover:bg-white hover:text-[#151513]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Time Slot Grid */}
          <div className="p-3.5 max-h-60 overflow-y-auto grid grid-cols-3 gap-2">
            {visibleSlots.map((slot) => {
              const isDisabled = Boolean(minTime && slot.value < minTime);
              const isSelected = value === slot.value;

              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  onClick={() => {
                    onChange(slot.value);
                    setIsOpen(false);
                  }}
                  className={`py-2.5 px-2 text-xs sm:text-sm rounded-sm border tabular-nums transition-colors ${
                    isDisabled
                      ? 'border-[#B6AF9D]/30 bg-[#FDFAF0]/50 text-[#B6AF9D] cursor-not-allowed line-through'
                      : isSelected
                      ? 'border-[#57482D] bg-[#57482D] text-[#FDFAF0] font-semibold'
                      : 'border-[#B6AF9D]/60 bg-[#FDFAF0]/60 text-[#151513] hover:border-[#57482D] hover:bg-[#FCF0D8] hover:text-[#57482D]'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          {/* Exact Custom Time Picker */}
          <div className="px-3.5 py-3 bg-[#FDFAF0] border-t border-[#B6AF9D]/50 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#534F46]">
              Or Set Exact Time
            </p>
            <div className="flex items-center gap-2">
              <select
                aria-label="Hour"
                value={customHour12}
                onChange={(e) => setCustomHour12(e.target.value)}
                className="h-9 px-2 text-xs bg-white border border-[#B6AF9D] rounded-sm text-[#151513] tabular-nums focus:outline-none focus:border-[#57482D]"
              >
                {Array.from({ length: 12 }, (_, idx) => String(idx + 1)).map(
                  (hr) => (
                    <option key={hr} value={hr}>
                      {hr}
                    </option>
                  )
                )}
              </select>

              <span className="text-xs font-semibold text-[#534F46]">:</span>

              <select
                aria-label="Minute"
                value={customMinute}
                onChange={(e) => setCustomMinute(e.target.value)}
                className="h-9 px-2 text-xs bg-white border border-[#B6AF9D] rounded-sm text-[#151513] tabular-nums focus:outline-none focus:border-[#57482D]"
              >
                {['00', '15', '30', '45'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                aria-label="AM or PM"
                value={customAmPm}
                onChange={(e) => setCustomAmPm(e.target.value as 'AM' | 'PM')}
                className="h-9 px-2 text-xs bg-white border border-[#B6AF9D] rounded-sm text-[#151513] focus:outline-none focus:border-[#57482D]"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>

              <button
                type="button"
                disabled={isCustomDisabled}
                onClick={applyCustomTime}
                className="ml-auto h-9 px-3.5 text-xs font-medium rounded-sm bg-[#57482D] text-[#FDFAF0] hover:bg-[#423620] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
