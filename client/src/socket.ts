import { io } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from 'shared';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? `http://${window.location.hostname}:3001`;

export const socket = io(SERVER_URL, {
  autoConnect: false,
});

export type AppSocket = typeof socket & {
  on: <E extends keyof ServerToClientEvents>(event: E, listener: ServerToClientEvents[E]) => typeof socket;
  emit: <E extends keyof ClientToServerEvents>(event: E, ...args: Parameters<ClientToServerEvents[E]>) => typeof socket;
};
