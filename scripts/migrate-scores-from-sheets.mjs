/**
 * One-shot: pull Google Sheets leaderboard rows and insert into D1.
 * Usage: node scripts/migrate-scores-from-sheets.mjs [--remote]
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz4ysJ9aIVSl1EhRGIAPhbdoZ267jL0cfcsfVAumCCpBkl-jeh1voKdiEVylWmDjPJl/exec';
const DB_NAME = 'flying-eyeball-db';
const remote = process.argv.includes('--remote');

const res = await fetch(`${SCRIPT_URL}?action=list&v=${Date.now()}`, {
  cache: 'no-cache',
});
const text = await res.text();
const data = JSON.parse(text);

const allRows =
  data.version === '7.2'
    ? data.rows || []
    : Array.isArray(data)
      ? data
      : [];

const scores = allRows
  .slice(1)
  .map((row) => ({
    name: String(row.name || 'Anonymous').trim().slice(0, 12) || 'Anonymous',
    score: Number(row.score) || 0,
  }))
  .filter((row) => row.score > 0);

if (scores.length === 0) {
  console.error('No scores found to migrate.');
  process.exit(1);
}

const now = Date.now();
const valuesSql = scores
  .map((row, i) => {
    const name = row.name.replace(/'/g, "''");
    return `('${name}', ${row.score}, ${now + i})`;
  })
  .join(',\n  ');

const sql = `INSERT INTO scores (name, score, created_at) VALUES
  ${valuesSql};
`;

const sqlPath = join(tmpdir(), `flying-eyeball-migrate-${Date.now()}.sql`);
writeFileSync(sqlPath, sql, 'utf8');

try {
  const args = [
    'wrangler',
    'd1',
    'execute',
    DB_NAME,
    ...(remote ? ['--remote'] : ['--local']),
    '--file',
    sqlPath,
  ];
  console.log(`Migrating ${scores.length} scores (${remote ? 'remote' : 'local'})...`);
  execFileSync('npx', args, { stdio: 'inherit' });
  console.log('Done.');
} finally {
  try {
    unlinkSync(sqlPath);
  } catch {
    /* ignore */
  }
}
