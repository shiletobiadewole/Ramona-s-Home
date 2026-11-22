import { useMemo, useRef } from 'react';

function extractNanpLocalDigits(raw: string): string {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');

  // Strip leading country code '1' if '+1' was typed/pasted or if 11+ digits begin with '1'
  if (trimmed.startsWith('+1') && digits.startsWith('1')) {
    digits = digits.slice(1);
  } else if (digits.length >= 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

function formatNanpDigits(digits: string): string {
  const d = digits.slice(0, 10);
  if (!d) {
    return '';
  }
  if (d.length <= 3) {
    return d;
  }
  if (d.length <= 6) {
    return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  }
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

function caretPositionForDigitIndex(formatted: string, targetDigitCount: number): number {
  if (targetDigitCount <= 0) {
    return 0;
  }
  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) {
      seen += 1;
      if (seen === targetDigitCount) {
        return i + 1;
      }
    }
  }
  return formatted.length;
}

interface PhoneInputFieldProps {
  id: string;
  value: string;
  hasError?: boolean;
  ariaDescribedBy?: string;
  onChange: (formattedInternationalPhone: string) => void;
}

export function PhoneInputField({
  id,
  value,
  hasError = false,
  ariaDescribedBy,
  onChange,
}: PhoneInputFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const localDigits = useMemo(() => extractNanpLocalDigits(value), [value]);
  const formattedLocal = useMemo(() => formatNanpDigits(localDigits), [localDigits]);

  const emitNormalized = (digits: string) => {
    if (!digits) {
      onChange('');
      return;
    }
    onChange(`+1 ${formatNanpDigits(digits)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const selectionStart = e.target.selectionStart ?? rawValue.length;

    const trimmed = rawValue.trim();
    const hasExplicitCountryPrefix =
      trimmed.startsWith('+1') ||
      (rawValue.replace(/\D/g, '').length === 11 && rawValue.replace(/\D/g, '').startsWith('1'));

    const nextDigits = extractNanpLocalDigits(rawValue);
    const nextFormatted = formatNanpDigits(nextDigits);

    emitNormalized(nextDigits);

    if (hasExplicitCountryPrefix) {
      window.requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(nextFormatted.length, nextFormatted.length);
        }
      });
      return;
    }

    const digitsBeforeCaret = rawValue
      .slice(0, selectionStart)
      .replace(/\D/g, '').length;

    window.requestAnimationFrame(() => {
      if (inputRef.current) {
        const nextPos = caretPositionForDigitIndex(
          nextFormatted,
          Math.min(digitsBeforeCaret, nextDigits.length)
        );
        inputRef.current.setSelectionRange(nextPos, nextPos);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputRef.current) {
      const start = inputRef.current.selectionStart ?? 0;
      const end = inputRef.current.selectionEnd ?? 0;
      if (start === end && start > 0) {
        const charBefore = formattedLocal[start - 1];
        if (charBefore && !/\d/.test(charBefore)) {
          e.preventDefault();
          const digitsBefore = formattedLocal
            .slice(0, start)
            .replace(/\D/g, '').length;
          if (digitsBefore > 0) {
            const updatedDigits =
              localDigits.slice(0, digitsBefore - 1) +
              localDigits.slice(digitsBefore);
            const updatedFormatted = formatNanpDigits(updatedDigits);
            emitNormalized(updatedDigits);
            window.requestAnimationFrame(() => {
              if (inputRef.current) {
                const nextPos = caretPositionForDigitIndex(
                  updatedFormatted,
                  digitsBefore - 1
                );
                inputRef.current.setSelectionRange(nextPos, nextPos);
              }
            });
          }
        }
      }
    }
  };

  return (
    <div
      className={`w-full min-w-0 h-12 flex items-stretch bg-white border rounded-sm transition-colors focus-within:ring-2 focus-within:ring-[#57482D]/25 ${
        hasError
          ? 'border-[#9B1C1C] focus-within:border-[#9B1C1C]'
          : 'border-[#B6AF9D] focus-within:border-[#57482D]'
      }`}
    >
      {/* Non-interactive static +1 prefix for Canada & US */}
      <span
        aria-hidden="true"
        className="h-full px-3.5 inline-flex items-center border-r border-[#B6AF9D]/60 bg-[#FDFAF0]/80 text-sm font-medium text-[#151513] tabular-nums select-none shrink-0 rounded-l-sm"
      >
        +1
      </span>

      <input
        ref={inputRef}
        id={id}
        name={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        value={formattedLocal}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="(416) 555-0199"
        className="flex-1 min-w-0 h-full px-3.5 text-sm sm:text-base bg-transparent text-[#151513] placeholder:text-[#878276] tabular-nums focus:outline-none rounded-r-sm"
      />
    </div>
  );
}
