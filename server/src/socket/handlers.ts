import type { Server, Socket } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, MatchLengthTier } from 'shared';
import { WAGER_OPTIONS } from 'shared';
import {
  createRoom, joinRoom, getRoomBySocketId, getRoom, removePlayer,
  type GameRoomInternal,
} from '../game/roomManager';
import {
  toSnapshot, transitionToSettings, transitionToPreRound, transitionToTiming, setMatchLength, setRoundsMode,
} from '../game/stateMachine';
import {
  computeRoundResult, applyRoundResult, isGameOver, getMatchWinner,
} from '../game/scoring';
import {
  emitRoomCreated, emitRoomJoined, emitRoomStateUpdate,
  emitTimingStart, emitRoundResult, emitMatchEnd, emitError,
} from './emitters';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

function resolveRound(io: IO, room: GameRoomInternal): void {
  room.phase = 'round_result';
  const result = computeRoundResult(room);
  applyRoundResult(room, result);
  room.roundHistory.push(result);

  if (isGameOver(room)) {
    room.phase = 'match_end';
    emitMatchEnd(io, room.code, getMatchWinner(room), toSnapshot(room));
  } else {
    emitRoundResult(io, room.code, result, toSnapshot(room));
  }
}

function handleLeave(io: IO, socketId: string): void {
  const removal = removePlayer(socketId);
  if (!removal) return;

  const { room, removedName } = removal;
  if (room.players.length === 0) return;

  // Reset room to lobby for the remaining player
  room.phase = 'lobby';
  room.currentRound = null;
  room.roundNumber = 0;
  room.roundHistory = [];
  room.targetScore = null;
  room.matchLengthTier = null;
  room.gameMode = 'race';
  room.roundsTotal = null;
  for (const p of room.players) {
    p.score = 0;
    p.isHost = true;
    p.isReady = false;
    p.hasStopped = false;
    p.wager = null;
  }

  const snapshot = toSnapshot(room);
  snapshot.disconnectedPlayerName = removedName;
  io.to(room.code).emit('room:state_update', { room: snapshot });
}

export function registerHandlers(io: IO): void {
  io.on('connection', (socket: AppSocket) => {

    socket.on('room:create', ({ playerName }) => {
      if (!playerName?.trim()) {
        emitError(io, socket.id, 'Player name is required.');
        return;
      }
      const room = createRoom(socket.id, playerName.trim());
      socket.join(room.code);
      emitRoomCreated(io, socket.id, toSnapshot(room));
    });

    socket.on('room:join', ({ roomCode, playerName }) => {
      if (!playerName?.trim() || !roomCode?.trim()) {
        emitError(io, socket.id, 'Name and room code are required.');
        return;
      }
      const result = joinRoom(socket.id, roomCode.trim(), playerName.trim());
      if ('error' in result) {
        emitError(io, socket.id, result.error);
        return;
      }
      socket.join(result.code);
      emitRoomJoined(io, socket.id, toSnapshot(result));

      if (result.players.length === 2) {
        transitionToSettings(result);
        emitRoomStateUpdate(io, result.code, toSnapshot(result));
      }
    });

    socket.on('room:leave', () => handleLeave(io, socket.id));

    socket.on('settings:choose_mode', ({ mode }) => {
      const room = getRoomBySocketId(socket.id);
      if (!room || room.phase !== 'settings') return;
      const player = room.players.find(p => p.id === socket.id);
      if (!player?.isHost) return;

      if (mode === 'rounds') {
        setRoundsMode(room);
        transitionToPreRound(room);
        emitRoomStateUpdate(io, room.code, toSnapshot(room));
      }
    });

    socket.on('settings:choose_length', ({ tier }) => {
      const room = getRoomBySocketId(socket.id);
      if (!room || room.phase !== 'settings') return;
      const player = room.players.find(p => p.id === socket.id);
      if (!player?.isHost) {
        emitError(io, socket.id, 'Only the host can choose match length.');
        return;
      }

      setMatchLength(room, tier as MatchLengthTier);
      transitionToPreRound(room);
      emitRoomStateUpdate(io, room.code, toSnapshot(room));
    });

    socket.on('round:submit_wager', ({ wager }) => {
      const room = getRoomBySocketId(socket.id);
      if (!room || room.phase !== 'pre_round' || !room.currentRound) return;
      const player = room.players.find(p => p.id === socket.id);
      const score = player?.score ?? 0;
      if (!(WAGER_OPTIONS as readonly number[]).includes(wager) || wager > score) {
        emitError(io, socket.id, 'Invalid wager.');
        return;
      }
      if (room.currentRound.wagers[socket.id] !== null) return; // already wagered

      room.currentRound.wagers[socket.id] = wager;
      if (player) {
        player.score = Math.max(0, player.score - wager);
        player.wager = wager;
      }

      emitRoomStateUpdate(io, room.code, toSnapshot(room));
    });

    socket.on('round:ready', () => {
      const room = getRoomBySocketId(socket.id);
      if (!room || room.phase !== 'pre_round' || !room.currentRound) return;

      const allWagered = room.players.every(p => room.currentRound!.wagers[p.id] !== null && room.currentRound!.wagers[p.id] !== undefined);
      if (!allWagered) {
        emitError(io, socket.id, 'All players must submit wagers first.');
        return;
      }

      room.currentRound.readyPlayers.add(socket.id);
      const player = room.players.find(p => p.id === socket.id);
      if (player) player.isReady = true;

      emitRoomStateUpdate(io, room.code, toSnapshot(room));

      if (room.currentRound.readyPlayers.size === room.players.length) {
        const startTimestamp = transitionToTiming(room);
        emitRoomStateUpdate(io, room.code, toSnapshot(room));
        emitTimingStart(io, room.code, startTimestamp, room.currentRound.targetMs);
      }
    });

    socket.on('round:next', () => {
      const room = getRoomBySocketId(socket.id);
      if (!room || room.phase !== 'round_result') return;
      const player = room.players.find(p => p.id === socket.id);
      if (!player?.isHost) return;

      transitionToPreRound(room);
      emitRoomStateUpdate(io, room.code, toSnapshot(room));
    });

    socket.on('round:stop', () => {
      const stopTimestamp = Date.now(); // MUST be first — timestamps the stop
      const room = getRoomBySocketId(socket.id);
      if (!room || room.phase !== 'timing' || !room.currentRound) return;
      if (room.currentRound.stopTimestamps[socket.id] !== null && room.currentRound.stopTimestamps[socket.id] !== undefined) return;

      room.currentRound.stopTimestamps[socket.id] = stopTimestamp;
      const player = room.players.find(p => p.id === socket.id);
      if (player) player.hasStopped = true;

      emitRoomStateUpdate(io, room.code, toSnapshot(room));

      const allStopped = room.players.every(p => room.currentRound!.stopTimestamps[p.id] !== null && room.currentRound!.stopTimestamps[p.id] !== undefined);
      if (allStopped) {
        resolveRound(io, room);
      }
    });

    socket.on('disconnect', () => handleLeave(io, socket.id));
  });
}
