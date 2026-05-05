import type { APIRoute } from 'astro';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Resend } from 'resend';

export const prerender = false;

const LEADS_DIR = join(process.cwd(), '.leads');
const LEADS_FILE = join(LEADS_DIR, 'leads.jsonl');

const NOTIFY_EMAIL = import.meta.env.LEAD_NOTIFICATION_EMAIL || 'scottwattenbarger@gmail.com';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let data: any;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { name, phone, problem, trade, zip } = data || {};
  if (!name || !phone || !problem || !trade) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const lead = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    trade: String(trade).slice(0, 50),
    name: String(name).slice(0, 200),
    phone: String(phone).slice(0, 50),
    zip: zip ? String(zip).slice(0, 20) : null,
    problem: String(problem).slice(0, 2000),
    sourceIp: clientAddress || null,
    userAgent: request.headers.get('user-agent') || null,
  };

  // Local file write: works in dev, silently fails on serverless (read only filesystem).
  // Email is the source of truth in production.
  try {
    if (!existsSync(LEADS_DIR)) {
      await mkdir(LEADS_DIR, { recursive: true });
    }
    const existing = existsSync(LEADS_FILE) ? await readFile(LEADS_FILE, 'utf8') : '';
    await writeFile(LEADS_FILE, existing + JSON.stringify(lead) + '\n', 'utf8');
  } catch {
    // Vercel serverless filesystem is read only, ignore.
  }

  console.log('[lead]', lead);

  // Email via Resend
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Patchly Leads <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        replyTo: undefined,
        subject: `New ${lead.trade} lead: ${lead.name}`,
        html: `
          <div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; max-width: 600px; color: #0a1628; padding: 24px;">
            <h2 style="color: #0f2a4a; margin: 0 0 16px;">New lead from Patchly</h2>
            <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top; width: 100px;">Trade</td>
                <td style="padding: 8px 0;">${escapeHtml(lead.trade)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top;">Name</td>
                <td style="padding: 8px 0;">${escapeHtml(lead.name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top;">Phone</td>
                <td style="padding: 8px 0;"><a href="tel:${escapeHtml(lead.phone.replace(/[^0-9+]/g, ''))}" style="color: #1fb27a;">${escapeHtml(lead.phone)}</a></td>
              </tr>
              ${lead.zip ? `<tr>
                <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top;">ZIP</td>
                <td style="padding: 8px 0;">${escapeHtml(lead.zip)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 12px 8px 0; font-weight: 600; vertical-align: top;">Problem</td>
                <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(lead.problem)}</td>
              </tr>
            </table>
            <p style="color: #6b7785; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e9ef; padding-top: 16px;">
              Lead ID: ${lead.id}<br>
              Received: ${lead.receivedAt}
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Resend email failed:', err);
      // Don't fail the request: the lead is logged + saved locally as backup.
    }
  } else {
    console.warn('RESEND_API_KEY not set, lead email not sent');
  }

  return new Response(JSON.stringify({ ok: true, id: lead.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
