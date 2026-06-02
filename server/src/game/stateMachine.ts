import { MATCH_LENGTH_OPTIONS, TARGET_INTERVAL_RANGE, ROUNDS_MODE_TOTAL } from 'shared';
import type { MatchLengthTier, GameRoomSnapshot } from 'shared';
import type { GameRoomInternal } from './roomManager';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function toSnapshot(room: GameRoomInternal): GameRoomSnapshot {
  const players = room.players.map(p => ({ ...p }));

  let currentRound: GameRoomSnapshot['currentRound'] = null;
  if (room.currentRound) {
    const wagersSubmitted: { [id: string]: boolean } = {};
    for (const p of room.players) {
      wagersSubmitted[p.id] = room.currentRound.wagers[p.id] !== null && room.currentRound.wagers[p.id] !== undefined;
    }
    currentRound = {
      targetMs: room.currentRound.targetMs,
      startTimestamp: room.currentRound.startTimestamp,
      wagersSubmitted,
      stoppedPlayers: Object.entries(room.currentRound.stopTimestamps)
        .filter(([, ts]) => ts !== null)
        .map(([id]) => id),
    };
  }

  return {
    code: room.code,
    phase: room.phase,
    gameMode: room.gameMode,
    players,
    targetScore: room.targetScore,
    matchLengthTier: room.matchLengthTier,
    roundNumber: room.roundNumber,
    roundsTotal: room.roundsTotal,
    currentRound,
    roundHistory: room.roundHistory,
  };
}

export function transitionToSettings(room: GameRoomInternal): void {
  room.phase = 'settings';
}

export function transitionToPreRound(room: GameRoomInternal): void {
  room.phase = 'pre_round';
  room.roundNumber += 1;

  const { minMs, maxMs } = TARGET_INTERVAL_RANGE;
  const targetMs = randInt(minMs, maxMs);

  const wagers: { [id: string]: number | null } = {};
  const stopTimestamps: { [id: string]: number | null } = {};
  for (const p of room.players) {
    p.isReady = false;
    p.hasStopped = false;
    p.wager = null;
    wagers[p.id] = null;
    stopTimestamps[p.id] = null;
  }

  room.currentRound = {
    targetMs,
    startTimestamp: null,
    wagers,
    stopTimestamps,
    readyPlayers: new Set(),
  };
}

export function transitionToTiming(room: GameRoomInternal): number {
  const startTimestamp = Date.now();
  room.phase = 'timing';
  if (room.currentRound) {
    room.currentRound.startTimestamp = startTimestamp;
  }
  return startTimestamp;
}

export function setMatchLength(room: GameRoomInternal, tier: MatchLengthTier): void {
  const option = MATCH_LENGTH_OPTIONS.find(o => o.tier === tier);
  if (!option) return;
  room.gameMode = 'race';
  room.matchLengthTier = tier;
  room.targetScore = randInt(option.min, option.max);
}

export function setRoundsMode(room: GameRoomInternal): void {
  room.gameMode = 'rounds';
  room.roundsTotal = ROUNDS_MODE_TOTAL;
  room.targetScore = null;
  room.matchLengthTier = null;
}
