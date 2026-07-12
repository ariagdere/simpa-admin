// src/pages/api/hero-slides/save.js
import { env } from 'cloudflare:workers';
import { createHeroSlide, updateHeroSlide } from '../../../lib/queries.js';

export const prerender = false;

const FIELDS = [
  'is_active', 'mirror_layout', 'bg_color', 'bg_image_url', 'bg_image_opacity',
  'badge_text_tr', 'badge_text_en', 'headline_tr', 'headline_en',
  'highlight_word_tr', 'highlight_word_en', 'subtext_tr', 'subtext_en', 'fg_image_url',
  'cta_primary_text_tr', 'cta_primary_text_en', 'cta_primary_link',
  'cta_secondary_text_tr', 'cta_secondary_text_en', 'cta_secondary_link', 'slide_link',
];

export async function POST({ request }) {
  try {
    const body = await request.json();
    const db = env.DB;

    let id = body.id ? Number(body.id) : null;
    const brand = body.brand;

    if (!brand || (brand !== 'Simpa' && brand !== 'Superpress')) {
      return new Response(JSON.stringify({ error: 'Geçersiz marka.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!id) {
      id = await createHeroSlide(db, brand);
    }

    const fields = {};
    for (const key of FIELDS) {
      if (key === 'is_active' || key === 'mirror_layout') {
        fields[key] = body[key] ? 1 : 0;
      } else if (key === 'bg_image_opacity') {
        fields[key] = body[key] === '' || body[key] == null ? null : Number(body[key]);
      } else {
        fields[key] = body[key] === '' ? null : (body[key] ?? null);
      }
    }

    await updateHeroSlide(db, id, fields);

    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Hero slide save error:', err);
    return new Response(JSON.stringify({ error: 'Kaydedilirken bir hata oluştu.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
