export function parseRewardBalance(raw) {
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** null = unknown / not loaded; 0+ shown as integer string (zero shows "0"). */
export function formatRewardBalance(n) {
  if (n === null) return '—';
  return Math.max(0, Math.floor(n)).toLocaleString();
}
