/**
 * Contact form endpoint — DISABLED by default.
 *
 * Files starting with `_` are not routed. To enable the contact form:
 *   1. Rename this file to `contact.ts`.
 *   2. Add a server adapter (e.g. `npx astro add netlify`).
 *   3. Set `contactForm.enabled: true` in src/site.config.ts.
 *   4. Configure delivery and spam protection environment variables (see .env.example).
 * Full instructions: docs/integrations.md#contact-form
 */
import type { APIRoute } from 'astro';
import {
  CONTACT_DELIVERY,
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  CONTACT_WEBHOOK_URL,
  RESEND_API_KEY,
  TURNSTILE_SECRET_KEY,
} from 'astro:env/server';
import { handleContact } from '../../lib/contact/handler';
import { site } from '../../site.config';

export const prerender = false;

const MAX_BODY_BYTES = 32 * 1024;

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const respond = (status: number, body: Record<string, unknown>, redirectTo: string) =>
    wantsJson ? Response.json(body, { status }) : redirect(redirectTo, 303);

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return respond(413, { ok: false, error: 'too_large' }, '/contact/?error=invalid');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(400, { ok: false, error: 'invalid' }, '/contact/?error=invalid');
  }

  let ip: string | undefined;
  try {
    ip = clientAddress;
  } catch {
    ip = undefined;
  }

  const result = await handleContact(
    form,
    {
      CONTACT_DELIVERY,
      CONTACT_TO_EMAIL,
      CONTACT_FROM_EMAIL,
      RESEND_API_KEY,
      CONTACT_WEBHOOK_URL,
      TURNSTILE_SECRET_KEY,
    },
    { siteName: site.name, ip },
  );

  switch (result.status) {
    case 'sent':
    case 'spam':
      return respond(200, { ok: true }, '/contact/sent/');
    case 'invalid':
      return respond(400, { ok: false, errors: result.errors }, '/contact/?error=invalid');
    case 'unavailable':
      console.error('[contact] Delivery is not configured. See docs/integrations.md#contact-form.');
      return respond(503, { ok: false, error: 'unavailable' }, '/contact/?error=unavailable');
    case 'failed':
      return respond(502, { ok: false, error: 'failed' }, '/contact/?error=failed');
  }
};
