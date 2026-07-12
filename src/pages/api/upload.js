// src/pages/api/upload.js
import { env } from 'cloudflare:workers';

export const prerender = false;

// R2 bucket'ı assets.superpress.com.tr custom domain'i üzerinden herkese açık —
// aynı bucket'a yazıp aynı domain'den okunabiliyor.
const PUBLIC_BASE = 'https://assets.superpress.com.tr';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'Dosya bulunamadı.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Sadece PNG, JPEG, WEBP veya SVG yükleyebilirsiniz.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'Dosya 5MB\u2019dan büyük olamaz.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const safeName = `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    await env.UPLOADS.put(safeName, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    return new Response(JSON.stringify({ url: `${PUBLIC_BASE}/${safeName}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Upload error:', err);
    return new Response(JSON.stringify({ error: 'Yükleme sırasında bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
