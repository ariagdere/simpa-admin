// src/pages/api/products/import-excel-apply.js
import { env } from 'cloudflare:workers';
import { saveVariantRow } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { productId, rows } = await request.json();
    if (!productId || !Array.isArray(rows)) {
      return new Response(JSON.stringify({ error: 'productId ve rows gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const db = env.DB;
    let saved = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await saveVariantRow(db, Number(productId), row.variantId ? Number(row.variantId) : null, row.variantCode, i, row.values);
      saved++;
    }

    return new Response(JSON.stringify({ success: true, saved }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Excel import apply error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
