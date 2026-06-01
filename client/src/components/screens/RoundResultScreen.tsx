import { socket } from '../../socket';
import { useGame } from '../../store/gameStore';
import { ACCURACY_BONUSES } from 'shared';
import ScoreBoard from '../ui/ScoreBoard';
import { formatMs, formatError } from '../../lib/utils';

function getAccuracyLabel(error: number): { label: string; color: string } | null {
  if (error === 0) return { label: ACCURACY_BONUSES.DEAD_CENTER.label, color: 'text-yellow-300' };
  if (error <= ACCURACY_BONUSES.PERFECT.thresholdMs) return { label: ACCURACY_BONUSES.PERFECT.label, color: 'text-cyan-300' };
  if (error <= ACCURACY_BONUSES.ELITE.thresholdMs) return { label: ACCURACY_BONUSES.ELITE.label, color: 'text-green-300' };
  return null;
}

export default function RoundResultScreen() {
  const { state } = useGame();
  const { room, mySocketId, lastRoundResult } = state;

  if (!room || !lastRoundResult) return null;

  const { winnerId, pot, accuracyBonus, scoreDeltas, targetMs } = lastRoundResult;

  const myPlayer = room.players.find(p => p.id === mySocketId);
  const isHost = myPlayer?.isHost ?? false;

  function handleNextRound() {
    socket.emit('round:next');
  }

  // Build player rows sorted so "me" is first
  const sorted = [
    ...room.players.filter(p => p.id === mySocketId),
    ...room.players.filter(p => p.id !== mySocketId),
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
      <div className="text-xs text-gray-500 uppercase tracking-widest">Round {room.roundNumber} Result</div>

      <div className="text-sm text-gray-400">
        Target: <span className="text-white font-bold">{formatMs(targetMs)}</span>
        <span className="mx-2">·</span>
        Pot: <span className="text-yellow-400 font-bold">{pot} pts</span>
        {accuracyBonus > 0 && (
          <span className="ml-2 text-cyan-300">+{accuracyBonus} accuracy</span>
        )}
        {lastRoundResult.streakBonus > 0 && (
          <span className="ml-2 text-orange-400">+{lastRoundResult.streakBonus} streak</span>
        )}
      </div>

      <div className="w-full space-y-2">
        {sorted.map(p => {
          const pr = lastRoundResult.players[p.id];
          if (!pr) return null;
          const isWinner = p.id === winnerId;
          const bonus = getAccuracyLabel(pr.error);
          const delta = scoreDeltas[p.id] ?? 0;

          return (
            <div
              key={p.id}
              className={`rounded-lg border p-3 ${
                isWinner
                  ? 'border-cyan-500 bg-cyan-950/30'
                  : 'border-gray-700 bg-gray-900/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {p.name}{p.id === mySocketId ? ' (you)' : ''}
                  {isWinner && ' 🏆'}
                </span>
                {delta > 0 && (
                  <span className="text-green-400 text-sm font-bold">+{delta}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span>Stopped: <span className="text-white">{formatMs(pr.elapsed)}</span></span>
                <span>Error: <span className={isWinner ? 'text-cyan-300' : 'text-gray-300'}>{formatError(pr.error)}</span></span>
                <span>Wager: <span className="text-yellow-400">{pr.wager}</span></span>
              </div>
              {bonus && isWinner && (
                <div className={`text-xs mt-1 font-bold ${bonus.color}`}>{bonus.label}</div>
              )}
            </div>
          );
        })}
      </div>

      {winnerId === null && (
        <div className="text-gray-400 text-sm">It's a tie — both players get their wager back.</div>
      )}

      <ScoreBoard players={room.players} targetScore={room.targetScore} myId={mySocketId} />

      {isHost ? (
        <button
          onClick={handleNextRound}
          className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
        >
          Next Round
        </button>
      ) : (
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse-slow" />
          Waiting for host to start next round...
        </div>
      )}
    </div>
  );
}
