import { ACCURACY_BONUSES } from 'shared';
import type { RoundResult } from 'shared';
import type { GameRoomInternal } from './roomManager';

export function computeRoundResult(room: GameRoomInternal): RoundResult {
  const { currentRound, roundNumber } = room;
  if (!currentRound || currentRound.startTimestamp === null) {
    throw new Error('Cannot compute result: round not started');
  }

  const { targetMs, startTimestamp, wagers, stopTimestamps } = currentRound;
  const playerResults: RoundResult['players'] = {};

  for (const player of room.players) {
    const stop = stopTimestamps[player.id] ?? startTimestamp + targetMs * 2;
    const elapsed = stop - startTimestamp;
    const error = Math.abs(elapsed - targetMs);
    playerResults[player.id] = {
      elapsed,
      error,
      wager: wagers[player.id] ?? 0,
    };
  }

  const [p1, p2] = room.players;
  const r1 = playerResults[p1.id];
  const r2 = p2 ? playerResults[p2.id] : null;

  let winnerId: string | null = null;
  if (!r2) {
    winnerId = p1.id;
  } else if (r1.error < r2.error) {
    winnerId = p1.id;
  } else if (r2.error < r1.error) {
    winnerId = p2.id;
  }

  const pot = room.players.reduce((sum, p) => sum + (wagers[p.id] ?? 0), 0);

  let accuracyBonus = 0;
  if (winnerId !== null) {
    const winnerError = playerResults[winnerId].error;
    if (winnerError === 0) {
      accuracyBonus = ACCURACY_BONUSES.DEAD_CENTER.bonus;
    } else if (winnerError <= ACCURACY_BONUSES.PERFECT.thresholdMs) {
      accuracyBonus = ACCURACY_BONUSES.PERFECT.bonus;
    } else if (winnerError <= ACCURACY_BONUSES.ELITE.thresholdMs) {
      accuracyBonus = ACCURACY_BONUSES.ELITE.bonus;
    }
  }

  // Streak bonus: winner's current streak + 1 (so first win = +1, second consecutive = +2, ...)
  const winner = winnerId !== null ? room.players.find(p => p.id === winnerId) : null;
  const streakBonus = winner ? winner.streak + 1 : 0;

  const scoreDeltas: { [id: string]: number } = {};
  if (winnerId !== null) {
    for (const player of room.players) {
      scoreDeltas[player.id] = player.id === winnerId
        ? pot + 1 + accuracyBonus + streakBonus
        : -(wagers[player.id] ?? 0);
    }
  } else {
    // tie: wagers returned, no streak change
    for (const player of room.players) {
      scoreDeltas[player.id] = wagers[player.id] ?? 0;
    }
  }

  return {
    roundNumber,
    targetMs,
    players: playerResults,
    winnerId,
    pot,
    accuracyBonus,
    streakBonus,
    scoreDeltas,
  };
}

export function applyBounceBack(currentScore: number, delta: number, targetScore: number): number {
  const raw = currentScore + delta;
  if (raw > targetScore) {
    const overshoot = raw - targetScore;
    return Math.max(0, targetScore - overshoot);
  }
  return Math.max(0, raw);
}

export function applyRoundResult(room: GameRoomInternal, result: RoundResult): void {
  for (const player of room.players) {
    const delta = result.scoreDeltas[player.id] ?? 0;
    if (room.targetScore !== null) {
      player.score = applyBounceBack(player.score, delta, room.targetScore);
    } else {
      player.score = Math.max(0, player.score + delta);
    }

    // Update streaks
    if (result.winnerId === null) {
      // tie — streaks unchanged
    } else if (player.id === result.winnerId) {
      player.streak += 1;
    } else {
      player.streak = 0;
    }
  }
}

export function isGameOver(room: GameRoomInternal): boolean {
  if (room.gameMode === 'rounds' && room.roundsTotal !== null) {
    return room.roundNumber >= room.roundsTotal;
  }
  return room.players.some(p => p.score === room.targetScore && room.targetScore !== null);
}

export function getMatchWinner(room: GameRoomInternal): string | null {
  if (room.gameMode === 'rounds') {
    const [p1, p2] = room.players;
    if (!p2 || p1.score === p2.score) return null;
    return p1.score > p2.score ? p1.id : p2.id;
  }
  return room.players.find(p => p.score === room.targetScore)?.id ?? null;
}
