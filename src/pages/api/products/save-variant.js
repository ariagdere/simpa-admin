// src/pages/api/products/save-variant.js
import { env } from 'cloudflare:workers';
import { saveVariantRow } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { productId, variantId, variantCode, sortOrder, values } = body;

    if (!productId || !variantCode) {
      return new Response(JSON.stringify({ error: 'Ürün ve varyant kodu gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const id = await saveVariantRow(env.DB, Number(productId), variantId ? Number(variantId) : null, variantCode.trim(), sortOrder ?? 0, values || {});
    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Variant save error:', err);
    return new Response(JSON.stringify({ error: 'Varyant kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
