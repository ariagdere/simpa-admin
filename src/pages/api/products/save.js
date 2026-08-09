// src/pages/api/products/save.js
import { env } from 'cloudflare:workers';
import { createProduct, updateProduct, isProdCodeTaken, upsertProductSpec } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const db = env.DB;

    const prodCode = (body.prod_code || '').trim();
    const titleTr = (body.title_tr || '').trim();
    const titleEn = (body.title_en || '').trim();

    // Önce doğrulama, sonra veritabanı yazma — kategori/save.js'te olduğu gibi,
    // doğrulama başarısız olduğunda yarım kalmış "Yeni Ürün" satırı bırakmamak için.
    if (!prodCode) {
      return new Response(JSON.stringify({ error: 'Ürün kodu zorunlu.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    // Sadece EN başlıklı ürünler de olabiliyor (henüz TR çevirisi yapılmamış) —
    // TR'yi tek başına zorunlu tutmak yerine en az birinin dolu olmasını istiyoruz.
    if (!titleTr && !titleEn) {
      return new Response(JSON.stringify({ error: 'En az bir dilde başlık girilmeli (Türkçe ya da İngilizce).' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let id = body.id ? Number(body.id) : null;

    if (await isProdCodeTaken(db, prodCode, id)) {
      return new Response(JSON.stringify({ error: `"${prodCode}" kodu zaten başka bir üründe kullanılıyor.` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!id) {
      id = await createProduct(db, body.brand);
    }

    await updateProduct(db, id, {
      prod_code: prodCode,
      title_tr: titleTr || null,
      title_en: titleEn || null,
      category_id: body.category_id ? Number(body.category_id) : null,
      brand: body.brand,
      drawing_ref: body.drawing_ref || null,
      has_variant_table: body.has_variant_table ? 1 : 0,
      is_active: body.is_active ? 1 : 0,
    });

    await upsertProductSpec(db, id, 'OZELLIKLER', body.ozellikler_tr, body.ozellikler_en);
    await upsertProductSpec(db, id, 'SPECIAL_NOTE', body.special_note_tr, body.special_note_en);

    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Product save error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
