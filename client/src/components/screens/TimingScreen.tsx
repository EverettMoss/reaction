import { socket } from '../../socket';
import { useGame } from '../../store/gameStore';
import { useLocalTimer } from '../../hooks/useLocalTimer';
import StopButton from '../ui/StopButton';
import { formatMs } from '../../lib/utils';

export default function TimingScreen() {
  const { state, dispatch } = useGame();
  const { room, mySocketId, timingStartedAt, iStopped } = state;

  const elapsedMs = useLocalTimer(timingStartedAt, iStopped);

  if (!room) return null;

  const opponent = room.players.find(p => p.id !== mySocketId);

  function handleStop() {
    if (iStopped) return;
    dispatch({ type: 'I_STOPPED' });
    socket.emit('round:stop');
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
      <div className="text-xs text-gray-500 uppercase tracking-widest">Round {room.roundNumber}</div>

      <div className="text-xs text-gray-400 uppercase tracking-widest">
        Target: {formatMs(room.currentRound?.targetMs ?? 0)}
      </div>

      <div className="h-16 flex items-center justify-center">
        {iStopped ? (
          <div className="flex flex-col items-center gap-1">
            <div className="text-4xl font-bold text-gray-400 tabular-nums">{formatMs(elapsedMs)}</div>
            <div className="text-sm text-gray-600">
              Waiting for {opponent?.name ?? 'opponent'}...
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-600 italic">Timer is running...</div>
        )}
      </div>

      <StopButton onClick={handleStop} disabled={iStopped} />

    </div>
  );
}
