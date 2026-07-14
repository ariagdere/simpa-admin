// src/pages/api/company-info/add-social.js
import { env } from 'cloudflare:workers';
import { addSocialLink } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { brand, platform, url } = await request.json();
    if (!brand || !platform || !url) {
      return new Response(JSON.stringify({ error: 'Platform ve link gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await addSocialLink(env.DB, brand, platform, url);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Add social link error:', err);
    return new Response(JSON.stringify({ error: 'Eklenirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
