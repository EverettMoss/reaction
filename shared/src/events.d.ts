import type { MatchLengthTier, GameRoomSnapshot, RoundResult } from './types';
export interface ClientToServerEvents {
    'room:create': (payload: {
        playerName: string;
    }) => void;
    'room:join': (payload: {
        roomCode: string;
        playerName: string;
    }) => void;
    'room:leave': () => void;
    'settings:choose_length': (payload: {
        tier: MatchLengthTier;
    }) => void;
    'round:submit_wager': (payload: {
        wager: number;
    }) => void;
    'round:ready': () => void;
    'round:stop': () => void;
    'round:next': () => void;
}
export interface ServerToClientEvents {
    'error': (payload: {
        message: string;
    }) => void;
    'room:created': (payload: {
        room: GameRoomSnapshot;
    }) => void;
    'room:joined': (payload: {
        room: GameRoomSnapshot;
    }) => void;
    'room:state_update': (payload: {
        room: GameRoomSnapshot;
    }) => void;
    'phase:timing_start': (payload: {
        serverTimestamp: number;
        targetMs: number;
    }) => void;
    'phase:round_result': (payload: {
        result: RoundResult;
        room: GameRoomSnapshot;
    }) => void;
    'phase:match_end': (payload: {
        winnerId: string;
        room: GameRoomSnapshot;
    }) => void;
}
export interface InterServerEvents {
    ping: () => void;
}
export interface SocketData {
    playerName: string;
    roomCode: string;
}
//# sourceMappingURL=events.d.ts.map