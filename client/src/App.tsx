import { useSocket } from './hooks/useSocket';
import { useGame } from './store/gameStore';
import HomeScreen from './components/screens/HomeScreen';
import LobbyScreen from './components/screens/LobbyScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import PreRoundScreen from './components/screens/PreRoundScreen';
import TimingScreen from './components/screens/TimingScreen';
import RoundResultScreen from './components/screens/RoundResultScreen';
import MatchEndScreen from './components/screens/MatchEndScreen';

function ErrorToast() {
  const { state } = useGame();
  if (!state.errorMessage) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 text-red-100 px-6 py-3 rounded-lg text-sm shadow-xl">
      {state.errorMessage}
    </div>
  );
}

function GameScreens() {
  const { state } = useGame();
  const { room } = state;

  if (!room) return <HomeScreen />;

  switch (room.phase) {
    case 'lobby':    return <LobbyScreen />;
    case 'settings': return <SettingsScreen />;
    case 'pre_round': return <PreRoundScreen />;
    case 'timing':   return <TimingScreen />;
    case 'round_result': return <RoundResultScreen />;
    case 'match_end': return <MatchEndScreen />;
    default: return <HomeScreen />;
  }
}

export default function App() {
  useSocket();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <ErrorToast />
      <GameScreens />
    </div>
  );
}
