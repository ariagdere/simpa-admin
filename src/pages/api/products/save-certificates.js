// src/pages/api/products/save-certificates.js
import { env } from 'cloudflare:workers';
import { saveProductCertificates } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { productId, tags } = await request.json();
    if (!productId) {
      return new Response(JSON.stringify({ error: 'productId gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await saveProductCertificates(env.DB, Number(productId), tags || []);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Save certificates error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
