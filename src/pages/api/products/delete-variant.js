// src/pages/api/products/delete-variant.js
import { env } from 'cloudflare:workers';
import { deleteVariantRow } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await deleteVariantRow(env.DB, Number(id));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Variant delete error:', err);
    return new Response(JSON.stringify({ error: 'Varyant silinirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
