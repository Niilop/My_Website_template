/** Delivery services for contact form messages. Add another by following the same shape. */
import type { ContactMessage } from './validate.ts';

export type DeliveryConfig =
  | { service: 'resend'; apiKey: string; to: string; from: string }
  | { service: 'webhook'; url: string };

export async function deliver(
  message: ContactMessage,
  config: DeliveryConfig,
  siteName: string,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  const subject = `New message from ${message.name} via ${siteName}`;
  const text = `${message.message}\n\n— ${message.name} <${message.email}>`;

  const response =
    config.service === 'resend'
      ? await fetchFn('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: config.from,
            to: [config.to],
            reply_to: message.email,
            subject,
            text,
          }),
        })
      : await fetchFn(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // `text` makes the payload readable by chat webhooks such as Slack.
          body: JSON.stringify({ ...message, site: siteName, text: `${subject}\n\n${text}` }),
        });

  if (!response.ok) {
    throw new Error(`${config.service} delivery failed with HTTP ${response.status}`);
  }
}
