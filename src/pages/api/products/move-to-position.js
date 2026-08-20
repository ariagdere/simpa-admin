// src/pages/api/products/move-to-position.js
import { env } from 'cloudflare:workers';
import { moveProductToPosition } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { id, newPosition } = await request.json();
    if (!id || !newPosition || Number(newPosition) < 1) {
      return new Response(JSON.stringify({ error: 'id ve geçerli bir sıra no gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await moveProductToPosition(env.DB, Number(id), Number(newPosition));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Product move-to-position error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Sıra güncellenirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
