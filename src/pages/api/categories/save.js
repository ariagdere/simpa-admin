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

    // Önce TÜM doğrulamalar, ardından veritabanı yazma — hem yarım kalmış
    // satırların birikmesini hem de eksik-alan hatasını önlemek için
    // (bkz. sohbet açıklaması: name_en ve slug şemada NOT NULL).
    const nameTr = (body.name_tr || '').trim();
    if (!nameTr) {
      return new Response(JSON.stringify({ error: 'Türkçe isim zorunlu.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // name_en de NOT NULL — boş bırakılırsa EN çevirisi eklenene kadar Türkçe isme düşer.
    const nameEn = (body.name_en || '').trim() || nameTr;

    let slug = (body.slug || '').trim() || slugify(nameTr);
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug oluşturulamadı, isim kontrol et.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let id = body.id ? Number(body.id) : null;

    if (await isSlugTaken(db, slug, id)) {
      return new Response(JSON.stringify({ error: `"${slug}" slug'ı zaten başka bir kategoride kullanılıyor.` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const fields = { name_tr: nameTr, name_en: nameEn, slug, image_url: body.image_url || null };

    if (!id) {
      id = await createCategory(db, fields);
    } else {
      await updateCategory(db, id, fields);
    }

    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Category save error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
