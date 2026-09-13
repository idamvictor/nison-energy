import "server-only";

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? "Ocunio Energy <noreply@ocunioenergy.com>";

let resend: Resend | null = null;
function client(): Resend | null {
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export type EmailMessage = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Send a transactional email. Never throws — a mail failure must not break the
 * lead / order / password-reset flow it's attached to. With no RESEND_API_KEY
 * (dev) it logs and returns.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const c = client();
  if (!c) {
    console.info(
      `[email] skipped (no RESEND_API_KEY): "${message.subject}" → ${
        Array.isArray(message.to) ? message.to.join(", ") : message.to
      }`,
    );
    return;
  }
  try {
    const { error } = await c.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });
    if (error) console.error("[email] send failed:", error);
  } catch (err) {
    console.error("[email] send threw:", err);
  }
}
