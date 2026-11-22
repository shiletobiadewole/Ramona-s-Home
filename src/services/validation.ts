import {
  CITY_LOCATIONS,
  CITY_TIMEZONE_MAP,
  type CityLocation,
  type ViewingFormErrors,
  type ViewingFormValues,
} from '../types/viewing';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED_CHARS_REGEX = /^[+\d\s().-]+$/;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

interface WallClockParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getWallClockParts(date: Date, timeZone: string): WallClockParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === '24' ? '0' : map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

export function getCityTimezone(location: CityLocation | ''): string {
  if (!location) {
    return 'America/Toronto';
  }
  return CITY_TIMEZONE_MAP[location];
}

export function getCurrentDateStringInTimezone(timeZone: string): string {
  const parts = getWallClockParts(new Date(), timeZone);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function getCurrentTimeStringInTimezone(timeZone: string): string {
  const parts = getWallClockParts(new Date(), timeZone);
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

/**
 * Resolves a wall-clock YYYY-MM-DD and HH:mm in a given IANA timezone into
 * an exact UTC timestamp (ms) and an unambiguous ISO 8601 string with numeric offset.
 */
export function resolveDateTimeInTimezone(
  dateStr: string,
  timeStr: string,
  timeZone: string
): { utcMs: number; isoString: string } | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  // Initial UTC approximation
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  // Two-pass adjustment accurately handles DST boundaries
  for (let i = 0; i < 2; i += 1) {
    const rendered = getWallClockParts(new Date(utcMs), timeZone);
    const renderedAsUtc = Date.UTC(
      rendered.year,
      rendered.month - 1,
      rendered.day,
      rendered.hour,
      rendered.minute,
      rendered.second
    );
    const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    utcMs += desiredAsUtc - renderedAsUtc;
  }

  // Compute final offset at resolved UTC instant
  const finalWall = getWallClockParts(new Date(utcMs), timeZone);
  // Check that calendar date wasn't rolled over (e.g., Feb 30)
  if (
    finalWall.year !== year ||
    finalWall.month !== month ||
    finalWall.day !== day
  ) {
    return null;
  }

  const finalWallAsUtc = Date.UTC(
    finalWall.year,
    finalWall.month - 1,
    finalWall.day,
    finalWall.hour,
    finalWall.minute,
    finalWall.second
  );
  const offsetMinutes = Math.round((finalWallAsUtc - utcMs) / 60000);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offH = pad2(Math.floor(absOffset / 60));
  const offM = pad2(absOffset % 60);

  const isoString = `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(
    minute
  )}:00${sign}${offH}:${offM}`;

  return { utcMs, isoString };
}

/**
 * Converts an ISO 8601 dateTime string (e.g., returned by n8n availableSlots)
 * into wall-clock YYYY-MM-DD and HH:mm in the specified IANA timezone.
 */
export function extractDateAndTimeFromIso(
  isoDateTime: string,
  timeZone: string
): { date: string; time: string } | null {
  const parsed = new Date(isoDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const parts = getWallClockParts(parsed, timeZone);
  return {
    date: `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`,
    time: `${pad2(parts.hour)}:${pad2(parts.minute)}`,
  };
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function normalizeNorthAmericanPhoneDigits(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed || !PHONE_ALLOWED_CHARS_REGEX.test(trimmed)) {
    return null;
  }
  let digitsOnly = trimmed.replace(/\D/g, '');
  if ((trimmed.startsWith('+1') || digitsOnly.length === 11) && digitsOnly.startsWith('1')) {
    digitsOnly = digitsOnly.slice(1);
  }
  if (digitsOnly.length !== 10) {
    return null;
  }
  return digitsOnly;
}

export function isValidInternationalPhone(phone: string): boolean {
  return normalizeNorthAmericanPhoneDigits(phone) !== null;
}

export function parseBudgetValue(rawBudget: string): number | null {
  const cleaned = rawBudget.replace(/,/g, '').trim();
  if (!cleaned) {
    return null;
  }
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }
  return num;
}

export function validateViewingForm(values: ViewingFormValues): ViewingFormErrors {
  const errors: ViewingFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'Please enter your first name.';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'Please enter your last name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address (for example, name@domain.com).';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Please enter your 10-digit phone number.';
  } else if (!isValidInternationalPhone(values.phone)) {
    errors.phone = 'Please enter a valid 10-digit Canadian or US phone number.';
  }

  if (!values.buildingTypes || values.buildingTypes.length === 0) {
    errors.buildingTypes = 'Please select at least one building type.';
  }

  if (!values.location || !CITY_LOCATIONS.includes(values.location)) {
    errors.location = 'Please select a city.';
  }

  const applicableTimeZone = getCityTimezone(values.location);

  if (!values.viewingDate || !values.viewingTime) {
    errors.viewingDateTime = 'Please select both a preferred viewing date and time.';
  } else {
    const resolved = resolveDateTimeInTimezone(
      values.viewingDate,
      values.viewingTime,
      applicableTimeZone
    );
    if (!resolved) {
      errors.viewingDateTime = 'Please provide a valid calendar date and time.';
    } else if (resolved.utcMs <= Date.now()) {
      errors.viewingDateTime =
        'Preferred viewing date and time must be in the future for the selected city.';
    }
  }

  const parsedBudget = parseBudgetValue(values.budget);
  if (parsedBudget === null) {
    errors.budget = 'Please enter a valid budget greater than zero.';
  }

  return errors;
}
