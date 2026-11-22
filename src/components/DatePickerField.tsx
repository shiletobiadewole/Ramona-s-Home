import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerFieldProps {
  id: string;
  value: string; // YYYY-MM-DD
  minDate: string; // YYYY-MM-DD
  hasError?: boolean;
  ariaDescribedBy?: string;
  onChange: (dateStr: string) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function parseYmd(ymd: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function formatDisplayDate(ymd: string): string {
  const parts = parseYmd(ymd);
  if (!parts) {
    return '';
  }
  const utcDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(utcDate);
}

export function DatePickerField({
  id,
  value,
  minDate,
  hasError = false,
  ariaDescribedBy,
  onChange,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const initialAnchor = useMemo(
    () => parseYmd(value) ?? parseYmd(minDate) ?? { year: 2026, month: 11, day: 1 },
    [value, minDate]
  );

  const [viewYear, setViewYear] = useState(initialAnchor.year);
  const [viewMonth, setViewMonth] = useState(initialAnchor.month); // 1-12

  useEffect(() => {
    const anchor = parseYmd(value) ?? parseYmd(minDate);
    if (anchor && isOpen) {
      setViewYear(anchor.year);
      setViewMonth(anchor.month);
    }
  }, [isOpen, value, minDate]);

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

  const minParts = parseYmd(minDate);
  const canGoPrevMonth = useMemo(() => {
    if (!minParts) {
      return true;
    }
    return (
      viewYear > minParts.year ||
      (viewYear === minParts.year && viewMonth > minParts.month)
    );
  }, [viewYear, viewMonth, minParts]);

  const handlePrevMonth = () => {
    if (!canGoPrevMonth) {
      return;
    }
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const monthTitle = useMemo(() => {
    const dt = new Date(Date.UTC(viewYear, viewMonth - 1, 1));
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      month: 'long',
      year: 'numeric',
    }).format(dt);
  }, [viewYear, viewMonth]);

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(Date.UTC(viewYear, viewMonth - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
    const cells: ({ day: number; ymd: string; label: string } | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const ymd = `${viewYear}-${pad2(viewMonth)}-${pad2(day)}`;
      cells.push({
        day,
        ymd,
        label: formatDisplayDate(ymd),
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const displayText = value ? formatDisplayDate(value) : '';

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
        <span
          className={`truncate ${
            displayText ? 'text-[#151513] font-medium' : 'text-[#878276]'
          }`}
        >
          {displayText || 'Select your date'}
        </span>
        <Calendar
          className="w-4 h-4 shrink-0 text-[#57482D]"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose viewing date"
          className="absolute left-0 right-0 sm:right-auto sm:w-[336px] z-40 mt-2 bg-white border border-[#B6AF9D] shadow-xl rounded-sm overflow-hidden"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FCF0D8] border-b border-[#B6AF9D]/55">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoPrevMonth}
              aria-label="Previous month"
              className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-[#151513] hover:bg-[#57482D] hover:text-[#FDFAF0] disabled:opacity-35 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <span className="text-sm font-semibold text-[#151513]">
              {monthTitle}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-[#151513] hover:bg-[#57482D] hover:text-[#FDFAF0] transition-colors"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-semibold uppercase tracking-wider text-[#534F46] py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <span key={`empty-${idx}`} aria-hidden="true" />;
              }

              const isDisabled = Boolean(minDate && cell.ymd < minDate);
              const isSelected = cell.ymd === value;
              const isToday = cell.ymd === minDate;

              return (
                <button
                  key={cell.ymd}
                  type="button"
                  disabled={isDisabled}
                  aria-label={cell.label}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => {
                    onChange(cell.ymd);
                    setIsOpen(false);
                  }}
                  className={`h-9 w-full rounded-sm text-xs sm:text-sm tabular-nums transition-colors flex items-center justify-center ${
                    isDisabled
                      ? 'text-[#B6AF9D]/70 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#57482D] text-[#FDFAF0] font-semibold'
                      : isToday
                      ? 'bg-[#FCF0D8] text-[#151513] font-semibold border border-[#57482D]/45 hover:bg-[#57482D] hover:text-[#FDFAF0]'
                      : 'text-[#151513] hover:bg-[#FCF0D8] hover:text-[#57482D]'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#FDFAF0] border-t border-[#B6AF9D]/45 text-xs">
            <button
              type="button"
              onClick={() => {
                if (minParts) {
                  setViewYear(minParts.year);
                  setViewMonth(minParts.month);
                }
              }}
              className="font-semibold text-[#57482D] hover:text-[#423620] transition-colors"
            >
              Jump to Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-medium text-[#534F46] hover:text-[#151513] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
