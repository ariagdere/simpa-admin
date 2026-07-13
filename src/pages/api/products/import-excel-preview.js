// src/pages/api/products/import-excel-preview.js
import { env } from 'cloudflare:workers';
import * as XLSX from 'xlsx';
import { getFieldLabelsGrouped, getVariantByCode } from '../../../lib/queries.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const productId = Number(formData.get('productId'));

    if (!file || typeof file === 'string' || !productId) {
      return new Response(JSON.stringify({ error: 'Dosya ve ürün gerekli.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const db = env.DB;
    const fieldGroups = await getFieldLabelsGrouped(db, 'variant');
    const validKeys = new Set(fieldGroups.flatMap((g) => g.fields.map((f) => f.attr_key)));

    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    if (rows.length < 2) {
      return new Response(JSON.stringify({ error: 'Dosya boş görünüyor veya beklenen formatta değil.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 2. satır: attr_key referansı (1. sütun __code, gerisi field key'leri)
    const refRow = rows[1];
    const attrKeys = refRow.slice(1).map((k) => String(k).trim());

    const unknownKeys = attrKeys.filter((k) => k && !validKeys.has(k));
    if (unknownKeys.length > 0) {
      return new Response(
        JSON.stringify({ error: `Dosyadaki referans satırında tanımsız alan(lar) var: ${unknownKeys.join(', ')}. Sütunları elle değiştirmiş olabilirsin — dosyayı yeniden dışa aktarıp tekrar dene.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const dataRows = rows.slice(2).filter((r) => r[0] !== '' && r[0] != null);

    const preview = [];
    for (const row of dataRows) {
      const variantCode = String(row[0]).trim();
      if (!variantCode) continue;
      const values = {};
      attrKeys.forEach((key, i) => {
        if (key) values[key] = String(row[i + 1] ?? '').trim();
      });

      const existing = await getVariantByCode(db, productId, variantCode);
      preview.push({
        variantId: existing?.id || null,
        variantCode,
        values,
        action: existing ? 'update' : 'insert',
      });
    }

    const updateCount = preview.filter((p) => p.action === 'update').length;
    const insertCount = preview.filter((p) => p.action === 'insert').length;

    return new Response(JSON.stringify({ success: true, updateCount, insertCount, preview }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Excel import preview error:', err);
    return new Response(JSON.stringify({ error: 'Dosya okunurken bir hata oluştu. Formatı bozulmamış bir .xlsx dosyası olduğundan emin ol.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
