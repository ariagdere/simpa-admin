// src/pages/api/fields/delete.js
import { env } from 'cloudflare:workers';
import { deleteFieldLabel, getFieldUsageCount } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { attr_key } = await request.json();
    if (!attr_key) {
      return new Response(JSON.stringify({ error: 'attr_key gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const db = env.DB;
    const count = await getFieldUsageCount(db, attr_key);
    if (count > 0) {
      return new Response(
        JSON.stringify({ error: `Bu alan ${count} varyantta kullanılıyor, silinemez. Önce o değerleri temizle.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    await deleteFieldLabel(db, attr_key);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Field delete error:', err);
    return new Response(JSON.stringify({ error: 'Silinirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
