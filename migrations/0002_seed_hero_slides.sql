-- Seed: mevcut statik hero içeriğini her marka için "1. slayt" olarak taşır
-- Uygulama: wrangler d1 execute simpa-db --remote --file=migrations/0002_seed_hero_slides.sql
-- NOT: cta_secondary_link (Katalog Indir) alanlari gercek katalog URL degil
-- o an D1den dinamik cekiliyordu, ben bilmiyorum. Kayitlari ekledikten sonra
-- admin panelden (ya da elle bir UPDATE ile) gercek katalog linkiyle guncelle.

INSERT INTO hero_slides (
  brand, sort_order, is_active, mirror_layout,
  bg_color,
  badge_text_tr, badge_text_en,
  headline_tr, headline_en,
  highlight_word_tr, highlight_word_en,
  subtext_tr, subtext_en,
  fg_image_url,
  cta_primary_text_tr, cta_primary_text_en, cta_primary_link,
  cta_secondary_text_tr, cta_secondary_text_en, cta_secondary_link
) VALUES (
  'Simpa', 1, 1, 0,
  '#1a2e4a',
  '1977''den bu yana', 'Since 1977',
  'Güvenilir Elektrik Bağlantı Çözümleri', 'Reliable Electrical Connection Solutions',
  'Elektrik Bağlantı', 'Electrical Connection',
  'Sıkmalı kablo pabuçları, baralar ve bağlantı ekipmanlarında yılların üretim deneyimi. ISO 9001, CE ve EAC sertifikalı ürünler.',
  'Years of manufacturing experience in compression cable lugs, busbars and connection equipment. ISO 9001, CE and EAC certified products.',
  'https://assets.superpress.com.tr/documents/simpaocak26kattr.png',
  'Ürünleri İncele →', 'Browse Products →', '/kategori/',
  'Katalog İndir', 'Download Catalog', '#TODO-gercek-katalog-url'
);

INSERT INTO hero_slides (
  brand, sort_order, is_active, mirror_layout,
  bg_color,
  badge_text_tr, badge_text_en,
  headline_tr, headline_en,
  highlight_word_tr, highlight_word_en,
  subtext_tr, subtext_en,
  fg_image_url,
  cta_primary_text_tr, cta_primary_text_en, cta_primary_link,
  cta_secondary_text_tr, cta_secondary_text_en, cta_secondary_link
) VALUES (
  'Superpress', 1, 1, 0,
  '#1D1D1B',
  'Simpa Elektrik İştiraki', 'A Simpa Elektrik Subsidiary',
  'Kablo Montajında Profesyonel El Aletleri', 'Professional Hand Tools for Cable Assembly',
  'Profesyonel', 'Professional',
  'Kablo kesme, mekanik ve hidrolik pabuç sıkma penseleri — Simpa Elektrik''in ürettiği kablo pabuçlarıyla tam uyumlu, montaja hazır çözümler.',
  'Cable cutters, mechanical and hydraulic crimping pliers — assembly-ready solutions fully compatible with the cable lugs manufactured by Simpa Elektrik.',
  'https://assets.superpress.com.tr/superpressktalogkutuSAG1.png',
  'Ürünleri İncele →', 'Browse Products →', '/kategori/',
  'Katalog İndir', 'Download Catalog', '#TODO-gercek-katalog-url'
);
