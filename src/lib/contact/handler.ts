/**
 * Contact form processing: spam checks, validation, and delivery.
 * The route in src/pages/api/_contact.ts adapts this to HTTP.
 */
import { deliver, type DeliveryConfig } from './deliver.ts';
import { isHoneypotFilled, isTooFast, verifyTurnstile } from './spam.ts';
import { validateContact, type FieldErrors } from './validate.ts';

export interface ContactEnv {
  CONTACT_DELIVERY?: 'resend' | 'webhook';
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  RESEND_API_KEY?: string;
  CONTACT_WEBHOOK_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export type ContactResult =
  | { status: 'sent' }
  /** Looks automated. Reported to the sender as success so bots learn nothing. */
  | { status: 'spam' }
  | { status: 'invalid'; errors: FieldErrors }
  /** Delivery is not configured. */
  | { status: 'unavailable' }
  | { status: 'failed' };

/** Returns the configured delivery service, or null when configuration is incomplete. */
export function deliveryFromEnv(env: ContactEnv): DeliveryConfig | null {
  if (env.CONTACT_DELIVERY === 'resend') {
    const { RESEND_API_KEY: apiKey, CONTACT_TO_EMAIL: to, CONTACT_FROM_EMAIL: from } = env;
    return apiKey && to && from ? { service: 'resend', apiKey, to, from } : null;
  }
  if (env.CONTACT_DELIVERY === 'webhook') {
    return env.CONTACT_WEBHOOK_URL ? { service: 'webhook', url: env.CONTACT_WEBHOOK_URL } : null;
  }
  return null;
}

export async function handleContact(
  form: FormData,
  env: ContactEnv,
  options: { siteName: string; ip?: string; now?: number; fetch?: typeof fetch },
): Promise<ContactResult> {
  const fetchFn = options.fetch ?? fetch;
  const delivery = deliveryFromEnv(env);
  if (!delivery) return { status: 'unavailable' };

  if (isHoneypotFilled(form) || isTooFast(form, options.now ?? Date.now())) {
    return { status: 'spam' };
  }

  const validation = validateContact(form);
  if (!validation.ok) return { status: 'invalid', errors: validation.errors };

  if (env.TURNSTILE_SECRET_KEY) {
    const token = form.get('cf-turnstile-response');
    const passed = await verifyTurnstile(
      typeof token === 'string' ? token : '',
      env.TURNSTILE_SECRET_KEY,
      options.ip,
      fetchFn,
    );
    if (!passed) return { status: 'spam' };
  }

  try {
    await deliver(validation.value, delivery, options.siteName, fetchFn);
    return { status: 'sent' };
  } catch (error) {
    console.error('[contact]', error instanceof Error ? error.message : error);
    return { status: 'failed' };
  }
}
