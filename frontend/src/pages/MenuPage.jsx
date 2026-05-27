import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { User, Gamepad2, Trophy, LogOut } from 'lucide-react';

function MenuPage({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/welcome');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#040411] text-white">
      <div className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(circle_at_bottom,rgba(148,163,184,0.1),transparent_35%)]" />

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.95fr]">
          <Card className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-slate-950/80 shadow-[0_0_80px_rgba(56,189,248,0.15)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_40%)]" />
            <div className="relative p-10">
              <CardTitle className="text-5xl font-black tracking-[0.08em] text-transparent bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text">
                MATHRIFT
              </CardTitle>
              <CardDescription className="mt-3 max-w-xl text-slate-300 text-lg leading-8">
                Bienvenido, {user?.username || 'Jugador'}. Prepárate para una experiencia con estilo gamer, donde cada partida se siente intensa y llena de energía.
              </CardDescription>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-cyan-500/15 bg-slate-900/80 p-5">
                  <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">Progreso</div>
                  <div className="mt-3 text-3xl font-semibold text-white">Nivel 7</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-cyan-400/90" />
                  </div>
                </div>
                <div className="rounded-3xl border border-violet-500/15 bg-slate-900/80 p-5">
                  <div className="text-xs uppercase tracking-[0.3em] text-violet-300">Estilo</div>
                  <div className="mt-3 text-3xl font-semibold text-white">Modo Mate</div>
                  <div className="mt-2 text-sm text-slate-400">Disfruta de la experiencia de Mathrift</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-[28px] border border-cyan-500/20 bg-slate-950/75 shadow-[0_0_60px_rgba(59,130,246,0.12)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-cyan-200">
                  <Gamepad2 className="w-6 h-6 text-cyan-300" />
                  Jugar
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Empieza una partida rápida o elige un modo de juego.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/game-mode')}
                  variant="gaming"
                  className="w-full"
                >
                  Comenzar partida
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-violet-500/20 bg-slate-950/75 shadow-[0_0_60px_rgba(168,85,247,0.12)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-violet-200">
                  <User className="w-6 h-6 text-violet-300" />
                  Perfil
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Revisa tus datos, nivel y beneficios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="glow"
                  className="w-full"
                >
                  Ver Perfil
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-fuchsia-500/20 bg-slate-950/75 shadow-[0_0_60px_rgba(168,85,247,0.12)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-fuchsia-200">
                  <Trophy className="w-6 h-6 text-fuchsia-300" />
                  Ranking
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Próximamente: sube en la tabla de clasificación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-fuchsia-500/40 text-slate-100 hover:bg-fuchsia-500/10"
                  disabled
                >
                  En desarrollo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuPage;
