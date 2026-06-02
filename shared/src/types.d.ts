export type GamePhase = 'lobby' | 'settings' | 'pre_round' | 'timing' | 'round_result' | 'match_end';
export type MatchLengthTier = 'short' | 'medium' | 'long';
export interface MatchLengthOption {
    tier: MatchLengthTier;
    label: string;
    min: number;
    max: number;
}
export interface Player {
    id: string;
    name: string;
    score: number;
    streak: number;
    isHost: boolean;
    isReady: boolean;
    hasStopped: boolean;
    wager: number | null;
}
export interface RoundPlayerResult {
    elapsed: number;
    error: number;
    wager: number;
}
export interface RoundResult {
    roundNumber: number;
    targetMs: number;
    players: {
        [playerId: string]: RoundPlayerResult;
    };
    winnerId: string | null;
    pot: number;
    accuracyBonus: number;
    streakBonus: number;
    scoreDeltas: {
        [playerId: string]: number;
    };
}
export interface CurrentRoundSnapshot {
    targetMs: number | null;
    startTimestamp: number | null;
    wagersSubmitted: {
        [playerId: string]: boolean;
    };
    stoppedPlayers: string[];
}
export interface GameRoomSnapshot {
    code: string;
    phase: GamePhase;
    players: Player[];
    targetScore: number | null;
    matchLengthTier: MatchLengthTier | null;
    roundNumber: number;
    currentRound: CurrentRoundSnapshot | null;
    roundHistory: RoundResult[];
    disconnectedPlayerName?: string;
}
//# sourceMappingURL=types.d.ts.map