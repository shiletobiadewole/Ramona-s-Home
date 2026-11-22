import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const WEBHOOK_TIMEOUT_MS = 25000;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const VALID_CITIES = new Set(['Toronto', 'Vancouver', 'Montreal', 'Calgary']);

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function validateServerPayload(body: unknown): string | null {
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

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Server-side proxy to n8n webhook to avoid browser CORS preflight issues
  // while preserving exact POST JSON contract and waiting for Respond to Webhook.
  app.post('/api/viewing-request', async (req: Request, res: Response) => {
    const rawWebhookUrl = (
      process.env.VITE_N8N_VIEWING_WEBHOOK_URL ||
      process.env.N8N_VIEWING_WEBHOOK_URL
    )
      ?.trim()
      .replace(/^["']|["']$/g, '')
      .trim();

    if (!rawWebhookUrl) {
      res.status(503).json({
        status: 'error',
        message:
          'Webhook endpoint is not configured. Set VITE_N8N_VIEWING_WEBHOOK_URL in your environment.',
      });
      return;
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(rawWebhookUrl);
      if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      res.status(500).json({
        status: 'error',
        message: 'Configured VITE_N8N_VIEWING_WEBHOOK_URL is not a valid HTTP/HTTPS URL.',
      });
      return;
    }

    const validationError = validateServerPayload(req.body);
    if (validationError) {
      res.status(400).json({
        status: 'error',
        message: validationError,
      });
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    try {
      const upstream = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });

      const responseText = await upstream.text();
      const contentType = upstream.headers.get('content-type') || 'application/json';

      res.status(upstream.status);
      res.setHeader('Content-Type', contentType);
      res.send(responseText);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        res.status(504).json({
          status: 'error',
          message:
            'Timed out waiting for the n8n Respond to Webhook node to reply.',
        });
        return;
      }

      res.status(502).json({
        status: 'error',
        message:
          'Could not connect to the n8n webhook endpoint. Verify the workflow is active or listening for test events.',
      });
    } finally {
      clearTimeout(timeoutId);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ramona's Home server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
