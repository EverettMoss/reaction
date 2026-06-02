import type { GamePhase, GameMode, MatchLengthTier, RoundResult, Player } from 'shared';
import { generateRoomCode } from './codegen';

export interface CurrentRound {
  targetMs: number;
  startTimestamp: number | null;
  wagers: { [playerId: string]: number | null };
  stopTimestamps: { [playerId: string]: number | null };
  readyPlayers: Set<string>;
}

export interface GameRoomInternal {
  code: string;
  phase: GamePhase;
  gameMode: GameMode;
  players: Player[];
  targetScore: number | null;
  matchLengthTier: MatchLengthTier | null;
  roundNumber: number;
  roundsTotal: number | null;
  currentRound: CurrentRound | null;
  roundHistory: RoundResult[];
}

const rooms = new Map<string, GameRoomInternal>();
const socketToRoom = new Map<string, string>();

export function createRoom(socketId: string, playerName: string): GameRoomInternal {
  const code = generateRoomCode(new Set(rooms.keys()));
  const room: GameRoomInternal = {
    code,
    phase: 'lobby',
    gameMode: 'race',
    players: [{ id: socketId, name: playerName, score: 0, streak: 0, isHost: true, isReady: false, hasStopped: false, wager: null }],
    targetScore: null,
    matchLengthTier: null,
    roundNumber: 0,
    roundsTotal: null,
    currentRound: null,
    roundHistory: [],
  };
  rooms.set(code, room);
  socketToRoom.set(socketId, code);
  return room;
}

export function joinRoom(socketId: string, roomCode: string, playerName: string): GameRoomInternal | { error: string } {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return { error: 'Room not found.' };
  if (room.players.length >= 2) return { error: 'Room is full.' };
  if (room.phase !== 'lobby') return { error: 'Game already in progress.' };

  room.players.push({ id: socketId, name: playerName, score: 0, streak: 0, isHost: false, isReady: false, hasStopped: false, wager: null });
  socketToRoom.set(socketId, roomCode.toUpperCase());
  return room;
}

export function getRoom(roomCode: string): GameRoomInternal | undefined {
  return rooms.get(roomCode);
}

export function getRoomBySocketId(socketId: string): GameRoomInternal | undefined {
  const code = socketToRoom.get(socketId);
  return code ? rooms.get(code) : undefined;
}

export function removePlayer(socketId: string): { room: GameRoomInternal; removedName: string } | null {
  const code = socketToRoom.get(socketId);
  if (!code) return null;
  const room = rooms.get(code);
  if (!room) return null;

  const idx = room.players.findIndex(p => p.id === socketId);
  if (idx === -1) return null;
  const [removed] = room.players.splice(idx, 1);
  socketToRoom.delete(socketId);

  if (room.players.length === 0) {
    rooms.delete(code);
  }

  return { room, removedName: removed.name };
}

export function deleteRoom(roomCode: string): void {
  const room = rooms.get(roomCode);
  if (room) {
    room.players.forEach(p => socketToRoom.delete(p.id));
    rooms.delete(roomCode);
  }
}
