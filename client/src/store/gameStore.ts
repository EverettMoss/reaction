import React, { createContext, useContext, useReducer } from 'react';
import type { GameRoomSnapshot, RoundResult } from 'shared';

export interface ClientGameState {
  mySocketId: string | null;
  myName: string | null;
  room: GameRoomSnapshot | null;
  lastRoundResult: RoundResult | null;
  timingStartedAt: number | null;
  iStopped: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  errorMessage: string | null;
  disconnectedOpponentName: string | null;
}

export type Action =
  | { type: 'CONNECTED'; socketId: string }
  | { type: 'DISCONNECTED' }
  | { type: 'SET_NAME'; name: string }
  | { type: 'ROOM_UPDATE'; room: GameRoomSnapshot }
  | { type: 'TIMING_START'; timingStartedAt: number }
  | { type: 'I_STOPPED' }
  | { type: 'ROUND_RESULT'; result: RoundResult; room: GameRoomSnapshot }
  | { type: 'MATCH_END'; winnerId: string; room: GameRoomSnapshot }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' };

const initialState: ClientGameState = {
  mySocketId: null,
  myName: null,
  room: null,
  lastRoundResult: null,
  timingStartedAt: null,
  iStopped: false,
  connectionStatus: 'connecting',
  errorMessage: null,
  disconnectedOpponentName: null,
};

function reducer(state: ClientGameState, action: Action): ClientGameState {
  switch (action.type) {
    case 'CONNECTED':
      return { ...state, connectionStatus: 'connected', mySocketId: action.socketId };
    case 'DISCONNECTED':
      return { ...state, connectionStatus: 'disconnected' };
    case 'SET_NAME':
      return { ...state, myName: action.name };
    case 'ROOM_UPDATE': {
      const disconnectedOpponentName = action.room.disconnectedPlayerName ?? null;
      return {
        ...state,
        room: action.room,
        disconnectedOpponentName,
        // Reset timing state when transitioning out of timing
        timingStartedAt: action.room.phase === 'timing' ? state.timingStartedAt : null,
        iStopped: action.room.phase === 'timing' ? state.iStopped : false,
      };
    }
    case 'TIMING_START':
      return { ...state, timingStartedAt: action.timingStartedAt, iStopped: false };
    case 'I_STOPPED':
      return { ...state, iStopped: true };
    case 'ROUND_RESULT':
      return {
        ...state,
        room: action.room,
        lastRoundResult: action.result,
        timingStartedAt: null,
        iStopped: false,
      };
    case 'MATCH_END':
      return {
        ...state,
        room: action.room,
        timingStartedAt: null,
        iStopped: false,
      };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.message };
    case 'CLEAR_ERROR':
      return { ...state, errorMessage: null };
    default:
      return state;
  }
}

interface GameContextValue {
  state: ClientGameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return React.createElement(GameContext.Provider, { value: { state, dispatch } }, children);
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
