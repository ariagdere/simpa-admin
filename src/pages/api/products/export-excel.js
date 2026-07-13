// src/pages/api/products/export-excel.js
import { env } from 'cloudflare:workers';
import * as XLSX from 'xlsx';
import { getProductById, getFieldLabelsGrouped, getProductVariantsAdmin } from '../../../lib/queries.js';

export const prerender = false;

export async function GET({ url }) {
  try {
    const productId = Number(url.searchParams.get('id'));
    if (!productId) {
      return new Response('id gerekli', { status: 400 });
    }
    const db = env.DB;

    const [product, fieldGroups, variants] = await Promise.all([
      getProductById(db, productId),
      getFieldLabelsGrouped(db, 'variant'),
      getProductVariantsAdmin(db, productId),
    ]);
    if (!product) {
      return new Response('Ürün bulunamadı', { status: 404 });
    }

    const fields = fieldGroups.flatMap((g) => g.fields);

    // Satır 1: insan okur etiketler. Satır 2: gerçek attr_key referansı (görünür ama net işaretli,
    // import bu satırdan okur — Excel'in "gizli satır" desteğine güvenmiyoruz, testte geri okumada
    // korunmadığını gördük).
    const headerRow = ['Varyant Kodu', ...fields.map((f) => f.label_tr + (f.unit ? ` (${f.unit})` : ''))];
    const refRow = ['__code (dokunma)', ...fields.map((f) => f.attr_key)];
    const dataRows = variants.map((v) => [v.variant_code, ...fields.map((f) => v.values[f.attr_key] || '')]);

    const ws = XLSX.utils.aoa_to_sheet([headerRow, refRow, ...dataRows]);
    ws['!cols'] = [{ wch: 16 }, ...fields.map(() => ({ wch: 14 }))];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teknik Veri');
    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    const filename = `${product.prod_code.replace(/[^a-zA-Z0-9-]/g, '_')}-teknik-veri.xlsx`;
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error('Excel export error:', err);
    return new Response('Excel oluşturulurken bir hata oluştu.', { status: 500 });
  }
}
