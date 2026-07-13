// src/pages/api/products/delete.js
import { env } from 'cloudflare:workers';
import { deleteProduct } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await deleteProduct(env.DB, Number(id));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Product delete error:', err);
    return new Response(JSON.stringify({ error: 'Silinirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
