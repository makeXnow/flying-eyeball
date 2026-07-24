import { SCORES_API } from '../core/constants.js';

export class Leaderboard {
    constructor(listElement) {
        this.listElement = listElement;
        this.scores = [];
        this.isFetching = false;
        this.lastPlayerName = '';
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
            const rows = Array.isArray(data.scores) ? data.scores : [];

            this.scores = rows
                .map((row) => ({
                    name: row.name || 'Anonymous',
                    score: parseFloat(row.score) || 0,
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
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
                body: JSON.stringify({ name, score: scoreValue }),
                cache: 'no-cache',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data.scores)) {
                this.scores = data.scores
                    .map((row) => ({
                        name: row.name || 'Anonymous',
                        score: parseFloat(row.score) || 0,
                    }))
                    .slice(0, 5);
            }
        } catch (err) {
            console.error('Score Push Error:', err);
        }
    }

    render(gameActive, currentScore, onRestartButtonUpdate) {
        if (!gameActive) {
            this.renderWithInput(currentScore, onRestartButtonUpdate);
        } else {
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
                                ${s.name} ${rankIcon}
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
                                   value="${this.lastPlayerName}" 
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
                                ${s.name} ${rankIcon}
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
        return null;
    }

    setLastPlayerName(name) {
        this.lastPlayerName = name;
    }
}
