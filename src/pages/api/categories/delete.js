// src/pages/api/categories/delete.js
import { env } from 'cloudflare:workers';
import { deleteCategory, getCategoryProductCount } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const db = env.DB;
    const count = await getCategoryProductCount(db, Number(id));
    if (count > 0) {
      return new Response(
        JSON.stringify({ error: `Bu kategoride hâlâ ${count} ürün var. Silmeden önce ürünleri başka bir kategoriye taşı.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    await deleteCategory(db, Number(id));
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Category delete error:', err);
    return new Response(JSON.stringify({ error: 'Silinirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
