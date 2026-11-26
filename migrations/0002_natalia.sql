ALTER TABLE scores ADD COLUMN mode TEXT NOT NULL DEFAULT 'classic';
CREATE INDEX IF NOT EXISTS idx_scores_mode_score ON scores (mode, score DESC, created_at ASC);
