import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequestGet, onRequestPost } from '../functions/api/scores.js';

globalThis.window = { location: { pathname: '/Natalia' } };
globalThis.document = { getElementById: () => null, querySelectorAll: () => [] };
const { Leaderboard, qualifies } = await import('../src/ui/Leaderboard.js');
const { isNataliaPath } = await import('../src/core/mode.js');

function database() {
    const sql = new DatabaseSync(':memory:');
    sql.exec(readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8'));
    sql.exec("INSERT INTO scores(name, score, created_at) VALUES ('Old record', 100, 1)");
    sql.exec(readFileSync(new URL('../migrations/0002_natalia.sql', import.meta.url), 'utf8'));
    return {
        prepare(query) {
            return { bind(...values) {
                return {
                    async all() { return { results: sql.prepare(query).all(...values) }; },
                    async run() { return { meta: { last_row_id: Number(sql.prepare(query).run(...values).lastInsertRowid) } }; },
                };
            } };
        },
        sql,
    };
}

test('Natalia routes include root/prefixed URLs with either case and trailing slash', () => {
    for (const path of ['/Natalia', '/natalia/', '/apps/flyingeyeball/Natalia']) assert.ok(isNataliaPath(path));
    for (const path of ['/', '/Natalia-other', '/Natalia/art']) assert.ok(!isNataliaPath(path));
});

test('migration preserves existing scores; Natalia posts appear on both eligible boards once', async () => {
    const db = database();
    const context = { env: { DB: db } };
    const before = await (await onRequestGet(context)).json();
    assert.equal(before.scores[0].name, 'Old record');
    assert.deepEqual(before.nataliaScores, []);
    context.request = new Request('https://game.test/api/scores', { method: 'POST', body: JSON.stringify({ name: 'Natalia', score: 150, mode: 'natalia' }) });
    const after = await (await onRequestPost(context)).json();
    assert.equal(after.board, 'main');
    assert.equal(after.scores[0].name, 'Natalia');
    assert.equal(after.nataliaScores[0].id, after.scores[0].id);
    assert.equal(db.sql.prepare('SELECT count(*) AS n FROM scores').get().n, 2);
});

test('Natalia-only score selects Natalia; classic scores stay out of Natalia; ties favor older entries', async () => {
    const db = database();
    for (let i = 0; i < 5; i++) db.sql.prepare("INSERT INTO scores(name, score, created_at) VALUES ('Classic', ?, ?)").run(200 + i, i + 1);
    const post = async body => (await onRequestPost({ env: { DB: db }, request: new Request('https://game.test/api/scores', { method: 'POST', body: JSON.stringify(body) }) })).json();
    const data = await post({ name: 'Natalia', score: 200, mode: 'natalia' });
    assert.equal(data.board, 'natalia');
    assert.equal(data.scores.length, 5);
    assert.ok(data.scores.every(row => row.name === 'Classic'));
    assert.equal(data.nataliaScores.length, 1);
    const classic = await post({ name: 'New classic', score: 300 });
    assert.equal(classic.scores[0].name, 'New classic');
    assert.equal(classic.nataliaScores.length, 1);
});

test('invalid scores are rejected without inserting a record', async () => {
    const db = database();
    for (const score of [0, -1, 'bad']) {
        const response = await onRequestPost({ env: { DB: db }, request: new Request('https://game.test/api/scores', { method: 'POST', body: JSON.stringify({ name: 'Natalia', score }) }) });
        assert.equal(response.status, 400);
    }
    assert.equal(db.sql.prepare('SELECT count(*) AS n FROM scores').get().n, 1);
});

test('game-over selects main first, otherwise Natalia, and escapes player names', () => {
    const list = { innerHTML: '' };
    const leaderboard = new Leaderboard(list);
    leaderboard.setData({ scores: Array.from({ length: 5 }, (_, i) => ({ name: 'Classic', score: 100 - i })), nataliaScores: [{ name: '<script>', score: 5 }] });
    leaderboard.render(false, 10, () => {});
    assert.equal(leaderboard.board, 'natalia');
    assert.ok(list.innerHTML.includes('&lt;script&gt;'));
    leaderboard.render(false, 101, () => {});
    assert.equal(leaderboard.board, 'main');
    assert.equal(qualifies(leaderboard.boards.main, 96), false);
    assert.equal(qualifies([], 0), false);
});
