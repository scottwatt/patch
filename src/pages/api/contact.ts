import type { APIRoute } from 'astro';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const prerender = false;

const LEADS_DIR = join(process.cwd(), '.leads');
const LEADS_FILE = join(LEADS_DIR, 'leads.jsonl');

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

  try {
    if (!existsSync(LEADS_DIR)) {
      await mkdir(LEADS_DIR, { recursive: true });
    }
    const existing = existsSync(LEADS_FILE) ? await readFile(LEADS_FILE, 'utf8') : '';
    await writeFile(LEADS_FILE, existing + JSON.stringify(lead) + '\n', 'utf8');

    // TODO: forward to partner via email (Resend/SendGrid) and/or SMS (Twilio).
    // For now leads are written to .leads/leads.jsonl. Check that file daily.
    console.log('[lead]', lead);

    return new Response(JSON.stringify({ ok: true, id: lead.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Lead save failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to save lead' }), { status: 500 });
  }
};
