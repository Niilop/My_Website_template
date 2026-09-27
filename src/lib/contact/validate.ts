/**
 * Server-side validation for contact form submissions.
 * Framework-free so it can be unit tested with `node --test`.
 */

export const limits = { name: 100, email: 254, message: 5000 } as const;

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof ContactMessage, string>>;

export type ValidationResult =
  { ok: true; value: ContactMessage } | { ok: false; errors: FieldErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

function text(value: FormDataEntryValue | null | undefined): string {
  return typeof value === 'string' ? value.replace(CONTROL_CHARS, '').trim() : '';
}

export function validateContact(form: FormData): ValidationResult {
  const name = text(form.get('name'));
  const email = text(form.get('email'));
  const message = text(form.get('message'));
  const errors: FieldErrors = {};

  if (!name) errors.name = 'Enter your name.';
  else if (name.length > limits.name) errors.name = `Use at most ${limits.name} characters.`;
  else if (/[\r\n]/.test(name)) errors.name = 'Enter your name on one line.';

  if (!email) errors.email = 'Enter your email address.';
  else if (email.length > limits.email || !EMAIL_PATTERN.test(email))
    errors.email = 'Enter a valid email address, like name@example.com.';

  if (!message) errors.message = 'Enter a message.';
  else if (message.length > limits.message)
    errors.message = `Use at most ${limits.message} characters.`;

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value: { name, email, message } };
}
