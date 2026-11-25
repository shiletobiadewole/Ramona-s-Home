import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Building2, Check, Globe, Loader2, X } from 'lucide-react';
import type { PropertyCategory } from '../types/property';
import {
  BUILDING_TYPE_OPTIONS,
  CITY_LOCATIONS,
  type AvailableSlot,
  type CityLocation,
  type ErrorResponse,
  type PropertyContext,
  type SuccessResponse,
  type UnavailableResponse,
  type ViewingFormErrors,
  type ViewingFormValues,
  type ViewingRequestPayload,
} from '../types/viewing';
import {
  extractDateAndTimeFromIso,
  getCityTimezone,
  getCurrentDateStringInTimezone,
  getCurrentTimeStringInTimezone,
  parseBudgetValue,
  resolveDateTimeInTimezone,
  validateViewingForm,
} from '../services/validation';
import { submitViewingRequest } from '../services/webhook';
import { FormField } from './FormField';
import { AvailabilitySlots } from './AvailabilitySlots';
import { SubmissionStatus } from './SubmissionStatus';
import { DatePickerField } from './DatePickerField';
import { formatTimeDisplay, TimePickerField } from './TimePickerField';
import { PhoneInputField } from './PhoneInputField';

interface ViewingFormProps {
  initialPropertyContext: PropertyContext;
  onClearPropertyContext: () => void;
}

function createInitialValues(context: PropertyContext): ViewingFormValues {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    buildingTypes: context.propertyCategory ? [context.propertyCategory] : [],
    viewingDate: '',
    viewingTime: '',
    budget: '',
    location: '',
    moreRequests: '',
  };
}

export function ViewingForm({
  initialPropertyContext,
  onClearPropertyContext,
}: ViewingFormProps) {
  const [values, setValues] = useState<ViewingFormValues>(() =>
    createInitialValues(initialPropertyContext)
  );
  const [errors, setErrors] = useState<ViewingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [unavailableResponse, setUnavailableResponse] =
    useState<UnavailableResponse | null>(null);
  const [notificationRevision, setNotificationRevision] = useState(0);
  const [selectedSlotDateTime, setSelectedSlotDateTime] = useState<string | null>(
    null
  );
  const [successResponse, setSuccessResponse] = useState<SuccessResponse | null>(
    null
  );
  const [errorResponse, setErrorResponse] = useState<ErrorResponse | null>(null);

  const statusContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPropertyContext.propertyCategory) {
      const cat = initialPropertyContext.propertyCategory;
      setValues((prev) =>
        prev.buildingTypes.includes(cat)
          ? prev
          : { ...prev, buildingTypes: [...prev.buildingTypes, cat] }
      );
    }
  }, [initialPropertyContext.propertyCategory]);

  const applicableTimezone = useMemo(
    () => getCityTimezone(values.location),
    [values.location]
  );

  const minCityDate = useMemo(
    () => getCurrentDateStringInTimezone(applicableTimezone),
    [applicableTimezone]
  );

  const minCityTime = useMemo(() => {
    if (!values.viewingDate || values.viewingDate !== minCityDate) {
      return undefined;
    }
    return getCurrentTimeStringInTimezone(applicableTimezone);
  }, [values.viewingDate, minCityDate, applicableTimezone]);

  const updateField = <K extends keyof ViewingFormValues>(
    field: K,
    value: ViewingFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (field === 'viewingDate' || field === 'viewingTime') {
      setErrors((prev) => ({ ...prev, viewingDateTime: undefined }));
      setSelectedSlotDateTime(null);
    } else if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleBuildingType = (category: PropertyCategory) => {
    setValues((prev) => {
      const exists = prev.buildingTypes.includes(category);
      const next = exists
        ? prev.buildingTypes.filter((item) => item !== category)
        : [...prev.buildingTypes, category];
      return { ...prev, buildingTypes: next };
    });
    setErrors((prev) => ({ ...prev, buildingTypes: undefined }));
  };

  const executeSubmission = async (overrideValues?: ViewingFormValues) => {
    if (isSubmitting) {
      return;
    }

    const activeValues = overrideValues ?? values;
    const validationErrors = validateViewingForm(activeValues);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorResponse(null);
      const firstErrorKey = Object.keys(validationErrors)[0];
      const fieldIdMap: Record<string, string> = {
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email',
        phone: 'phone',
        buildingTypes: 'buildingType-0',
        location: 'location',
        viewingDateTime: 'viewingDate',
        budget: 'budget',
      };
      const targetId = fieldIdMap[firstErrorKey];
      if (targetId) {
        document.getElementById(targetId)?.focus();
      }
      return;
    }

    const selectedCity = activeValues.location as CityLocation;
    const cityTimezone = getCityTimezone(selectedCity);
    const resolvedDateTime = resolveDateTimeInTimezone(
      activeValues.viewingDate,
      activeValues.viewingTime,
      cityTimezone
    );
    const numericBudget = parseBudgetValue(activeValues.budget);

    if (!resolvedDateTime || numericBudget === null) {
      setErrors(validateViewingForm(activeValues));
      return;
    }

    const trimmedFirstName = activeValues.firstName.trim();
    const trimmedLastName = activeValues.lastName.trim();
    const viewingDateFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone: cityTimezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(resolvedDateTime.utcMs));
    const viewingTimeFormatted =
      formatTimeDisplay(activeValues.viewingTime) || activeValues.viewingTime;

    const payload: ViewingRequestPayload = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      fullName: `${trimmedFirstName} ${trimmedLastName}`,
      email: activeValues.email.trim(),
      phone: activeValues.phone,
      buildingTypes: activeValues.buildingTypes,
      viewingDateTime: resolvedDateTime.isoString,
      viewingDate: activeValues.viewingDate,
      viewingTime: activeValues.viewingTime,
      viewingDateFormatted,
      viewingTimeFormatted,
      budget: numericBudget,
      location: selectedCity,
      moreRequests: activeValues.moreRequests.trim(),
      propertyId: initialPropertyContext.propertyId,
      propertyName: initialPropertyContext.propertyName,
      propertyCategory: initialPropertyContext.propertyCategory,
      timezone: cityTimezone,
    };

    setIsSubmitting(true);
    setErrorResponse(null);
    setErrors({});

    const result = await submitViewingRequest(payload);
    setIsSubmitting(false);

    if (result.status === 'success') {
      setSuccessResponse(result);
      setUnavailableResponse(null);
      setSelectedSlotDateTime(null);
      setValues(createInitialValues(initialPropertyContext));
    } else if (result.status === 'unavailable') {
      setUnavailableResponse(result);
      setNotificationRevision((prev) => prev + 1);
      setSuccessResponse(null);
      setSelectedSlotDateTime(null);
    } else {
      setErrorResponse(result);
      setSuccessResponse(null);
    }

    window.setTimeout(() => {
      statusContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 60);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void executeSubmission();
  };

  const handleSelectAlternativeSlot = (slot: AvailableSlot) => {
    setSelectedSlotDateTime(slot.dateTime);
    const targetTz = values.location
      ? getCityTimezone(values.location)
      : slot.timezone;
    const extracted = extractDateAndTimeFromIso(slot.dateTime, targetTz);
    if (extracted) {
      setValues((prev) => ({
        ...prev,
        viewingDate: extracted.date,
        viewingTime: extracted.time,
      }));
      setErrors((prev) => ({ ...prev, viewingDateTime: undefined }));
    }
  };

  const handleConfirmAlternative = () => {
    void executeSubmission(values);
  };

  const handleResetSuccess = () => {
    setSuccessResponse(null);
    setUnavailableResponse(null);
    setErrorResponse(null);
    setSelectedSlotDateTime(null);
  };

  const inputClassName = (hasError?: string) =>
    `w-full min-w-0 h-12 px-4 text-sm sm:text-base bg-white border rounded-sm text-[#151513] placeholder:text-[#878276] transition-colors focus:outline-none focus:ring-2 focus:ring-[#57482D]/25 ${
      hasError
        ? 'border-[#9B1C1C] focus:border-[#9B1C1C]'
        : 'border-[#B6AF9D] focus:border-[#57482D]'
    }`;

  if (successResponse) {
    return (
      <div ref={statusContainerRef}>
        <SubmissionStatus
          success={successResponse}
          onResetSuccess={handleResetSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Property Context Banner when navigated from a Property Details page */}
      {initialPropertyContext.propertyName && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-[#B6AF9D] bg-[#FDFAF0]">
          <div className="flex items-start gap-3">
            <Building2
              className="w-5 h-5 text-[#57482D] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#57482D]">
                Selected Property Reference
              </p>
              <p className="text-base font-medium text-[#151513] mt-0.5">
                {initialPropertyContext.propertyName}
                {initialPropertyContext.propertyCategory
                  ? ` · ${initialPropertyContext.propertyCategory}`
                  : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClearPropertyContext}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#534F46] hover:text-[#151513] self-start sm:self-center shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Clear property
          </button>
        </div>
      )}

      {/* Dynamic Response Banner (Unavailable Slots or Error) */}
      <div ref={statusContainerRef} className="space-y-6">
        {errorResponse && <SubmissionStatus error={errorResponse} />}

        {unavailableResponse && (
          <AvailabilitySlots
            key={notificationRevision}
            response={unavailableResponse}
            selectedSlotDateTime={selectedSlotDateTime}
            onSelectSlot={handleSelectAlternativeSlot}
            onConfirmSelectedSlot={handleConfirmAlternative}
            onDismiss={() => {
              setUnavailableResponse(null);
              setSelectedSlotDateTime(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Personal Contact Details — aligned 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <FormField
            id="firstName"
            label="First Name"
            required
            error={errors.firstName}
          >
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              value={values.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="Enter your first name"
              className={inputClassName(errors.firstName)}
            />
          </FormField>

          <FormField
            id="lastName"
            label="Last Name"
            required
            error={errors.lastName}
          >
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              value={values.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Enter your last name"
              className={inputClassName(errors.lastName)}
            />
          </FormField>

          <FormField
            id="email"
            label="Email Address"
            required
            hint="We’ll send viewing confirmations and schedule updates here."
            error={errors.email}
          >
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'email-error email-hint' : 'email-hint'
              }
              value={values.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="name@example.com"
              className={inputClassName(errors.email)}
            />
          </FormField>

          <FormField
            id="phone"
            label="Phone Number (Canada & US)"
            required
            hint="10-digit number, no +1 needed. We’ll use this for viewing updates."
            error={errors.phone}
          >
            <PhoneInputField
              id="phone"
              value={values.phone}
              hasError={Boolean(errors.phone)}
              ariaDescribedBy={
                errors.phone ? 'phone-error phone-hint' : 'phone-hint'
              }
              onChange={(val) => updateField('phone', val)}
            />
          </FormField>
        </div>

        {/* Building Type Checkbox Group */}
        <fieldset
          aria-describedby={
            errors.buildingTypes ? 'buildingTypes-error' : undefined
          }
          className="space-y-3 pt-6 border-t border-[#B6AF9D]/45"
        >
          <legend className="text-sm font-medium text-[#151513]">
            Building Type
            <span className="ml-1 text-[#57482D]" aria-hidden="true">
              *
            </span>
          </legend>
          <p className="text-xs text-[#534F46]">
            Select one or more architectural property types you wish to explore.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {BUILDING_TYPE_OPTIONS.map((category, idx) => {
              const checked = values.buildingTypes.includes(category);
              return (
                <label
                  key={category}
                  htmlFor={`buildingType-${idx}`}
                  className={`flex items-center gap-3 h-full min-h-[54px] p-4 border cursor-pointer transition-colors duration-150 rounded-sm ${
                    checked
                      ? 'border-[#57482D] bg-[#57482D]/[0.06] text-[#151513]'
                      : 'border-[#B6AF9D] bg-white text-[#151513] hover:border-[#151513]'
                  }`}
                >
                  <input
                    id={`buildingType-${idx}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBuildingType(category)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`w-4 h-4 shrink-0 rounded-xs border flex items-center justify-center transition-colors ${
                      checked
                        ? 'bg-[#57482D] border-[#57482D] text-[#FDFAF0]'
                        : 'bg-white border-[#878276]'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                  </span>
                  <span className="text-sm font-medium leading-snug">
                    {category}
                  </span>
                </label>
              );
            })}
          </div>

          {errors.buildingTypes && (
            <p
              id="buildingTypes-error"
              role="alert"
              className="flex items-start gap-2 text-xs sm:text-sm font-medium text-[#9B1C1C]"
            >
              <AlertCircle
                className="w-4 h-4 shrink-0 mt-0.5 text-[#9B1C1C]"
                aria-hidden="true"
              />
              <span>{errors.buildingTypes}</span>
            </p>
          )}
        </fieldset>

        {/* Location & Budget — aligned 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-6 border-t border-[#B6AF9D]/45">
          <FormField
            id="location"
            label="Location"
            required
            hint={
              values.location
                ? `Viewing times use local city timezone: ${applicableTimezone}`
                : 'Select a city to set the applicable viewing timezone.'
            }
            error={errors.location}
          >
            <select
              id="location"
              name="location"
              required
              aria-invalid={Boolean(errors.location)}
              aria-describedby={
                errors.location
                  ? 'location-error location-hint'
                  : 'location-hint'
              }
              value={values.location}
              onChange={(e) =>
                updateField('location', e.target.value as CityLocation | '')
              }
              className={inputClassName(errors.location)}
            >
              <option value="">Select a city</option>
              {CITY_LOCATIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            id="budget"
            label="Budget"
            required
            hint="Enter your target budget as a positive numeric amount."
            error={errors.budget}
          >
            <input
              id="budget"
              name="budget"
              type="number"
              inputMode="decimal"
              min="1"
              step="any"
              required
              aria-invalid={Boolean(errors.budget)}
              aria-describedby={
                errors.budget ? 'budget-error budget-hint' : 'budget-hint'
              }
              value={values.budget}
              onChange={(e) => updateField('budget', e.target.value)}
              placeholder="e.g. 950000"
              className={`${inputClassName(errors.budget)} tabular-nums`}
            />
          </FormField>
        </div>

        {/* Viewing Date & Time — aligned 2-column grid */}
        <div className="pt-6 border-t border-[#B6AF9D]/45 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-[#151513]">
                Preferred Viewing Date &amp; Time
                <span className="ml-1 text-[#57482D]" aria-hidden="true">
                  *
                </span>
              </h2>
              <p className="mt-1 text-xs text-[#534F46]">
                A selected time represents your preferred request and is subject to
                availability confirmation.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#534F46] shrink-0">
              <Globe className="w-3.5 h-3.5 text-[#57482D]" aria-hidden="true" />
              <span>
                {values.location
                  ? `${values.location} (${applicableTimezone})`
                  : `Default: ${applicableTimezone}`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <FormField
              id="viewingDate"
              label="Viewing Date"
              required
              error={undefined}
            >
              <DatePickerField
                id="viewingDate"
                value={values.viewingDate}
                minDate={minCityDate}
                hasError={Boolean(errors.viewingDateTime)}
                ariaDescribedBy={
                  errors.viewingDateTime ? 'viewingDateTime-error' : undefined
                }
                onChange={(dateStr) => updateField('viewingDate', dateStr)}
              />
            </FormField>

            <FormField
              id="viewingTime"
              label="Viewing Time"
              required
              error={undefined}
            >
              <TimePickerField
                id="viewingTime"
                value={values.viewingTime}
                minTime={minCityTime}
                hasError={Boolean(errors.viewingDateTime)}
                ariaDescribedBy={
                  errors.viewingDateTime ? 'viewingDateTime-error' : undefined
                }
                onChange={(timeStr) => updateField('viewingTime', timeStr)}
              />
            </FormField>
          </div>

          {errors.viewingDateTime && (
            <p
              id="viewingDateTime-error"
              role="alert"
              className="flex items-start gap-2 text-xs sm:text-sm font-medium text-[#9B1C1C]"
            >
              <AlertCircle
                className="w-4 h-4 shrink-0 mt-0.5 text-[#9B1C1C]"
                aria-hidden="true"
              />
              <span>{errors.viewingDateTime}</span>
            </p>
          )}
        </div>

        {/* More Requests */}
        <div className="pt-6 border-t border-[#B6AF9D]/45">
          <FormField
            id="moreRequests"
            label="More Requests"
            hint="Share architectural preferences, accessibility needs, or questions about the property."
          >
            <textarea
              id="moreRequests"
              name="moreRequests"
              rows={4}
              value={values.moreRequests}
              onChange={(e) => updateField('moreRequests', e.target.value)}
              placeholder="Tell us about your ideal living space, timeline, or specific questions..."
              className="w-full px-4 py-3 text-sm sm:text-base bg-white border border-[#B6AF9D] rounded-sm text-[#151513] placeholder:text-[#878276] transition-colors focus:outline-none focus:ring-2 focus:ring-[#57482D]/25 focus:border-[#57482D]"
            />
          </FormField>
        </div>

        {/* Centered Submit Control */}
        <div className="pt-6 flex justify-center border-t border-[#B6AF9D]/45">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto sm:min-w-[260px] min-h-[48px] px-8 py-3.5 text-sm sm:text-base font-medium text-[#FDFAF0] bg-[#57482D] hover:bg-[#423620] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 rounded-sm whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Submitting Request...
              </>
            ) : (
              'Submit Viewing Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
