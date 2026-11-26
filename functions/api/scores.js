import {
  corsHeaders,
  jsonResponse,
  sanitizeName,
  sanitizeScore,
} from '../_shared/api.js';

const TOP_LIMIT = 5;

async function topScores(db, mode = 'main') {
  const result = await db
    .prepare(
      `SELECT id, name, score FROM scores ${mode === 'natalia' ? "WHERE mode = 'natalia'" : ''} ORDER BY score DESC, created_at ASC, id ASC LIMIT ?`,
    )
    .bind(TOP_LIMIT)
    .all();

  return (result.results || []).map((row) => ({
    id: row.id,
    name: row.name || 'Anonymous',
    score: Number(row.score) || 0,
  }));
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
  try {
    const [scores, nataliaScores] = await Promise.all([
      topScores(context.env.DB), topScores(context.env.DB, 'natalia'),
    ]);
    return jsonResponse({ scores, nataliaScores });
  } catch (err) {
    console.error('GET /api/scores failed:', err);
    return jsonResponse({ error: 'Database error' }, 500);
  }
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const name = sanitizeName(body?.name);
  const score = sanitizeScore(body?.score);
  const mode = body?.mode === 'natalia' ? 'natalia' : 'classic';

  if (!name) {
    return jsonResponse({ error: 'Name is required' }, 400);
  }
  if (score === null) {
    return jsonResponse({ error: 'Invalid score' }, 400);
  }

  try {
    const inserted = await context.env.DB.prepare(
      `INSERT INTO scores (name, score, created_at, mode) VALUES (?, ?, ?, ?)`,
    )
      .bind(name, score, Date.now(), mode)
      .run();

    const [scores, nataliaScores] = await Promise.all([
      topScores(context.env.DB), topScores(context.env.DB, 'natalia'),
    ]);
    const onMain = scores.some(row => row.id === inserted.meta.last_row_id);
    return jsonResponse({ ok: true, scores, nataliaScores,
      board: mode === 'natalia' && !onMain ? 'natalia' : 'main' });
  } catch (err) {
    console.error('POST /api/scores failed:', err);
    return jsonResponse({ error: 'Database error' }, 500);
  }
}

