export interface EnvironmentConfig {
  n8nViewingWebhookUrl: string | null;
  webhookTimeoutMs: number;
}

function normalizeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim().replace(/^["']|["']$/g, '').trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const rawUrl = import.meta.env.VITE_N8N_VIEWING_WEBHOOK_URL;
  return {
    n8nViewingWebhookUrl: normalizeUrl(rawUrl),
    webhookTimeoutMs: 25000,
  };
}
