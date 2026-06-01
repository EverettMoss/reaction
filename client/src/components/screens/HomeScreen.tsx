import { useState } from 'react';
import { socket } from '../../socket';
import { useGame } from '../../store/gameStore';

export default function HomeScreen() {
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'pick' | 'join'>('pick');

  function handleCreate() {
    if (!name.trim()) return;
    dispatch({ type: 'SET_NAME', name: name.trim() });
    socket.emit('room:create', { playerName: name.trim() });
  }

  function handleJoin() {
    if (!name.trim() || !joinCode.trim()) return;
    dispatch({ type: 'SET_NAME', name: name.trim() });
    socket.emit('room:join', { roomCode: joinCode.trim().toUpperCase(), playerName: name.trim() });
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">Precision Duel</h1>
        <p className="text-gray-400 text-sm mt-2">Stop the timer. Win the pot.</p>
      </div>

      <div className="w-full">
        <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && mode === 'join' && handleJoin()}
          placeholder="Enter your name"
          maxLength={20}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {mode === 'pick' && (
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold transition-colors"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode('join')}
            disabled={!name.trim()}
            className="w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-gray-300 font-bold transition-colors"
          >
            Join Room
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="flex flex-col gap-3 w-full">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Room Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="ABCD"
              maxLength={4}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors text-center text-2xl font-bold tracking-[0.5em]"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={!name.trim() || joinCode.length < 4}
            className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold transition-colors"
          >
            Join
          </button>
          <button
            onClick={() => { setMode('pick'); setJoinCode(''); }}
            className="w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold transition-colors"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
