import type { Player } from 'shared';

interface Props {
  players: Player[];
  targetScore: number | null;
  myId: string | null;
}

export default function ScoreBoard({ players, targetScore, myId }: Props) {
  return (
    <div className="flex gap-6 justify-center w-full max-w-sm">
      {players.map(p => (
        <div
          key={p.id}
          className={`flex-1 rounded-lg border p-3 text-center ${
            p.id === myId
              ? 'border-cyan-500 bg-cyan-950/30'
              : 'border-gray-700 bg-gray-900/30'
          }`}
        >
          <div className="text-xs text-gray-400 mb-1 truncate">{p.name}{p.id === myId ? ' (you)' : ''}</div>
          <div className="text-2xl font-bold text-white">{p.score}</div>
          {targetScore !== null && (
            <div className="text-xs text-gray-500 mt-0.5">/ {targetScore}</div>
          )}
          {p.streak >= 2 && (
            <div className="text-xs text-orange-400 mt-1 font-bold">{p.streak} streak</div>
          )}
        </div>
      ))}
    </div>
  );
}
