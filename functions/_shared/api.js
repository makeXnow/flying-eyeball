export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().slice(0, 12);
}

export function sanitizeScore(score) {
  const n = typeof score === 'number' ? score : parseFloat(score);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(n, 1_000_000);
}
