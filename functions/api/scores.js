import {
  corsHeaders,
  jsonResponse,
  sanitizeName,
  sanitizeScore,
} from '../_shared/api.js';

const TOP_LIMIT = 5;

async function topScores(db) {
  const result = await db
    .prepare(
      `SELECT name, score FROM scores ORDER BY score DESC, created_at ASC LIMIT ?`,
    )
    .bind(TOP_LIMIT)
    .all();

  return (result.results || []).map((row) => ({
    name: row.name || 'Anonymous',
    score: Number(row.score) || 0,
  }));
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
  try {
    const scores = await topScores(context.env.DB);
    return jsonResponse({ scores });
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

  if (!name) {
    return jsonResponse({ error: 'Name is required' }, 400);
  }
  if (score === null) {
    return jsonResponse({ error: 'Invalid score' }, 400);
  }

  try {
    await context.env.DB.prepare(
      `INSERT INTO scores (name, score, created_at) VALUES (?, ?, ?)`,
    )
      .bind(name, score, Date.now())
      .run();

    const scores = await topScores(context.env.DB);
    return jsonResponse({ ok: true, scores });
  } catch (err) {
    console.error('POST /api/scores failed:', err);
    return jsonResponse({ error: 'Database error' }, 500);
  }
}
