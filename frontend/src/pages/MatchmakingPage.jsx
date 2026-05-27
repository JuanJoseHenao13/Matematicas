import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Search, X } from 'lucide-react';
import api from '../services/api';

function MatchmakingPage({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('searching');
  const [ticketId, setTicketId] = useState(null);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    startMatchmaking();
    return () => {
      // Cleanup if component unmounts
    };
  }, []);

  const startMatchmaking = async () => {
    try {
      setStatus('searching');
      const result = await api.findMatch();
      
      if (result.success) {
        if (result.data.status === 'QUEUED') {
          setTicketId(result.data.ticketId);
          // Poll for match
          pollForMatch(result.data.ticketId);
        } else if (result.data.status === 'MATCHED') {
          setGameId(result.data.gameId);
          setStatus('matched');
          setTimeout(() => {
            navigate('/game', { state: { gameId: result.data.gameId, mode: 'pvp' } });
          }, 1500);
        }
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Matchmaking error:', err);
      setStatus('error');
    }
  };

  const pollForMatch = async (ticketId) => {
    const pollInterval = setInterval(async () => {
      try {
        // In a real app, you'd use WebSocket or long-polling
        // For now, we'll simulate a match after a delay
        setTimeout(() => {
          clearInterval(pollInterval);
          setStatus('matched');
          const mockGameId = 'game_' + Date.now();
          setGameId(mockGameId);
          setTimeout(() => {
            navigate('/game', { state: { gameId: mockGameId, mode: 'pvp' } });
          }, 1500);
        }, 3000);
      } catch (err) {
        clearInterval(pollInterval);
        setStatus('error');
      }
    }, 2000);
  };

  const cancelMatchmaking = () => {
    navigate('/game-mode');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030b] text-white">
      <div className="pointer-events-none absolute left-8 top-14 h-64 w-64 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-24 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.16),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-20">
        <Card className="w-full overflow-hidden rounded-[32px] border border-cyan-500/20 bg-slate-950/85 shadow-[0_0_60px_rgba(56,189,248,0.14)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_35%)]" />
          <div className="relative p-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">Buscando Oponente</CardTitle>
              <CardDescription className="text-slate-400">
                Esperando a que otro jugador se una...
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {status === 'searching' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-cyan-500/30">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/10" />
                    <Search className="relative w-14 h-14 text-cyan-300 animate-bounce" />
                  </div>
                  <div className="text-white text-xl">Buscando jugador...</div>
                  <div className="text-slate-400 text-sm">Tiempo estimado: 30 segundos</div>
                </div>
              )}

              {status === 'matched' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-6xl">🎮</div>
                  <div className="text-2xl font-bold text-emerald-300">¡Partida encontrada!</div>
                  <div className="text-slate-400">Redirigiendo al juego...</div>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-6xl">❌</div>
                  <div className="text-red-400 text-xl">Error al buscar partida</div>
                  <Button
                    onClick={startMatchmaking}
                    variant="gaming"
                    className="px-6 py-4"
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              )}

              <Button
                onClick={cancelMatchmaking}
                variant="outline"
                className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MatchmakingPage;
