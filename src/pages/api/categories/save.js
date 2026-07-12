// src/pages/api/categories/save.js
import { env } from 'cloudflare:workers';
import { createCategory, updateCategory, isSlugTaken } from '../../../lib/queries.js';

export const prerender = false;

function slugify(str) {
  const map = { ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u' };
  return str
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const db = env.DB;

    let id = body.id ? Number(body.id) : null;
    if (!id) {
      id = await createCategory(db);
    }

    const nameTr = (body.name_tr || '').trim();
    let slug = (body.slug || '').trim() || slugify(nameTr);

    if (!nameTr) {
      return new Response(JSON.stringify({ error: 'Türkçe isim zorunlu.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug oluşturulamadı, isim kontrol et.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    if (await isSlugTaken(db, slug, id)) {
      return new Response(JSON.stringify({ error: `"${slug}" slug'ı zaten başka bir kategoride kullanılıyor.` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await updateCategory(db, id, {
      name_tr: nameTr,
      name_en: body.name_en || null,
      slug,
      image_url: body.image_url || null,
    });

    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Category save error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
