import { WAGER_OPTIONS } from 'shared';

interface Props {
  selected: number | null;
  onSelect: (wager: number) => void;
  playerScore: number;
  disabled?: boolean;
}

export default function WagerSelector({ selected, onSelect, playerScore, disabled }: Props) {
  const maxWager = playerScore;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs text-gray-400 uppercase tracking-widest">Choose your wager</div>
      <div className="flex gap-2">
        {WAGER_OPTIONS.map(w => {
          const unaffordable = w > maxWager;
          const isDisabled = disabled || unaffordable;
          return (
            <button
              key={w}
              onClick={() => !isDisabled && onSelect(w)}
              disabled={isDisabled}
              className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                selected === w
                  ? 'bg-cyan-500 text-gray-950 scale-110 shadow-lg shadow-cyan-500/30'
                  : isDisabled
                  ? 'bg-gray-800/40 text-gray-700 cursor-not-allowed'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
