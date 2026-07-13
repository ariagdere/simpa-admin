// src/pages/api/products/add-compat.js
import { env } from 'cloudflare:workers';
import { addProductCompatibility } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { productId, compatibleId } = await request.json();
    if (!productId || !compatibleId) {
      return new Response(JSON.stringify({ error: 'productId ve compatibleId gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await addProductCompatibility(env.DB, Number(productId), Number(compatibleId));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Add compatibility error:', err);
    return new Response(JSON.stringify({ error: 'Eklenirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
