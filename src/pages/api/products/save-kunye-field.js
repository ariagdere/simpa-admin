// src/pages/api/products/save-kunye-field.js
import { env } from 'cloudflare:workers';
import { saveProductSpecValue } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { productId, attrKey, valueTr, valueEn } = await request.json();
    if (!productId || !attrKey) {
      return new Response(JSON.stringify({ error: 'productId ve attrKey gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await saveProductSpecValue(env.DB, Number(productId), attrKey, valueTr, valueEn);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Save künye field error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
