import type { Server } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, GameRoomSnapshot, RoundResult } from 'shared';

type IO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function emitRoomCreated(io: IO, socketId: string, room: GameRoomSnapshot): void {
  io.to(socketId).emit('room:created', { room });
}

export function emitRoomJoined(io: IO, socketId: string, room: GameRoomSnapshot): void {
  io.to(socketId).emit('room:joined', { room });
}

export function emitRoomStateUpdate(io: IO, roomCode: string, room: GameRoomSnapshot): void {
  io.to(roomCode).emit('room:state_update', { room });
}

export function emitTimingStart(io: IO, roomCode: string, serverTimestamp: number, targetMs: number): void {
  io.to(roomCode).emit('phase:timing_start', { serverTimestamp, targetMs });
}

export function emitRoundResult(io: IO, roomCode: string, result: RoundResult, room: GameRoomSnapshot): void {
  io.to(roomCode).emit('phase:round_result', { result, room });
}

export function emitMatchEnd(io: IO, roomCode: string, winnerId: string, room: GameRoomSnapshot): void {
  io.to(roomCode).emit('phase:match_end', { winnerId, room });
}

export function emitError(io: IO, socketId: string, message: string): void {
  io.to(socketId).emit('error', { message });
}
