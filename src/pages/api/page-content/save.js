// src/pages/api/page-content/save.js
import { env } from 'cloudflare:workers';
import { updatePageSectionById } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { id, contentTr, contentEn } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'id gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    await updatePageSectionById(env.DB, Number(id), contentTr, contentEn);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Page content save error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
