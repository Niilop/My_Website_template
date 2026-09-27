/** Spam checks for the contact form. */

/** Hidden field that people never see; bots often fill it in. */
export const HONEYPOT_FIELD = 'website';
/** Timestamp (ms) set by the page script when the form is shown. */
export const STARTED_AT_FIELD = 'started_at';
/** Submissions faster than this are treated as automated. */
export const MIN_FILL_MS = 3000;

export function isHoneypotFilled(form: FormData): boolean {
  const value = form.get(HONEYPOT_FIELD);
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * True when the form was submitted implausibly fast. A missing timestamp (JavaScript disabled)
 * is allowed so the form keeps working without scripts; use Turnstile for stronger protection.
 */
export function isTooFast(form: FormData, now: number): boolean {
  const raw = form.get(STARTED_AT_FIELD);
  if (typeof raw !== 'string' || raw === '') return false;
  const startedAt = Number(raw);
  if (!Number.isFinite(startedAt)) return true;
  return now - startedAt < MIN_FILL_MS;
}

/** Verify a Cloudflare Turnstile token. https://developers.cloudflare.com/turnstile/ */
export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | undefined,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);
  try {
    const response = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
