import type {
  AvailableSlot,
  ErrorResponse,
  ParsedWebhookResponse,
  SuccessResponse,
  UnavailableResponse,
} from '../types/viewing';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatRawPreview(rawBody: string): string {
  const compact = rawBody.replace(/\s+/g, ' ').trim();
  if (!compact) {
    return '(empty body)';
  }
  return compact.length > 220 ? `${compact.slice(0, 220)}…` : compact;
}

function parseAvailableSlots(rawSlots: unknown): AvailableSlot[] | null {
  if (!Array.isArray(rawSlots)) {
    return null;
  }

  const parsed: AvailableSlot[] = [];
  for (const item of rawSlots) {
    if (!isPlainObject(item)) {
      return null;
    }
    if (
      !isNonEmptyString(item.dateTime) ||
      !isNonEmptyString(item.label) ||
      !isNonEmptyString(item.timezone)
    ) {
      return null;
    }
    parsed.push({
      dateTime: item.dateTime.trim(),
      label: item.label.trim(),
      timezone: item.timezone.trim(),
    });
  }

  return parsed;
}

function buildSchemaMismatchError(reason: string, rawBody?: string): ErrorResponse {
  const preview = rawBody !== undefined ? ` Raw response: ${formatRawPreview(rawBody)}` : '';
  return {
    status: 'error',
    code: 'SCHEMA_MISMATCH',
    message:
      'The viewing service returned an unexpected response format. Please verify the n8n Respond to Webhook JSON output.',
    details: `${reason}${preview}`,
  };
}

/**
 * Treats n8n Respond to Webhook output strictly as untrusted input and validates
 * exact contract fields without inventing fallback messages, slots, or references.
 */
export function parseWebhookResponse(
  rawBody: string,
  httpStatus: number,
  httpOk: boolean
): ParsedWebhookResponse {
  if (!rawBody.trim()) {
    return {
      status: 'error',
      code: 'SCHEMA_MISMATCH',
      message: httpOk
        ? 'The viewing service returned an empty response body.'
        : `The viewing service returned HTTP ${httpStatus} with an empty response body.`,
      details:
        'Ensure your n8n Webhook node is set to "Using Respond to Webhook Node" and the Respond to Webhook node returns a JSON object.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return {
      status: 'error',
      code: 'INVALID_JSON',
      message: httpOk
        ? 'The viewing service returned invalid JSON.'
        : `The viewing service returned an error (HTTP ${httpStatus}) with an unreadable response.`,
      details: `Received HTTP ${httpStatus}: ${formatRawPreview(rawBody)}`,
    };
  }

  if (!isPlainObject(parsed)) {
    if (!httpOk) {
      return {
        status: 'error',
        code: 'HTTP_ERROR',
        message: `The viewing service could not process the request (HTTP ${httpStatus}).`,
        details: `Received HTTP ${httpStatus}: ${formatRawPreview(rawBody)}`,
      };
    }
    return buildSchemaMismatchError(
      'Expected a JSON object (not an array or primitive) from the Respond to Webhook node.',
      rawBody
    );
  }

  const rawStatus = parsed.status;

  if (rawStatus === 'unavailable') {
    if (!isNonEmptyString(parsed.message)) {
      return buildSchemaMismatchError(
        'Unavailable response is missing a required "message" string.',
        rawBody
      );
    }
    const slots = parseAvailableSlots(parsed.availableSlots);
    if (slots === null) {
      return buildSchemaMismatchError(
        'Unavailable response requires an "availableSlots" array with dateTime, label, and timezone fields.',
        rawBody
      );
    }
    const result: UnavailableResponse = {
      status: 'unavailable',
      message: parsed.message.trim(),
      availableSlots: slots,
    };
    return result;
  }

  if (rawStatus === 'success') {
    if (!httpOk) {
      return {
        status: 'error',
        code: 'HTTP_ERROR',
        message: `Viewing service returned HTTP ${httpStatus} alongside success status.`,
      };
    }
    if (!isNonEmptyString(parsed.message)) {
      return buildSchemaMismatchError(
        'Success response is missing a required "message" string.',
        rawBody
      );
    }
    if (
      parsed.reference !== undefined &&
      parsed.reference !== null &&
      typeof parsed.reference !== 'string'
    ) {
      return buildSchemaMismatchError(
        'Success response "reference" must be a string when provided.',
        rawBody
      );
    }
    if (
      parsed.confirmation !== undefined &&
      parsed.confirmation !== null &&
      typeof parsed.confirmation !== 'string'
    ) {
      return buildSchemaMismatchError(
        'Success response "confirmation" must be a string when provided.',
        rawBody
      );
    }

    const result: SuccessResponse = {
      status: 'success',
      message: parsed.message.trim(),
      ...(isNonEmptyString(parsed.reference)
        ? { reference: parsed.reference.trim() }
        : {}),
      ...(isNonEmptyString(parsed.confirmation)
        ? { confirmation: parsed.confirmation.trim() }
        : {}),
    };
    return result;
  }

  if (rawStatus === 'error' || !httpOk) {
    const serverMsg = isNonEmptyString(parsed.message)
      ? parsed.message.trim()
      : isNonEmptyString(parsed.error)
      ? parsed.error.trim()
      : `The viewing service returned an error (HTTP ${httpStatus}).`;

    return {
      status: 'error',
      code: httpOk ? 'WORKFLOW_ERROR' : 'HTTP_ERROR',
      message: serverMsg,
    };
  }

  return buildSchemaMismatchError(
    `Unrecognized status "${String(rawStatus)}". Expected "success", "unavailable", or "error".`,
    rawBody
  );
}
