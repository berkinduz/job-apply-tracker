import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, emailShell } from "@/lib/email/send";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Vercel cron invokes this with `Authorization: Bearer ${CRON_SECRET}`.
// Anything else 401s. Also allows manual invocation in dev with the same header.
function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

type DueRow = {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  follow_up_date: string;
};

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // Pull all unsent, uncompleted follow-ups whose date has arrived.
  const { data: due, error: dueErr } = await supabase
    .from("applications")
    .select("id, user_id, company_name, position, follow_up_date")
    .lte("follow_up_date", today)
    .is("follow_up_sent_at", null)
    .is("follow_up_completed_at", null)
    .returns<DueRow[]>();

  if (dueErr) {
    return NextResponse.json({ error: dueErr.message }, { status: 500 });
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0 });
  }

  // Group due rows by user.
  const byUser = new Map<string, DueRow[]>();
  for (const row of due) {
    const list = byUser.get(row.user_id) || [];
    list.push(row);
    byUser.set(row.user_id, list);
  }

  const userIds = Array.from(byUser.keys());

  // Fetch each user's email + opt-in setting in parallel.
  const optInById = new Map<string, boolean>();
  const emailById = new Map<string, string>();

  await Promise.all(
    userIds.map(async (uid) => {
      const [{ data: settings }, { data: userResp }] = await Promise.all([
        supabase
          .from("user_settings")
          .select("follow_up_emails")
          .eq("user_id", uid)
          .maybeSingle(),
        supabase.auth.admin.getUserById(uid),
      ]);
      // Default to opted-in if no row exists yet.
      optInById.set(uid, settings?.follow_up_emails ?? true);
      const email = userResp?.user?.email;
      if (email) emailById.set(uid, email);
    }),
  );

  let sent = 0;
  let skippedOptOut = 0;
  let skippedNoEmail = 0;
  const errors: { user_id: string; error: string }[] = [];
  const successfullySentIds: string[] = [];

  for (const [uid, rows] of byUser.entries()) {
    if (!optInById.get(uid)) {
      skippedOptOut++;
      // Still mark sent so we don't re-evaluate every day for opted-out users.
      successfullySentIds.push(...rows.map((r) => r.id));
      continue;
    }
    const email = emailById.get(uid);
    if (!email) {
      skippedNoEmail++;
      continue;
    }

    const listHtml = rows
      .map(
        (r) => `
        <tr>
          <td style="padding:12px 14px;border:1px solid #eaeaf2;border-radius:8px;background:#fafafd">
            <div style="font-weight:600;font-size:14px;color:#1a1a26">${escape(r.company_name)} — ${escape(r.position)}</div>
            <div style="font-size:12px;color:#7a7a90;margin-top:2px">Due ${r.follow_up_date}</div>
          </td>
        </tr>
        <tr><td style="height:8px"></td></tr>`,
      )
      .join("");

    const subject =
      rows.length === 1
        ? `Follow up on ${rows[0].company_name}`
        : `${rows.length} follow-ups for today`;

    const body = `
      <h1 style="font-size:22px;font-weight:700;letter-spacing:-0.02em;margin:0 0 6px">Follow-up time.</h1>
      <p style="font-size:14px;color:#5a5a6e;line-height:1.6;margin:0 0 18px">You set a reminder for ${rows.length} application${rows.length === 1 ? "" : "s"}. Quick nudge — recruiters notice when you do.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${listHtml}</table>
    `;

    const html = emailShell({
      preheader: `${rows.length} application${rows.length === 1 ? "" : "s"} ready for follow-up`,
      body,
      ctaLabel: "Open JobTrack",
      ctaHref: `${siteConfig.url}/applications`,
    });

    const result = await sendEmail({ to: email, subject, html });
    if (result.ok) {
      sent++;
      successfullySentIds.push(...rows.map((r) => r.id));
    } else if (result.skipped) {
      // RESEND_API_KEY missing — surface in response but don't mark sent,
      // so a real send can still happen later.
      errors.push({ user_id: uid, error: result.reason });
    } else {
      errors.push({ user_id: uid, error: result.error });
    }
  }

  // Stamp follow_up_sent_at to prevent re-sends on subsequent cron runs.
  if (successfullySentIds.length > 0) {
    const stamp = new Date().toISOString();
    await supabase
      .from("applications")
      .update({ follow_up_sent_at: stamp } as never)
      .in("id", successfullySentIds);
  }

  return NextResponse.json({
    ok: true,
    processed: due.length,
    users: byUser.size,
    sent,
    skippedOptOut,
    skippedNoEmail,
    errors,
  });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
