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

function isLocalhostUrl(rawUrl: string): boolean {
  try {
    const { hostname } = new URL(rawUrl);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function isSpaShellHtml(rawBody: string): boolean {
  const trimmed = rawBody.trim();
  if (!/^<(?:!doctype|html)\b/i.test(trimmed)) {
    return false;
  }
  return (
    /<div\s+id=["']root["']/i.test(trimmed) &&
    (/(?:\/src\/main\.tsx|\/assets\/index-)/i.test(trimmed) ||
      /Ramona's Home — Modern Architectural Living/i.test(trimmed))
  );
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

  let attemptingDirectLocalhost = false;
  let attemptingDirectFallback = false;

  try {
    // Prefer same-origin /api/viewing-request (handled by Express server.ts or Cloudflare Pages Functions)
    // so runtime environment variables work and browser CORS preflight issues are avoided.
    const proxyResponse = await fetch('/api/viewing-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/html, text/plain',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const rawText = await proxyResponse.text();
    const proxyContentType = proxyResponse.headers.get('content-type') || '';
    const hasViewingProxyHeader =
      proxyResponse.headers.get('x-viewing-proxy') === '1';

    // Static SPA hosts without /api/viewing-request return 404/405 or the Vite index.html shell.
    // Checking both the X-Viewing-Proxy header and SPA shell markers ensures n8n HTML notifications
    // are never mistaken for a missing proxy route.
    const isMissingProxyRoute =
      !hasViewingProxyHeader &&
      (proxyResponse.status === 404 ||
        proxyResponse.status === 405 ||
        (proxyContentType.includes('text/html') && isSpaShellHtml(rawText)));

    const shouldFallbackToLocalBrowser =
      proxyResponse.status === 502 &&
      Boolean(n8nViewingWebhookUrl && isLocalhostUrl(n8nViewingWebhookUrl));

    if (
      isMissingProxyRoute ||
      shouldFallbackToLocalBrowser ||
      (proxyResponse.status === 503 && n8nViewingWebhookUrl)
    ) {
      if (!n8nViewingWebhookUrl) {
        return {
          status: 'error',
          code: 'CONFIG_MISSING',
          message:
            'Webhook endpoint is not configured. Set VITE_N8N_VIEWING_WEBHOOK_URL in your hosting environment variables (e.g., Cloudflare Pages Settings > Variables and Secrets) and redeploy.',
        };
      }

      attemptingDirectFallback = true;
      attemptingDirectLocalhost = isLocalhostUrl(n8nViewingWebhookUrl);

      const directResponse = await fetch(n8nViewingWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/html, text/plain',
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

    if (proxyResponse.status === 503) {
      const parsed = parseWebhookResponse(
        rawText,
        proxyResponse.status,
        proxyResponse.ok
      );
      return {
        status: 'error',
        code: 'CONFIG_MISSING',
        message:
          parsed.status === 'error'
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

    if (attemptingDirectLocalhost) {
      return {
        status: 'error',
        code: 'NETWORK_ERROR',
        message:
          'Could not reach your local n8n instance at localhost:5678 from this hosted page (blocked by CORS/browser network isolation or n8n is not listening). Run the app locally or expose local n8n via a tunnel (e.g. cloudflared tunnel --url http://localhost:5678).',
      };
    }

    if (attemptingDirectFallback) {
      return {
        status: 'error',
        code: 'NETWORK_ERROR',
        message:
          'Unable to reach the viewing service directly from the browser.',
        details:
          'The /api/viewing-request proxy was not available on this host, and the direct browser request to the webhook URL was blocked (often due to CORS on n8n). Deploy with the /api/viewing-request function or allow CORS.',
      };
    }

    return {
      status: 'error',
      code: 'NETWORK_ERROR',
      message:
        'Unable to reach the viewing service. Please refresh the page and try again.',
      details:
        err instanceof Error ? `Request to /api/viewing-request failed: ${err.message}` : undefined,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}
