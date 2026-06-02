import { useGame } from '../../store/gameStore';
import { formatMs, formatError } from '../../lib/utils';

export default function MatchEndScreen() {
  const { state, dispatch } = useGame();
  const { room, mySocketId } = state;

  if (!room) return null;

  const winnerId = room.players.length === 2 && room.players[0].score === room.players[1].score
    ? null
    : room.players.reduce((best, p) =>
        best === null || p.score > (room.players.find(x => x.id === best)?.score ?? 0) ? p.id : best
      , null as string | null);

  const winner = winnerId ? room.players.find(p => p.id === winnerId) : null;
  const isTie = winnerId === null;
  const isWinner = !isTie && mySocketId === winnerId;

  const myRounds = room.roundHistory.filter(r => r.players[mySocketId ?? '']);
  const avgError = myRounds.length > 0
    ? myRounds.reduce((sum, r) => sum + (r.players[mySocketId ?? '']?.error ?? 0), 0) / myRounds.length
    : 0;
  const perfectHits = myRounds.filter(r => (r.players[mySocketId ?? '']?.error ?? 999) <= 10).length;
  const biggestPot = room.roundHistory.reduce((max, r) => Math.max(max, r.pot), 0);

  function handlePlayAgain() {
    // Reset to home by clearing the room state
    dispatch({ type: 'ROOM_UPDATE', room: { ...room!, phase: 'lobby', players: room!.players.map(p => ({ ...p, score: 0 })), roundHistory: [], roundNumber: 0 } });
    // The server will handle rematch via a new room
    window.location.reload();
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
      <div>
        <div className="text-6xl mb-2">{isTie ? '🤝' : isWinner ? '🏆' : '💀'}</div>
        <h2 className="text-3xl font-bold text-white">
          {isTie ? "It's a Tie!" : isWinner ? 'Victory!' : 'Defeated'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {isTie
            ? 'Both players finish with equal points'
            : `${winner?.name} wins with ${winner?.score} points`}
        </p>
      </div>

      <div className="w-full space-y-2">
        {room.players.map(p => (
          <div
            key={p.id}
            className={`rounded-lg border p-3 flex items-center justify-between ${
              p.id === winnerId
                ? 'border-cyan-500 bg-cyan-950/30'
                : 'border-gray-700 bg-gray-900/30'
            }`}
          >
            <span className="font-bold text-white">
              {p.name}{p.id === mySocketId ? ' (you)' : ''}
            </span>
            <span className="text-xl font-bold text-white">{p.score}</span>
          </div>
        ))}
      </div>

      <div className="w-full rounded-lg border border-gray-800 bg-gray-900/30 p-4 text-left space-y-2">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Stats</div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Rounds played</span>
          <span className="text-white">{myRounds.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Avg. error</span>
          <span className="text-white">{formatError(avgError)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Perfect hits (≤10ms)</span>
          <span className="text-cyan-300">{perfectHits}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Biggest pot</span>
          <span className="text-yellow-400">{biggestPot} pts</span>
        </div>
      </div>

      {room.roundHistory.length > 0 && (
        <details className="w-full text-left">
          <summary className="text-xs text-gray-500 uppercase tracking-widest cursor-pointer hover:text-gray-400">
            Round History ({room.roundHistory.length} rounds)
          </summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {room.roundHistory.map(r => {
              const myResult = r.players[mySocketId ?? ''];
              return (
                <div key={r.roundNumber} className="flex items-center justify-between text-xs text-gray-400 py-1 border-b border-gray-800">
                  <span>R{r.roundNumber} · {formatMs(r.targetMs)}</span>
                  {myResult && (
                    <span className={r.winnerId === mySocketId ? 'text-green-400' : 'text-red-400'}>
                      {r.winnerId === mySocketId ? '+' : ''}{r.scoreDeltas[mySocketId ?? ''] ?? 0}
                      <span className="text-gray-600 ml-1">({formatError(myResult.error)})</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}

      <button
        onClick={handlePlayAgain}
        className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}
