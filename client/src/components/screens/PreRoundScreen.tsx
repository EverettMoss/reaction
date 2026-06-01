import { useState, useEffect } from 'react';
import { socket } from '../../socket';
import { useGame } from '../../store/gameStore';
import { PRE_ROUND_DISPLAY_DURATION_MS } from 'shared';
import WagerSelector from '../ui/WagerSelector';
import ScoreBoard from '../ui/ScoreBoard';
import { formatMs } from '../../lib/utils';

export default function PreRoundScreen() {
  const { state } = useGame();
  const { room, mySocketId } = state;
  const [showWager, setShowWager] = useState(false);
  const [selectedWager, setSelectedWager] = useState<number | null>(null);
  const [wagerSubmitted, setWagerSubmitted] = useState(false);

  const targetMs = room?.currentRound?.targetMs ?? null;
  const myPlayer = room?.players.find(p => p.id === mySocketId);
  const hasPoints = (myPlayer?.score ?? 0) > 0;

  useEffect(() => {
    setShowWager(false);
    setSelectedWager(null);
    setWagerSubmitted(false);
    const t = setTimeout(() => setShowWager(true), PRE_ROUND_DISPLAY_DURATION_MS);
    return () => clearTimeout(t);
  }, [room?.roundNumber]);

  // Auto-submit wager 0 when player has no points — only one valid choice
  useEffect(() => {
    if (showWager && !hasPoints && !wagerSubmitted) {
      setWagerSubmitted(true);
      socket.emit('round:submit_wager', { wager: 0 });
    }
  }, [showWager, hasPoints, wagerSubmitted]);

  if (!room || targetMs === null) return null;

  const roundWagersSubmitted = room.currentRound?.wagersSubmitted ?? {};
  const iSubmitted = mySocketId ? roundWagersSubmitted[mySocketId] ?? false : false;
  const opponentSubmitted = room.players
    .filter(p => p.id !== mySocketId)
    .every(p => roundWagersSubmitted[p.id]);
  const allWagered = room.players.every(p => roundWagersSubmitted[p.id]);
  const isReady = myPlayer?.isReady ?? false;

  function handleWagerSelect(w: number) {
    if (wagerSubmitted) return;
    setSelectedWager(w);
    setWagerSubmitted(true);
    socket.emit('round:submit_wager', { wager: w });
  }

  function handleReady() {
    socket.emit('round:ready');
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
      <div className="text-xs text-gray-500 uppercase tracking-widest">Round {room.roundNumber}</div>

      <ScoreBoard players={room.players} targetScore={room.targetScore} myId={mySocketId} />

      <div className="flex flex-col items-center gap-2 py-6">
        <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Target Interval</div>
        <div className="text-6xl font-bold text-white tabular-nums">{formatMs(targetMs)}</div>
      </div>

      {!showWager && (
        <div className="text-gray-500 text-sm animate-pulse">Memorize the target...</div>
      )}

      {showWager && !iSubmitted && hasPoints && (
        <WagerSelector
          selected={selectedWager}
          onSelect={handleWagerSelect}
          playerScore={myPlayer?.score ?? 0}
        />
      )}

      {iSubmitted && !allWagered && (
        <div className="text-gray-400 text-sm flex items-center gap-2">
          <span>Wager locked in</span>
          {!opponentSubmitted && (
            <span className="text-gray-500">· Waiting for opponent...</span>
          )}
        </div>
      )}

      {allWagered && !isReady && (
        <button
          onClick={handleReady}
          className="w-full py-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg transition-colors"
        >
          Ready
        </button>
      )}

      {isReady && (
        <div className="text-cyan-400 text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-slow" />
          Ready! Waiting for opponent...
        </div>
      )}
    </div>
  );
}
