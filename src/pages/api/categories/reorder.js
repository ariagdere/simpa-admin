// src/pages/api/categories/reorder.js
import { env } from 'cloudflare:workers';
import { reorderCategories } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'ids gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await reorderCategories(env.DB, ids.map(Number));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Category reorder error:', err);
    return new Response(JSON.stringify({ error: 'Sıralama güncellenirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
