-- Migration: hero_slides ve page_content tabloları
-- Uygulama: wrangler d1 execute simpa-db --remote --file=migrations/0001_hero_slides_and_page_content.sql
-- (--remote olmadan önce lokal test edebilirsin: --local)

CREATE TABLE IF NOT EXISTS hero_slides (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  brand                   TEXT NOT NULL,                 -- degerler: Simpa veya Superpress
  sort_order              INTEGER NOT NULL DEFAULT 0,
  is_active               INTEGER NOT NULL DEFAULT 1,    -- 0/1

  mirror_layout           INTEGER NOT NULL DEFAULT 0,    -- 0: öğeler sol/görsel sağ, 1: tersi

  -- Arka plan: bg_color her zaman taban, bg_image_url tanımlıysa üstüne biner
  bg_color                TEXT,                          -- hex renk kodu, ornek: #1D1D1B
  bg_image_url            TEXT,
  bg_image_opacity        INTEGER,                       -- 0-100

  -- Ön plan öğeleri — her biri bağımsız opsiyonel
  badge_text_tr           TEXT,
  badge_text_en           TEXT,
  headline_tr             TEXT,
  headline_en             TEXT,
  highlight_word_tr       TEXT,
  highlight_word_en       TEXT,
  subtext_tr              TEXT,
  subtext_en              TEXT,
  fg_image_url            TEXT,                          -- katalog görselinin durduğu yer

  cta_primary_text_tr     TEXT,
  cta_primary_text_en     TEXT,
  cta_primary_link        TEXT,
  cta_secondary_text_tr   TEXT,
  cta_secondary_text_en   TEXT,
  cta_secondary_link      TEXT,

  slide_link              TEXT,                          -- CTA yoksa ve doluysa: tüm slayt tıklanabilir

  created_at              TEXT DEFAULT (datetime('now')),
  updated_at              TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_brand ON hero_slides(brand, is_active, sort_order);


CREATE TABLE IF NOT EXISTS page_content (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  brand                   TEXT NOT NULL,                 -- degerler: Simpa veya Superpress
  page_key                TEXT NOT NULL,                 -- ornek: hakkimizda, gizlilik-ve-guvenlik
  section_key             TEXT NOT NULL,                 -- ornek: tarihce, kalite_politikasi
  sort_order              INTEGER NOT NULL DEFAULT 0,

  content_tr              TEXT,                          -- basit HTML (p, ul/li, strong, br)
  content_en              TEXT,

  updated_at              TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_page_content_unique ON page_content(brand, page_key, section_key);
