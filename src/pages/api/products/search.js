// src/pages/api/products/search.js
import { env } from 'cloudflare:workers';
import { searchProductsForCompat } from '../../../lib/queries.js';

export const prerender = false;

export async function GET({ url }) {
  try {
    const q = url.searchParams.get('q') || '';
    const excludeId = Number(url.searchParams.get('exclude') || 0);
    if (q.length < 2) {
      return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const results = await searchProductsForCompat(env.DB, q, excludeId);
    return new Response(JSON.stringify({ results }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Product search error:', err);
    return new Response(JSON.stringify({ error: 'Arama başarısız.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
