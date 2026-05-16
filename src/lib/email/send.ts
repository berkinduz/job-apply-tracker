import { Resend } from "resend";
import { siteConfig } from "@/config/site";

// Lazy singleton — if the env var is missing the module still imports cleanly,
// and `sendEmail` becomes a no-op that returns `{ skipped: true }`. This lets
// us deploy cron jobs before Resend is wired up without crashing.
let cached: Resend | null = null;
function client(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

const DEFAULT_FROM =
  process.env.EMAIL_FROM || "JobTrack <reminders@jobapplytracker.com>";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const c = client();
  if (!c) {
    return {
      ok: false,
      skipped: true,
      reason: "RESEND_API_KEY not set — email skipped",
    };
  }
  try {
    const result = await c.emails.send({
      from: DEFAULT_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (result.error) {
      return { ok: false, skipped: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id || "" };
  } catch (e) {
    return { ok: false, skipped: false, error: (e as Error).message };
  }
}

/** Minimal branded email shell — keeps the HTML simple and email-client safe. */
export function emailShell({
  preheader,
  body,
  ctaLabel,
  ctaHref,
}: {
  preheader: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}): string {
  const cta =
    ctaLabel && ctaHref
      ? `<a href="${ctaHref}" style="display:inline-block;padding:12px 22px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:18px">${ctaLabel}</a>`
      : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f7f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a26">
<div style="display:none;max-height:0;overflow:hidden;color:transparent">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7fb;padding:32px 16px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:14px;padding:32px 28px;box-shadow:0 1px 2px rgba(20,20,40,0.06)">
      <tr><td>
        <div style="font-weight:700;font-size:18px;letter-spacing:-0.02em;color:#4F46E5;margin-bottom:24px">jobtrack</div>
        ${body}
        ${cta}
      </td></tr>
    </table>
    <p style="font-size:12px;color:#7a7a90;margin-top:18px;text-align:center">
      You're getting this because follow-up reminders are on in your <a href="${siteConfig.url}/settings" style="color:#4F46E5;text-decoration:none">JobTrack settings</a>.
    </p>
  </td></tr>
</table>
</body></html>`;
}
