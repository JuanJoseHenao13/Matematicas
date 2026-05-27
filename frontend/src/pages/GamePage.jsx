import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import PhaserGame from '../components/PhaserGame';
import GameScene from '../scenes/GameScene';

function GamePage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [gameMode, setGameMode] = useState('cpu');
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    if (location.state) {
      setGameMode(location.state.mode || 'cpu');
      setGameId(location.state.gameId || null);
    }
  }, [location.state]);

  const handleExit = () => {
    navigate('/menu');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#02030b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-950/95 to-transparent" />

      <div className="absolute left-6 top-6 z-20 grid gap-4 rounded-[28px] border border-cyan-500/20 bg-slate-950/80 p-4 shadow-[0_0_36px_rgba(56,189,248,0.18)] backdrop-blur-xl">
        <div className="text-xs uppercase tracking-[0.35em] text-cyan-300">ARENA</div>
        <div className="text-xl font-semibold text-white">MathRift Arena</div>
        <div className="text-sm text-slate-300">Modo {gameMode === 'cpu' ? 'VS CPU' : 'VS PVP'}</div>
      </div>

      <div className="absolute right-6 top-6 z-20">
        <Button
          onClick={handleExit}
          variant="glow"
          className="border border-red-500/50 bg-red-600/10 text-red-100 hover:bg-red-600/20"
        >
          Salir del Juego
        </Button>
      </div>

      <div className="absolute inset-4 z-10 overflow-hidden rounded-[36px] border border-cyan-500/15 bg-slate-950/70 shadow-[0_0_80px_rgba(59,130,246,0.14)] backdrop-blur-xl">
        <PhaserGame
          scenes={[GameScene]}
          onGameReady={(game) => {
            game.registry.set('user', user);
            game.registry.set('gameMode', gameMode);
            if (gameId) {
              game.registry.set('gameId', gameId);
            }
          }}
        />
      </div>

    </div>
  );
}

export default GamePage;
