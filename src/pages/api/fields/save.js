// src/pages/api/fields/save.js
import { env } from 'cloudflare:workers';
import { createFieldLabel, updateFieldLabel, isFieldKeyTaken } from '../../../lib/queries.js';

export const prerender = false;

function slugify(str) {
  const map = { ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i', ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u' };
  return str
    .split('')
    .map((ch) => map[ch] || ch)
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const db = env.DB;
    const isNew = body.isNew;

    const labelTr = (body.label_tr || '').trim();
    if (!labelTr) {
      return new Response(JSON.stringify({ error: 'Türkçe etiket zorunlu.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (isNew) {
      const attrKey = (body.attr_key || '').trim() || slugify(labelTr);
      const scope = body.scope === 'product' ? 'product' : 'variant';
      if (!attrKey) {
        return new Response(JSON.stringify({ error: 'Alan anahtarı oluşturulamadı.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      if (await isFieldKeyTaken(db, attrKey)) {
        return new Response(JSON.stringify({ error: `"${attrKey}" zaten tanımlı bir alan.` }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      await createFieldLabel(db, {
        attr_key: attrKey,
        label_tr: labelTr,
        label_en: body.label_en,
        unit: body.unit,
        group_key: body.group_key || null,
        group_label_tr: body.group_label_tr,
        group_label_en: body.group_label_en,
        scope,
      });
      return new Response(JSON.stringify({ success: true, attr_key: attrKey }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      await updateFieldLabel(db, body.attr_key, {
        label_tr: labelTr,
        label_en: body.label_en || null,
        unit: body.unit || null,
        group_key: body.group_key || null,
        group_label_tr: body.group_label_tr || null,
        group_label_en: body.group_label_en || null,
      });
      return new Response(JSON.stringify({ success: true, attr_key: body.attr_key }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (err) {
    console.error('Field save error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
