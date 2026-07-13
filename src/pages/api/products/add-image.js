// src/pages/api/products/add-image.js
import { env } from 'cloudflare:workers';
import { addProductImage } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { productId, fileUrl } = await request.json();
    if (!productId || !fileUrl) {
      return new Response(JSON.stringify({ error: 'productId ve fileUrl gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const id = await addProductImage(env.DB, Number(productId), fileUrl);
    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Add image error:', err);
    return new Response(JSON.stringify({ error: 'Eklenirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
