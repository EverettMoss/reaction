import { socket } from '../../socket';
import { useGame } from '../../store/gameStore';
import { MATCH_LENGTH_OPTIONS } from 'shared';
import type { MatchLengthTier } from 'shared';

export default function SettingsScreen() {
  const { state } = useGame();
  const { room, mySocketId } = state;
  if (!room) return null;

  const me = room.players.find(p => p.id === mySocketId);
  const isHost = me?.isHost ?? false;
  const opponent = room.players.find(p => p.id !== mySocketId);

  function handleChoose(tier: MatchLengthTier) {
    socket.emit('settings:choose_length', { tier });
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
      <div>
        <h2 className="text-2xl font-bold text-white">Match Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          {isHost ? 'Choose how long you want to play' : `Waiting for ${opponent?.name ?? 'host'} to choose...`}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {MATCH_LENGTH_OPTIONS.map(opt => (
          <button
            key={opt.tier}
            onClick={() => isHost && handleChoose(opt.tier)}
            disabled={!isHost}
            className={`w-full py-4 rounded-lg border font-bold transition-all ${
              isHost
                ? 'border-gray-700 bg-gray-900 hover:border-cyan-500 hover:bg-cyan-950/30 text-white cursor-pointer'
                : 'border-gray-800 bg-gray-900/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <div className="text-lg">{opt.label}</div>
            <div className="text-xs text-gray-500 font-normal mt-0.5">
              Target score: {opt.min}–{opt.max} pts
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-600">
        Playing: {room.players.map(p => p.name).join(' vs ')}
      </div>
    </div>
  );
}
