// src/lib/adminUtils.js

/**
 * Marka çözümleme sırası: URL parametresi (varsa, ör. paylaşılan bir link) >
 * cookie (kalıcı seçim) > varsayılan 'Simpa'. Bulunca cookie'yi de günceller
 * ki bir sonraki ziyarette de aynı kalsın.
 */
export function resolveBrand(Astro) {
  const url = new URL(Astro.request.url);
  const fromParam = url.searchParams.get('brand');
  if (fromParam === 'Simpa' || fromParam === 'Superpress') {
    Astro.cookies.set('admin_brand', fromParam, { path: '/', maxAge: 31536000 });
    return fromParam;
  }
  const fromCookie = Astro.cookies.get('admin_brand')?.value;
  if (fromCookie === 'Simpa' || fromCookie === 'Superpress') {
    return fromCookie;
  }
  return 'Simpa';
}
