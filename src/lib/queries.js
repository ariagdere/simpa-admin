// src/lib/queries.js — admin panel
// Bu dosyanın "canlı site" için okuma fonksiyonları (getActiveHeroSlides, getPageContent)
// Simpa ve Superpress projelerindeki queries.js'e de aynen kopyalanmalı — onlar sadece
// okuma yapıyor, admin panel ise tam CRUD.

// ───────────────────────────── HERO SLIDES ─────────────────────────────

/** Admin panel için: bir markanın TÜM slaytları (aktif/pasif fark etmeksizin), sıralı. */
export async function getHeroSlides(db, brand) {
  const { results } = await db
    .prepare('SELECT * FROM hero_slides WHERE brand = ? ORDER BY sort_order')
    .bind(brand)
    .all();
  return results;
}

/** Tek bir slaytı id ile getirir (düzenleme formu için). */
export async function getHeroSlide(db, id) {
  return db.prepare('SELECT * FROM hero_slides WHERE id = ?').bind(id).first();
}

/**
 * Canlı site için: SADECE aktif slaytlar, dile göre doğru alanlar seçilmiş,
 * boş alanlar null olarak kalır (render tarafı "tanımlıysa göster" mantığını uygular).
 */
export async function getActiveHeroSlides(db, brand, lang) {
  const { results } = await db
    .prepare('SELECT * FROM hero_slides WHERE brand = ? AND is_active = 1 ORDER BY sort_order')
    .bind(brand)
    .all();

  return results.map((s) => ({
    id: s.id,
    mirrorLayout: !!s.mirror_layout,
    bgColor: s.bg_color,
    bgImageUrl: s.bg_image_url,
    bgImageOpacity: s.bg_image_opacity,
    badgeText: lang === 'en' ? s.badge_text_en : s.badge_text_tr,
    headline: lang === 'en' ? s.headline_en : s.headline_tr,
    highlightWord: lang === 'en' ? s.highlight_word_en : s.highlight_word_tr,
    subtext: lang === 'en' ? s.subtext_en : s.subtext_tr,
    fgImageUrl: s.fg_image_url,
    ctaPrimaryText: lang === 'en' ? s.cta_primary_text_en : s.cta_primary_text_tr,
    ctaPrimaryLink: s.cta_primary_link,
    ctaSecondaryText: lang === 'en' ? s.cta_secondary_text_en : s.cta_secondary_text_tr,
    ctaSecondaryLink: s.cta_secondary_link,
    slideLink: s.slide_link,
  }));
}

export async function createHeroSlide(db, brand) {
  const { meta } = await db
    .prepare('INSERT INTO hero_slides (brand, sort_order) VALUES (?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM hero_slides WHERE brand = ?))')
    .bind(brand, brand)
    .run();
  return meta.last_row_id;
}

const HERO_SLIDE_FIELDS = [
  'is_active', 'mirror_layout', 'bg_color', 'bg_image_url', 'bg_image_opacity',
  'badge_text_tr', 'badge_text_en', 'headline_tr', 'headline_en',
  'highlight_word_tr', 'highlight_word_en', 'subtext_tr', 'subtext_en', 'fg_image_url',
  'cta_primary_text_tr', 'cta_primary_text_en', 'cta_primary_link',
  'cta_secondary_text_tr', 'cta_secondary_text_en', 'cta_secondary_link', 'slide_link',
];

/** fields: yukarıdaki HERO_SLIDE_FIELDS'ten herhangi bir alt kümesi içeren obje. */
export async function updateHeroSlide(db, id, fields) {
  const keys = Object.keys(fields).filter((k) => HERO_SLIDE_FIELDS.includes(k));
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  await db
    .prepare(`UPDATE hero_slides SET ${setClause}, updated_at = datetime('now') WHERE id = ?`)
    .bind(...values, id)
    .run();
}

export async function deleteHeroSlide(db, id) {
  await db.prepare('DELETE FROM hero_slides WHERE id = ?').bind(id).run();
}

/** ids: yeni sıraya göre dizilmiş id listesi. */
export async function reorderHeroSlides(db, ids) {
  const stmts = ids.map((id, i) => db.prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?').bind(i, id));
  await db.batch(stmts);
}

// ───────────────────────────── PAGE CONTENT ─────────────────────────────

/** Admin panel için: bir markanın bir sayfasındaki tüm bölümler, sıralı. */
export async function getPageSections(db, brand, pageKey) {
  const { results } = await db
    .prepare('SELECT * FROM page_content WHERE brand = ? AND page_key = ? ORDER BY sort_order')
    .bind(brand, pageKey)
    .all();
  return results;
}

/** Canlı site için: tek bir bölümün metnini dile göre getirir. */
export async function getPageSection(db, brand, pageKey, sectionKey, lang) {
  const row = await db
    .prepare('SELECT content_tr, content_en FROM page_content WHERE brand = ? AND page_key = ? AND section_key = ?')
    .bind(brand, pageKey, sectionKey)
    .first();
  if (!row) return null;
  return lang === 'en' ? row.content_en : row.content_tr;
}

/** Var olan bölümü günceller, yoksa oluşturur. */
export async function upsertPageSection(db, brand, pageKey, sectionKey, contentTr, contentEn, sortOrder = 0) {
  await db
    .prepare(
      `INSERT INTO page_content (brand, page_key, section_key, content_tr, content_en, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(brand, page_key, section_key)
       DO UPDATE SET content_tr = excluded.content_tr, content_en = excluded.content_en,
                      sort_order = excluded.sort_order, updated_at = datetime('now')`
    )
    .bind(brand, pageKey, sectionKey, contentTr, contentEn, sortOrder)
    .run();
}
