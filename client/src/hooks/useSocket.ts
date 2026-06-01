import { useEffect } from 'react';
import { socket } from '../socket';
import { useGame } from '../store/gameStore';

export function useSocket(): void {
  const { dispatch } = useGame();

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      dispatch({ type: 'CONNECTED', socketId: socket.id! });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'DISCONNECTED' });
    });

    socket.on('error', ({ message }) => {
      dispatch({ type: 'SET_ERROR', message });
      setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 4000);
    });

    socket.on('room:created', ({ room }) => {
      dispatch({ type: 'ROOM_UPDATE', room });
    });

    socket.on('room:joined', ({ room }) => {
      dispatch({ type: 'ROOM_UPDATE', room });
    });

    socket.on('room:state_update', ({ room }) => {
      dispatch({ type: 'ROOM_UPDATE', room });
    });

    socket.on('phase:timing_start', ({ serverTimestamp: _serverTimestamp }) => {
      dispatch({ type: 'TIMING_START', timingStartedAt: Date.now() });
    });

    socket.on('phase:round_result', ({ result, room }) => {
      dispatch({ type: 'ROUND_RESULT', result, room });
    });

    socket.on('phase:match_end', ({ winnerId, room }) => {
      dispatch({ type: 'MATCH_END', winnerId, room });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('error');
      socket.off('room:created');
      socket.off('room:joined');
      socket.off('room:state_update');
      socket.off('phase:timing_start');
      socket.off('phase:round_result');
      socket.off('phase:match_end');
      socket.disconnect();
    };
  }, [dispatch]);
}
