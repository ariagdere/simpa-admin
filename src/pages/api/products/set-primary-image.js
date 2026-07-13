// src/pages/api/products/set-primary-image.js
import { env } from 'cloudflare:workers';
import { setProductImagePrimary } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { productId, imageId } = await request.json();
    if (!productId || !imageId) {
      return new Response(JSON.stringify({ error: 'productId ve imageId gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await setProductImagePrimary(env.DB, Number(productId), Number(imageId));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Set primary image error:', err);
    return new Response(JSON.stringify({ error: 'Güncellenirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
