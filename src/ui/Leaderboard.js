import { SCORES_API } from '../core/constants.js';
import { NATALIA_MODE } from '../core/mode.js';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const qualifies = (rows, score) => score > 0 &&
    (rows.length < 5 || score > rows[rows.length - 1].score);

export class Leaderboard {
    constructor(listElement) {
        this.listElement = listElement;
        this.scores = [];
        this.isFetching = false;
        this.lastPlayerName = '';
        this.boards = { main: [], natalia: [] };
        this.board = NATALIA_MODE ? 'natalia' : 'main';
        this.pendingScore = 0;
        this.entryBoard = null;
        this.onRestartButtonUpdate = () => {};
        const tabs = document.getElementById('leaderboard-tabs');
        if (tabs && NATALIA_MODE) {
            tabs.hidden = false;
            tabs.addEventListener('click', event => {
                const board = event.target.closest('[data-board]')?.dataset.board;
                if (!board) return;
                const name = this.getEnteredName();
                if (name) this.lastPlayerName = name;
                this.selectBoard(board);
                if (this.entryBoard === board) this.renderWithInput(this.pendingScore, this.onRestartButtonUpdate);
                else this.renderStatic();
            });
        }
    }

    setData(data) {
        for (const [board, key] of [['main', 'scores'], ['natalia', 'nataliaScores']]) {
            this.boards[board] = (Array.isArray(data[key]) ? data[key] : [])
                .map(row => ({ name: row.name || 'Anonymous', score: Number(row.score) || 0 }))
                .sort((a, b) => b.score - a.score).slice(0, 5);
        }
        this.selectBoard(this.board);
    }

    selectBoard(board) {
        this.board = board;
        this.scores = this.boards[board];
        const heading = document.getElementById('leaderboard-heading');
        if (heading) heading.innerText = board === 'natalia' ? '🏆 Natalia High Scores 🏆' : '🏆 Main High Scores 🏆';
        document.querySelectorAll('[data-board]').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.board === board));
            button.style.fontWeight = button.dataset.board === board ? '900' : '400';
        });
    }

    async fetch() {
        if (this.isFetching) return;
        this.isFetching = true;

        try {
            const res = await fetch(`${SCORES_API}?v=${Date.now()}`, {
                method: 'GET',
                cache: 'no-cache',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.setData(data);
        } catch (err) {
            console.error('Leaderboard Pull Error:', err);
        } finally {
            this.isFetching = false;
        }
    }

    async saveScore(name, scoreValue) {
        try {
            const res = await fetch(SCORES_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score: scoreValue, mode: NATALIA_MODE ? 'natalia' : 'classic' }),
                cache: 'no-cache',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            this.setData(data);
            this.entryBoard = null;
            this.pendingScore = 0;
            this.selectBoard(data.board || (NATALIA_MODE ? 'natalia' : 'main'));
            this.renderStatic();
            const status = document.getElementById('leaderboard-status');
            if (status) status.innerText = NATALIA_MODE && this.board === 'main'
                ? 'Saved! This run also counts toward Natalia’s leaderboard.' : 'Score saved!';
            return true;
        } catch (err) {
            console.error('Score Push Error:', err);
            const status = document.getElementById('leaderboard-status');
            if (status) status.innerText = 'Could not save. Please try again.';
            return false;
        }
    }

    render(gameActive, currentScore, onRestartButtonUpdate) {
        this.onRestartButtonUpdate = onRestartButtonUpdate;
        if (!gameActive) {
            this.pendingScore = currentScore;
            const onMain = qualifies(this.boards.main, currentScore);
            this.entryBoard = onMain ? 'main' : NATALIA_MODE && qualifies(this.boards.natalia, currentScore) ? 'natalia' : null;
            this.selectBoard(this.entryBoard || (NATALIA_MODE ? 'natalia' : 'main'));
            const status = document.getElementById('leaderboard-status');
            if (status) status.innerText = NATALIA_MODE && onMain
                ? 'Main leaderboard! Your run counts on both boards.' : '';
            onRestartButtonUpdate(false);
            this.renderWithInput(currentScore, onRestartButtonUpdate);
        } else {
            this.pendingScore = 0;
            this.entryBoard = null;
            this.selectBoard(NATALIA_MODE ? 'natalia' : 'main');
            this.renderStatic();
        }
    }

    renderStatic() {
        if (this.scores.length > 0) {
            this.listElement.innerHTML = this.scores.map((s, i) => {
                const rankIcon = i < 3 ? ['🥇', '🥈', '🥉'][i] : '';
                return `
                    <div class="leaderboard-item">
                        <div class="flex items-center gap-3">
                            <span class="text-[10px] text-gray-300 w-3">${i + 1}</span>
                            <span class="txt-lb-name tracking-tight text-gray-600 truncate max-w-[120px]">
                                ${escapeHtml(s.name)} ${rankIcon}
                            </span>
                        </div>
                        <span class="txt-lb-score text-blue-500 font-black">${s.score}</span>
                    </div>
                `;
            }).join('');
        } else {
            this.listElement.innerHTML = `
                <div class="py-6 text-gray-300 italic text-center txt-lb-name">
                    No records yet...
                </div>
            `;
        }
    }

    renderWithInput(currentScore, onRestartButtonUpdate) {
        let tempScores = [...this.scores];
        let fitsAt = -1;

        // Find where the current score would fit
        for (let i = 0; i < 5; i++) {
            if (!tempScores[i] || currentScore > tempScores[i].score) {
                fitsAt = i;
                break;
            }
        }

        // Insert placeholder for input if score qualifies
        if (fitsAt !== -1 && currentScore > 0) {
            tempScores.splice(fitsAt, 0, { name: '__INPUT__', score: currentScore });
            tempScores = tempScores.slice(0, 5);
        }

        this.listElement.innerHTML = tempScores.map((s, i) => {
            const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            const isEntry = s.name === '__INPUT__';

            if (isEntry) {
                return `
                    <div class="leaderboard-item bg-blue-50 py-6 ring-2 ring-blue-400">
                        <div class="flex items-center gap-3 flex-1 mr-4">
                            <span class="text-[10px] text-gray-300 w-3">${i + 1}</span>
                            <input type="text" 
                                   id="high-score-name" 
                                   value="${escapeHtml(this.lastPlayerName)}" 
                                   maxlength="12" 
                                   class="name-input" 
                                   placeholder="ENTER YOUR NAME">
                        </div>
                        <span class="txt-lb-score text-blue-500 font-black">${s.score}</span>
                    </div>
                `;
            } else {
                return `
                    <div class="leaderboard-item">
                        <div class="flex items-center gap-3">
                            <span class="text-[10px] text-gray-300 w-3">${i + 1}</span>
                            <span class="txt-lb-name tracking-tight text-gray-600 truncate max-w-[120px]">
                                ${escapeHtml(s.name)} ${rankIcon}
                            </span>
                        </div>
                        <span class="txt-lb-score text-blue-500 font-black">${s.score}</span>
                    </div>
                `;
            }
        }).join('');

        // Set up input listener
        const inputField = document.getElementById('high-score-name');
        if (inputField) {
            inputField.addEventListener('input', () => {
                onRestartButtonUpdate(inputField.value.trim().length > 0);
            });
            // Trigger initial update
            onRestartButtonUpdate(inputField.value.trim().length > 0);
        }
    }

    getEnteredName() {
        const inputField = document.getElementById('high-score-name');
        if (inputField && inputField.value.trim().length > 0) {
            const name = inputField.value.trim();
            this.lastPlayerName = name;
            return name;
        }
        return this.entryBoard ? this.lastPlayerName || null : null;
    }

    setLastPlayerName(name) {
        this.lastPlayerName = name;
    }
}

