interface CloudflarePagesContext {
  request: Request;
  env: {
    VITE_N8N_VIEWING_WEBHOOK_URL?: string;
    N8N_VIEWING_WEBHOOK_URL?: string;
  };
}

const WEBHOOK_TIMEOUT_MS = 25000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_CITIES = new Set(['Toronto', 'Vancouver', 'Montreal', 'Calgary']);

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function validateAndNormalizePayload(body: unknown): string | null {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return 'Request body must be a JSON object.';
  }

  const record = body as Record<string, unknown>;

  if (!isNonEmptyString(record.fullName)) {
    return 'Full name is required.';
  }
  if (!isNonEmptyString(record.email) || !EMAIL_REGEX.test(record.email.trim())) {
    return 'A valid email address is required.';
  }
  if (!isNonEmptyString(record.phone)) {
    return 'Phone number is required.';
  }
  let digits = record.phone.replace(/\D/g, '');
  if ((record.phone.trim().startsWith('+1') || digits.length === 11) && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  if (digits.length !== 10) {
    return 'Phone number must be a valid 10-digit Canadian or US number.';
  }
  record.phone = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;

  if (!Array.isArray(record.buildingTypes) || record.buildingTypes.length === 0) {
    return 'At least one building type is required.';
  }
  if (!isNonEmptyString(record.viewingDateTime)) {
    return 'Viewing date and time is required.';
  }
  const parsedDate = new Date(record.viewingDateTime);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.getTime() <= Date.now()) {
    return 'Viewing date and time must be a valid future ISO 8601 timestamp.';
  }
  if (typeof record.budget !== 'number' || !Number.isFinite(record.budget) || record.budget <= 0) {
    return 'Budget must be a number greater than zero.';
  }
  if (!isNonEmptyString(record.location) || !VALID_CITIES.has(record.location)) {
    return 'A valid city location is required.';
  }
  if (!isNonEmptyString(record.timezone)) {
    return 'Applicable IANA timezone is required.';
  }

  return null;
}

function jsonResponse(payload: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context: CloudflarePagesContext): Promise<Response> {
  const rawWebhookUrl = (
    context.env.VITE_N8N_VIEWING_WEBHOOK_URL ||
    context.env.N8N_VIEWING_WEBHOOK_URL ||
    ''
  )
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();

  if (!rawWebhookUrl) {
    return jsonResponse(
      {
        status: 'error',
        message:
          'Webhook endpoint is not configured. Add VITE_N8N_VIEWING_WEBHOOK_URL in Cloudflare Pages Settings > Variables and Secrets and redeploy.',
      },
      503
    );
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawWebhookUrl);
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
  } catch {
    return jsonResponse(
      {
        status: 'error',
        message: 'Configured VITE_N8N_VIEWING_WEBHOOK_URL is not a valid HTTP/HTTPS URL.',
      },
      500
    );
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse(
      {
        status: 'error',
        message: 'Invalid JSON request body.',
      },
      400
    );
  }

  const validationError = validateAndNormalizePayload(body);
  if (validationError) {
    return jsonResponse(
      {
        status: 'error',
        message: validationError,
      },
      400
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/html, text/plain',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const responseText = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';

    return new Response(responseText, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        'X-Viewing-Proxy': '1',
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return jsonResponse(
        {
          status: 'error',
          message: 'Timed out waiting for the n8n Respond to Webhook node to reply.',
        },
        504
      );
    }

    return jsonResponse(
      {
        status: 'error',
        message:
          'Could not connect to the n8n webhook endpoint. Verify the workflow is active or listening for test events.',
      },
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
