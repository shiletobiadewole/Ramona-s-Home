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

function isHtmlContent(rawBody: string): boolean {
  const trimmed = rawBody.trim();
  return (
    /^<(?:!doctype|html|head|body|div|table|section|article|p|h[1-6]|span|ul|ol)\b/i.test(
      trimmed
    ) || /<\/(?:html|body|div|table|p|h[1-6]|span|ul|ol)>/i.test(trimmed)
  );
}

function extractPlainTextFromHtml(html: string): string {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&middot;/gi, '·')
    .replace(/\s+/g, ' ')
    .trim();
}

const UNAVAILABLE_KEYWORDS =
  /\b(not\s+available|unavailable|no\s+longer\s+available|already\s+booked|already\s+taken|slot\s+taken|time\s+is\s+taken|is\s+taken|fully\s+booked|duplicate|conflict|alternative\s+slots?|other\s+available\s+slots?|alternative\s+viewing\s+times?)\b/i;

function extractJsonLiteralAfterMarker(
  source: string,
  markerRegex: RegExp,
  openChar: '[' | '"',
  closeChar: ']' | '"'
): string | null {
  const match = markerRegex.exec(source);
  if (!match) return null;

  const startIdx = match.index + match[0].length - 1;
  if (openChar === '"') {
    let i = startIdx + 1;
    let escaped = false;
    while (i < source.length) {
      const ch = source[i];
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === closeChar) {
        return source.slice(startIdx, i + 1);
      }
      i++;
    }
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = startIdx; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === '[') {
      depth++;
    } else if (ch === ']') {
      depth--;
      if (depth === 0) {
        return source.slice(startIdx, i + 1);
      }
    }
  }
  return null;
}

function extractSlotsFromHtml(html: string): AvailableSlot[] {
  const tzLiteral = extractJsonLiteralAfterMarker(
    html,
    /\bconst\s+timezone\s*=\s*"/,
    '"',
    '"'
  );
  let fallbackTimezone = 'America/Toronto';
  if (tzLiteral) {
    try {
      const parsedTz = JSON.parse(tzLiteral);
      if (isNonEmptyString(parsedTz)) {
        fallbackTimezone = parsedTz.trim();
      }
    } catch {
      // Keep default timezone
    }
  }

  const slotsLiteral = extractJsonLiteralAfterMarker(
    html,
    /\bconst\s+availableSlots\s*=\s*\[/,
    '[',
    ']'
  );
  if (!slotsLiteral) {
    return [];
  }

  try {
    const rawList: unknown = JSON.parse(slotsLiteral);
    if (!Array.isArray(rawList)) {
      return [];
    }

    const slots: AvailableSlot[] = [];
    for (const item of rawList) {
      if (!isPlainObject(item)) continue;
      const dateTime = isNonEmptyString(item.startTime)
        ? item.startTime.trim()
        : isNonEmptyString(item.dateTime)
        ? item.dateTime.trim()
        : '';
      if (!dateTime) continue;

      const dateLabel = isNonEmptyString(item.formattedDate)
        ? item.formattedDate.trim()
        : isNonEmptyString(item.label)
        ? item.label.trim()
        : dateTime;
      const timeLabel = isNonEmptyString(item.formattedTime)
        ? item.formattedTime.trim()
        : '';

      const label =
        timeLabel && !dateLabel.includes(timeLabel)
          ? `${dateLabel} · ${timeLabel}`
          : dateLabel;

      const slotTz = isNonEmptyString(item.timezone)
        ? item.timezone.trim()
        : fallbackTimezone;

      slots.push({
        dateTime,
        label,
        timezone: slotTz,
      });
    }
    return slots;
  } catch {
    return [];
  }
}

function extractHeadingFromHtml(html: string): string | null {
  const headingMatch = html.match(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/i);
  if (headingMatch?.[1]) {
    const text = extractPlainTextFromHtml(headingMatch[1]);
    if (text) return text;
  }
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    const text = extractPlainTextFromHtml(titleMatch[1]);
    if (text) return text;
  }
  return null;
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
        'Ensure your n8n Webhook node is set to "Using Respond to Webhook Node" and the Respond to Webhook node returns a response.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    const trimmedText = rawBody.trim();
    const isHtml = isHtmlContent(trimmedText);

    if (httpOk && trimmedText) {
      if (isHtml) {
        const plainSummary = extractPlainTextFromHtml(trimmedText);
        const extractedSlots = extractSlotsFromHtml(trimmedText);
        if (UNAVAILABLE_KEYWORDS.test(plainSummary) || extractedSlots.length > 0) {
          return {
            status: 'unavailable',
            message:
              plainSummary ||
              'The date and time you picked is unavailable. Please review the options below.',
            availableSlots: extractedSlots,
            html: trimmedText,
          };
        }

        if (/\b(bad\s+gateway|gateway\s+timeout|internal\s+server\s+error|workflow\s+error|exception)\b/i.test(plainSummary)) {
          return {
            status: 'error',
            code: 'WORKFLOW_ERROR',
            message: plainSummary,
          };
        }

        const headingSummary = extractHeadingFromHtml(trimmedText);
        return {
          status: 'success',
          message:
            headingSummary ||
            plainSummary ||
            'Your viewing request has been received.',
          html: trimmedText,
        };
      }

      const cleanText =
        trimmedText.replace(/^The Body is:\s*/i, '').trim() || trimmedText;

      if (UNAVAILABLE_KEYWORDS.test(cleanText)) {
        return {
          status: 'unavailable',
          message: cleanText,
          availableSlots: [],
        };
      }

      if (/\b(error|failed|exception|invalid|problem)\b/i.test(cleanText)) {
        return {
          status: 'error',
          code: 'WORKFLOW_ERROR',
          message: cleanText,
        };
      }

      return {
        status: 'success',
        message: cleanText,
      };
    }

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

  const rawHtml = isNonEmptyString(parsed.html)
    ? parsed.html.trim()
    : isNonEmptyString(parsed.emailbody)
    ? parsed.emailbody.trim()
    : undefined;

  const rawStatus = parsed.status;

  if (rawStatus === undefined && rawHtml && httpOk) {
    const plainSummary = isNonEmptyString(parsed.message)
      ? parsed.message.trim()
      : extractPlainTextFromHtml(rawHtml);

    if (UNAVAILABLE_KEYWORDS.test(plainSummary)) {
      const optionalSlots =
        parsed.availableSlots !== undefined
          ? parseAvailableSlots(parsed.availableSlots) ?? []
          : [];
      return {
        status: 'unavailable',
        message:
          plainSummary ||
          'The date and time you picked is unavailable. Please review the options below.',
        availableSlots: optionalSlots,
        html: rawHtml,
      };
    }

    return {
      status: 'success',
      message: plainSummary || 'Your viewing request has been received.',
      html: rawHtml,
    };
  }

  if (rawStatus === 'unavailable') {
    const fallbackMessage =
      isNonEmptyString(parsed.message)
        ? parsed.message.trim()
        : rawHtml
        ? extractPlainTextFromHtml(rawHtml)
        : '';

    if (!fallbackMessage) {
      return buildSchemaMismatchError(
        'Unavailable response is missing a required "message" string.',
        rawBody
      );
    }

    const slots =
      parsed.availableSlots === undefined && rawHtml
        ? []
        : parseAvailableSlots(parsed.availableSlots);
    if (slots === null) {
      return buildSchemaMismatchError(
        'Unavailable response requires an "availableSlots" array with dateTime, label, and timezone fields.',
        rawBody
      );
    }

    const result: UnavailableResponse = {
      status: 'unavailable',
      message: fallbackMessage,
      availableSlots: slots,
      ...(rawHtml ? { html: rawHtml } : {}),
    };
    return result;
  }

  const isExplicitSuccess =
    rawStatus === 'success' ||
    rawStatus === 'confirmed' ||
    (rawStatus === undefined && parsed.success === true);

  if (isExplicitSuccess) {
    if (!httpOk) {
      return {
        status: 'error',
        code: 'HTTP_ERROR',
        message: `Viewing service returned HTTP ${httpStatus} alongside success status.`,
      };
    }

    const titleText = isNonEmptyString(parsed.title) ? parsed.title.trim() : '';
    const bodyText = isNonEmptyString(parsed.message) ? parsed.message.trim() : '';
    const htmlSummary = rawHtml ? extractPlainTextFromHtml(rawHtml) : '';

    const successMessage = titleText || bodyText || htmlSummary;
    if (!successMessage) {
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

    const confirmationParts: string[] = [];
    if (titleText && bodyText && bodyText !== titleText) {
      confirmationParts.push(bodyText);
    }
    if (isNonEmptyString(parsed.confirmation)) {
      confirmationParts.push(parsed.confirmation.trim());
    }
    const combinedConfirmation = confirmationParts.join('\n\n');

    const result: SuccessResponse = {
      status: 'success',
      message: successMessage,
      ...(isNonEmptyString(parsed.reference)
        ? { reference: parsed.reference.trim() }
        : {}),
      ...(combinedConfirmation ? { confirmation: combinedConfirmation } : {}),
      ...(isNonEmptyString(parsed.date) ? { date: parsed.date.trim() } : {}),
      ...(isNonEmptyString(parsed.time) ? { time: parsed.time.trim() } : {}),
      ...(rawHtml ? { html: rawHtml } : {}),
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
