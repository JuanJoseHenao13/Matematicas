import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030b] text-white">
      <div className="pointer-events-none absolute left-6 top-12 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-24 h-64 w-64 rounded-full bg-violet-500/12 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(148,163,184,0.12),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-20">
        <Card className="relative w-full overflow-hidden rounded-[32px] border border-cyan-500/20 bg-slate-950/85 shadow-[0_0_80px_rgba(56,189,248,0.14)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%)]" />
          <div className="relative p-10">
            <CardHeader className="space-y-5 text-center">
              <CardTitle className="text-5xl font-black tracking-[0.2em] text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text">
                MATHRIFT
              </CardTitle>
              <CardDescription className="text-slate-300 text-xl">
                Bowmasters Math Game - Aprende matemáticas mientras juegas.
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="space-y-5 rounded-[28px] border border-violet-500/10 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
                <p className="text-lg text-slate-200">🎯 Dispara proyectiles usando física matemática real</p>
                <p className="text-lg text-slate-200">🧮 Aprende sobre trayectorias parabólicas y análisis de sensibilidad</p>
                <p className="text-lg text-slate-200">🎮 Juega contra otros jugadores o contra la CPU</p>
                <p className="text-lg text-slate-200">🏆 Sube de nivel y desbloquea nuevos personajes y armas</p>
              </div>

              <div className="space-y-4 rounded-[28px] border border-cyan-500/10 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(56,189,248,0.12)]">
                <div className="text-sm uppercase tracking-[0.3em] text-cyan-300">Inicio rápido</div>
                <Button
                  onClick={() => navigate('/login')}
                  variant="gaming"
                  className="w-full px-6 py-5 text-base"
                >
                  Iniciar Sesión
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="glow"
                  className="w-full px-6 py-5 text-base border border-violet-500/20 text-white"
                >
                  Registrarse
                </Button>
                <Button
                  onClick={() => navigate('/menu')}
                  variant="outline"
                  className="w-full border border-slate-600/50 text-slate-200 hover:bg-slate-800/70"
                >
                  Ver menú
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default WelcomePage;
