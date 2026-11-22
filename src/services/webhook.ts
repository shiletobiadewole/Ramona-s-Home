import { getEnvironmentConfig } from '../config/environment';
import type { ParsedWebhookResponse, ViewingRequestPayload } from '../types/viewing';
import { parseWebhookResponse } from './responseParser';

function validateWebhookUrl(rawUrl: string | null): boolean {
  if (!rawUrl) {
    return false;
  }
  try {
    const parsedUrl = new URL(rawUrl);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function submitViewingRequest(
  payload: ViewingRequestPayload
): Promise<ParsedWebhookResponse> {
  const { n8nViewingWebhookUrl, webhookTimeoutMs } = getEnvironmentConfig();

  if (n8nViewingWebhookUrl && !validateWebhookUrl(n8nViewingWebhookUrl)) {
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
    // Prefer same-origin /api/viewing-request (handled by Express server.ts or Cloudflare Pages Functions)
    // so runtime environment variables work and browser CORS preflight issues are avoided.
    const proxyResponse = await fetch('/api/viewing-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const proxyContentType = proxyResponse.headers.get('content-type') || '';
    const isMissingProxyRoute =
      proxyResponse.status === 404 ||
      proxyResponse.status === 405 ||
      proxyContentType.includes('text/html');

    // If static host has no /api/viewing-request route (or proxy lacks runtime var while Vite build has it),
    // fall back to calling the configured Vite webhook URL directly if present.
    if (isMissingProxyRoute || (proxyResponse.status === 503 && n8nViewingWebhookUrl)) {
      if (!n8nViewingWebhookUrl) {
        return {
          status: 'error',
          code: 'CONFIG_MISSING',
          message:
            'Webhook endpoint is not configured. Set VITE_N8N_VIEWING_WEBHOOK_URL in your hosting environment variables (e.g., Cloudflare Pages Settings > Variables and Secrets) and redeploy.',
        };
      }

      const directResponse = await fetch(n8nViewingWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const directText = await directResponse.text();
      return parseWebhookResponse(
        directText,
        directResponse.status,
        directResponse.ok
      );
    }

    const rawText = await proxyResponse.text();
    if (proxyResponse.status === 503) {
      const parsed = parseWebhookResponse(
        rawText,
        proxyResponse.status,
        proxyResponse.ok
      );
      return {
        status: 'error',
        code: 'CONFIG_MISSING',
        message: parsed.status === 'error'
          ? parsed.message
          : 'Webhook endpoint is not configured. Set VITE_N8N_VIEWING_WEBHOOK_URL in your environment configuration and redeploy.',
      };
    }

    return parseWebhookResponse(rawText, proxyResponse.status, proxyResponse.ok);
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
