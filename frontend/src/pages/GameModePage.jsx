import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Cpu, ArrowLeft } from 'lucide-react';

function GameModePage({ user }) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030b] text-white">
      <div className="pointer-events-none absolute left-8 top-12 h-64 w-64 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-24 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.16),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-20">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_0.9fr]">
          <Card className="overflow-hidden rounded-[32px] border border-cyan-500/20 bg-slate-950/85 shadow-[0_0_60px_rgba(56,189,248,0.14)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_35%)]" />
            <div className="relative p-8">
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate('/menu')}
                      variant="outline"
                      className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver
                    </Button>
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-white">
                      Selecciona Modo de Juego
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Elige tu próxima batalla con estilo.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Card className="rounded-[28px] border border-cyan-500/10 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(56,189,248,0.12)] transition hover:border-cyan-400/40">
                  <CardTitle className="flex items-center gap-2 text-cyan-200">
                    <Users className="w-6 h-6 text-cyan-300" />
                    Jugador vs Jugador
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Juega contra otro jugador real en partida PVP.
                  </CardDescription>
                  <CardContent className="mt-6">
                    <Button
                      onClick={() => navigate('/matchmaking', { state: { mode: 'pvp' } })}
                      variant="gaming"
                      className="w-full"
                    >
                      Buscar Oponente
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border border-violet-500/10 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(168,85,247,0.12)] transition hover:border-violet-400/40">
                  <CardTitle className="flex items-center gap-2 text-violet-200">
                    <Cpu className="w-6 h-6 text-violet-300" />
                    Jugador vs CPU
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Practica con la IA y afina tu puntería.
                  </CardDescription>
                  <CardContent className="mt-6">
                    <Button
                      onClick={() => navigate('/game', { state: { mode: 'cpu' } })}
                      variant="glow"
                      className="w-full border border-violet-500/20 text-white"
                    >
                      Jugar vs CPU
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>

          <Card className="rounded-[32px] border border-fuchsia-500/20 bg-slate-950/85 p-6 shadow-[0_0_60px_rgba(168,85,247,0.12)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Nivel de Energía</CardTitle>
              <CardDescription className="text-slate-400">
                Tu sala lista para la próxima misión.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">Combate</div>
                <div className="mt-3 text-2xl font-semibold text-white">Listo para las opciones</div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">Consejo</div>
                <div className="mt-3 text-white">Elige el modo que mejor se adapte a tu estilo de juego.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default GameModePage;
