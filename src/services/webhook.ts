import { getEnvironmentConfig } from '../config/environment';
import type { ParsedWebhookResponse, ViewingRequestPayload } from '../types/viewing';
import { parseWebhookResponse } from './responseParser';

export async function submitViewingRequest(
  payload: ViewingRequestPayload
): Promise<ParsedWebhookResponse> {
  const { n8nViewingWebhookUrl, webhookTimeoutMs } = getEnvironmentConfig();

  if (!n8nViewingWebhookUrl) {
    return {
      status: 'error',
      code: 'CONFIG_MISSING',
      message:
        'Webhook endpoint is not configured. Please set VITE_N8N_VIEWING_WEBHOOK_URL in your environment configuration before submitting requests.',
    };
  }

  try {
    const parsedUrl = new URL(n8nViewingWebhookUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
  } catch {
    return {
      status: 'error',
      code: 'CONFIG_MISSING',
      message:
        'Configured VITE_N8N_VIEWING_WEBHOOK_URL is not a valid HTTP/HTTPS URL.',
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), webhookTimeoutMs);

  try {
    // Route through same-origin /api/viewing-request proxy to avoid browser CORS preflight blocks
    // against n8n Cloud /webhook-test/ endpoints while waiting for Respond to Webhook.
    const response = await fetch('/api/viewing-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawText = await response.text();
    return parseWebhookResponse(rawText, response.status, response.ok);
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        status: 'error',
        code: 'TIMEOUT',
        message:
          'The viewing request timed out while waiting for a response. Your details have been preserved—please try again.',
      };
    }

    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message:
        'Unable to reach the viewing service. Please check your connection and try again.',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
