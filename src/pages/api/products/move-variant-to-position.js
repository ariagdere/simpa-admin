// src/pages/api/products/move-variant-to-position.js
import { env } from 'cloudflare:workers';
import { moveVariantToPosition } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { variantId, newPosition } = await request.json();
    if (!variantId || !newPosition || Number(newPosition) < 1) {
      return new Response(JSON.stringify({ error: 'variantId ve geçerli bir sıra no gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await moveVariantToPosition(env.DB, Number(variantId), Number(newPosition));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Variant move-to-position error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Sıra güncellenirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
