import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { deliveryFromEnv, handleContact, type ContactEnv } from '../../src/lib/contact/handler.ts';
import { HONEYPOT_FIELD, STARTED_AT_FIELD, isTooFast } from '../../src/lib/contact/spam.ts';
import { limits, validateContact } from '../../src/lib/contact/validate.ts';

const NOW = 1_700_000_000_000;

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const valid = {
  name: 'Ada Example',
  email: 'ada@example.com',
  message: 'Hello there!',
  [STARTED_AT_FIELD]: String(NOW - 10_000),
};

const webhookEnv: ContactEnv = {
  CONTACT_DELIVERY: 'webhook',
  CONTACT_WEBHOOK_URL: 'https://hooks.example.com/x',
};

function fakeFetch(status = 200, body: unknown = {}) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fn = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch;
  return { fn, calls };
}

describe('validateContact', () => {
  it('accepts and trims valid input', () => {
    const result = validateContact(form({ ...valid, name: '  Ada Example ' }));
    assert.deepEqual(result, {
      ok: true,
      value: { name: 'Ada Example', email: 'ada@example.com', message: 'Hello there!' },
    });
  });

  it('reports each missing field', () => {
    const result = validateContact(form({}));
    assert.equal(result.ok, false);
    assert.deepEqual(Object.keys(!result.ok ? result.errors : {}).sort(), [
      'email',
      'message',
      'name',
    ]);
  });

  it('rejects invalid email, overlong message, and multi-line names', () => {
    const result = validateContact(
      form({ name: 'A\nB', email: 'not-an-email', message: 'x'.repeat(limits.message + 1) }),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.errors.name);
      assert.ok(result.errors.email);
      assert.ok(result.errors.message);
    }
  });
});

describe('spam checks', () => {
  it('flags fast and malformed timestamps but allows a missing one', () => {
    assert.equal(isTooFast(form({ [STARTED_AT_FIELD]: String(NOW - 500) }), NOW), true);
    assert.equal(isTooFast(form({ [STARTED_AT_FIELD]: 'abc' }), NOW), true);
    assert.equal(isTooFast(form({}), NOW), false);
  });
});

describe('deliveryFromEnv', () => {
  it('requires complete configuration', () => {
    assert.equal(deliveryFromEnv({}), null);
    assert.equal(deliveryFromEnv({ CONTACT_DELIVERY: 'resend', RESEND_API_KEY: 'k' }), null);
    assert.equal(deliveryFromEnv({ CONTACT_DELIVERY: 'webhook' }), null);
    assert.deepEqual(deliveryFromEnv(webhookEnv), {
      service: 'webhook',
      url: 'https://hooks.example.com/x',
    });
  });
});

describe('handleContact', () => {
  const options = (fetch: typeof globalThis.fetch) => ({ siteName: 'Test', now: NOW, fetch });

  it('is unavailable without delivery configuration', async () => {
    const { fn, calls } = fakeFetch();
    assert.deepEqual(await handleContact(form(valid), {}, options(fn)), { status: 'unavailable' });
    assert.equal(calls.length, 0);
  });

  it('delivers a valid message to the webhook', async () => {
    const { fn, calls } = fakeFetch();
    assert.deepEqual(await handleContact(form(valid), webhookEnv, options(fn)), { status: 'sent' });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://hooks.example.com/x');
    assert.equal(JSON.parse(String(calls[0].init?.body)).email, 'ada@example.com');
  });

  it('sends email through Resend with reply-to set', async () => {
    const { fn, calls } = fakeFetch();
    const env: ContactEnv = {
      CONTACT_DELIVERY: 'resend',
      RESEND_API_KEY: 'key',
      CONTACT_TO_EMAIL: 'owner@example.com',
      CONTACT_FROM_EMAIL: 'site@example.com',
    };
    assert.deepEqual(await handleContact(form(valid), env, options(fn)), { status: 'sent' });
    const body = JSON.parse(String(calls[0].init?.body));
    assert.deepEqual(body.to, ['owner@example.com']);
    assert.equal(body.reply_to, 'ada@example.com');
  });

  it('silently drops honeypot submissions', async () => {
    const { fn, calls } = fakeFetch();
    const result = await handleContact(
      form({ ...valid, [HONEYPOT_FIELD]: 'spam.example' }),
      webhookEnv,
      options(fn),
    );
    assert.deepEqual(result, { status: 'spam' });
    assert.equal(calls.length, 0);
  });

  it('returns field errors without delivering', async () => {
    const { fn, calls } = fakeFetch();
    const result = await handleContact(form({ ...valid, email: 'bad' }), webhookEnv, options(fn));
    assert.equal(result.status, 'invalid');
    assert.equal(calls.length, 0);
  });

  it('requires a passing Turnstile check when a secret is configured', async () => {
    const env = { ...webhookEnv, TURNSTILE_SECRET_KEY: 'secret' };
    const failing = fakeFetch(200, { success: false });
    assert.deepEqual(
      await handleContact(
        form({ ...valid, 'cf-turnstile-response': 't' }),
        env,
        options(failing.fn),
      ),
      { status: 'spam' },
    );
    assert.equal(failing.calls.length, 1);

    const passing = fakeFetch(200, { success: true });
    assert.deepEqual(
      await handleContact(
        form({ ...valid, 'cf-turnstile-response': 't' }),
        env,
        options(passing.fn),
      ),
      { status: 'sent' },
    );
  });

  it('reports delivery failures', async () => {
    const { fn } = fakeFetch(500);
    const original = console.error;
    console.error = () => {};
    try {
      assert.deepEqual(await handleContact(form(valid), webhookEnv, options(fn)), {
        status: 'failed',
      });
    } finally {
      console.error = original;
    }
  });
});
