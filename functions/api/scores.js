import {
  corsHeaders,
  jsonResponse,
  sanitizeName,
  sanitizeScore,
} from '../_shared/api.js';
import { FACE_MODE_IDS } from '../../src/core/modeCatalog.js';

const TOP_LIMIT = 5;

async function topScores(db, mode = 'main') {
  const result = await db
    .prepare(
      `SELECT id, name, score FROM scores ${mode !== 'main' ? 'WHERE mode = ?' : ''} ORDER BY score DESC, created_at ASC, id ASC LIMIT ?`,
    )
    .bind(...(mode === 'main' ? [TOP_LIMIT] : [mode, TOP_LIMIT]))
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
    const requestedMode = new URL(context.request?.url || 'https://game.test/api/scores').searchParams.get('mode');
    const mode = FACE_MODE_IDS.includes(requestedMode) ? requestedMode : 'classic';
    const [scores, nataliaScores] = await Promise.all([
      topScores(context.env.DB), topScores(context.env.DB, 'natalia'),
    ]);
    const modeScores = mode === 'natalia' ? nataliaScores : mode === 'classic' ? [] : await topScores(context.env.DB, mode);
    return jsonResponse({ scores, nataliaScores, modeScores, mode });
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
  const mode = FACE_MODE_IDS.includes(body?.mode) ? body.mode : 'classic';

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
    const modeScores = mode === 'natalia' ? nataliaScores : mode === 'classic' ? [] : await topScores(context.env.DB, mode);
    return jsonResponse({ ok: true, scores, nataliaScores, modeScores, mode,
      board: mode !== 'classic' && !onMain ? mode : 'main' });
  } catch (err) {
    console.error('POST /api/scores failed:', err);
    return jsonResponse({ error: 'Database error' }, 500);
  }
}

