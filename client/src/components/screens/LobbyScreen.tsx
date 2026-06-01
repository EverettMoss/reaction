import { useGame } from '../../store/gameStore';
import RoomCodeDisplay from '../ui/RoomCodeDisplay';

export default function LobbyScreen() {
  const { state } = useGame();
  const { room, disconnectedOpponentName } = state;
  if (!room) return null;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
      <div>
        <h2 className="text-2xl font-bold text-white">Waiting for opponent</h2>
        <p className="text-gray-400 text-sm mt-1">Share this code to invite a friend</p>
      </div>

      <RoomCodeDisplay code={room.code} />

      {disconnectedOpponentName && (
        <div className="text-yellow-400 text-sm bg-yellow-900/20 border border-yellow-700 rounded-lg px-4 py-2">
          {disconnectedOpponentName} disconnected. Waiting for someone new.
        </div>
      )}

      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-slow" />
        Waiting...
      </div>
    </div>
  );
}
