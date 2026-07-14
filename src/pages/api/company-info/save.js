// src/pages/api/company-info/save.js
import { env } from 'cloudflare:workers';
import { saveCompanyInfo } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { brand, ...fields } = body;
    if (brand !== 'Simpa' && brand !== 'Superpress') {
      return new Response(JSON.stringify({ error: 'Geçersiz marka.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await saveCompanyInfo(env.DB, brand, fields);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Company info save error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
