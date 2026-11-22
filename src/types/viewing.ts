import type { PropertyCategory } from './property';

export type CityLocation = 'Toronto' | 'Vancouver' | 'Montreal' | 'Calgary';

export const CITY_LOCATIONS: readonly CityLocation[] = [
  'Toronto',
  'Vancouver',
  'Montreal',
  'Calgary',
] as const;

export const CITY_TIMEZONE_MAP: Record<CityLocation, string> = {
  Toronto: 'America/Toronto',
  Montreal: 'America/Toronto',
  Calgary: 'America/Edmonton',
  Vancouver: 'America/Vancouver',
};

export const BUILDING_TYPE_OPTIONS: readonly PropertyCategory[] = [
  'Plexes',
  'Laneway Houses & Garden Suites',
  'Movable Houses',
] as const;

export interface PropertyContext {
  propertyId: string | null;
  propertyName: string | null;
  propertyCategory: PropertyCategory | null;
}

export interface ViewingFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  buildingTypes: PropertyCategory[];
  viewingDate: string; // YYYY-MM-DD in selected city's timezone
  viewingTime: string; // HH:mm in selected city's timezone
  budget: string;
  location: CityLocation | '';
  moreRequests: string;
}

export type ViewingFormErrors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'buildingTypes'
    | 'viewingDateTime'
    | 'budget'
    | 'location',
    string
  >
>;

export interface ViewingRequestPayload {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  buildingTypes: PropertyCategory[];
  viewingDateTime: string;
  viewingDate: string;
  viewingTime: string;
  viewingDateFormatted: string;
  viewingTimeFormatted: string;
  budget: number;
  location: CityLocation;
  moreRequests: string;
  propertyId: string | null;
  propertyName: string | null;
  propertyCategory: PropertyCategory | null;
  timezone: string;
}

export interface AvailableSlot {
  dateTime: string;
  label: string;
  timezone: string;
}

export interface UnavailableResponse {
  status: 'unavailable';
  message: string;
  availableSlots: AvailableSlot[];
}

export interface SuccessResponse {
  status: 'success';
  message: string;
  reference?: string;
  confirmation?: string;
}

export type WebhookErrorCode =
  | 'CONFIG_MISSING'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'INVALID_JSON'
  | 'SCHEMA_MISMATCH'
  | 'WORKFLOW_ERROR';

export interface ErrorResponse {
  status: 'error';
  code: WebhookErrorCode;
  message: string;
  details?: string;
}

export type ParsedWebhookResponse =
  | UnavailableResponse
  | SuccessResponse
  | ErrorResponse;
