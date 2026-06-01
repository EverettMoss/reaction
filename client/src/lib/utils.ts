export function formatMs(ms: number): string {
  return (ms / 1000).toFixed(3) + 's';
}

export function formatError(ms: number): string {
  if (ms < 1) return '< 1ms';
  return ms.toFixed(0) + 'ms';
}

export function formatScore(score: number): string {
  return score.toString();
}
