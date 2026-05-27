import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, User, Mail, Trophy, Target } from 'lucide-react';

function ProfilePage({ user, setUser }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    const loadProfile = async () => {
      const result = await api.getProfile();
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (result.success) {
        const mergedUser = {
          ...result.data,
          wins: Math.max(result.data.wins ?? 0, localUser.wins ?? 0),
          losses: Math.max(result.data.losses ?? 0, localUser.losses ?? 0)
        };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
      } else if (localUser && localUser.username) {
        setUser(localUser);
      }
    };

    loadProfile();
  }, [setUser]);

  const gamesPlayed = (user?.wins ?? 0) + (user?.losses ?? 0);
  const winRate = gamesPlayed ? Math.round(((user?.wins ?? 0) / gamesPlayed) * 100) : 0;

  const handleSave = () => {
    // In a real app, you'd call an API to update the profile
    setUser({ ...user, username, email });
    setEditing(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030b] text-white">
      <div className="pointer-events-none absolute left-6 top-14 h-64 w-64 rounded-full bg-cyan-500/12 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-24 h-72 w-72 rounded-full bg-violet-500/12 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.16),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-20">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.85fr]">
          <Card className="overflow-hidden rounded-[32px] border border-cyan-500/20 bg-slate-950/85 shadow-[0_0_70px_rgba(56,189,248,0.14)] backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_35%)]" />
            <div className="relative p-8">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-white">Mi Perfil</CardTitle>
                    <CardDescription className="text-slate-400">Gestiona tu información personal y tu progreso.</CardDescription>
                  </div>
                  <Button
                    onClick={() => navigate('/menu')}
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="mt-8 space-y-8">
                <Card className="rounded-[28px] border border-cyan-500/10 bg-slate-900/80 p-6 shadow-[0_0_30px_rgba(56,189,248,0.12)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-200">
                      <User className="w-5 h-5" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-5">
                    {editing ? (
                      <div className="space-y-5">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-300">Usuario</Label>
                            <Input
                              id="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="bg-slate-900/80 border border-cyan-600/20 text-white placeholder:text-slate-500 focus:border-cyan-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-slate-900/80 border border-cyan-600/20 text-white placeholder:text-slate-500 focus:border-cyan-400"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button
                            onClick={handleSave}
                            variant="gaming"
                            className="flex-1"
                          >
                            Guardar
                          </Button>
                          <Button
                            onClick={() => {
                              setUsername(user?.username || '');
                              setEmail(user?.email || '');
                              setEditing(false);
                            }}
                            variant="outline"
                            className="flex-1 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <div className="text-sm text-slate-400">Usuario</div>
                          <div className="text-lg font-semibold text-white">{user?.username || 'N/A'}</div>
                        </div>
                        <div className="rounded-3xl bg-slate-900/80 p-4">
                          <div className="text-sm text-slate-400">Email</div>
                          <div className="text-lg font-semibold text-white">{user?.email || 'N/A'}</div>
                        </div>
                        <Button
                          onClick={() => setEditing(true)}
                          variant="glow"
                          className="w-full border border-cyan-500/20 text-white"
                        >
                          Editar Perfil
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </CardContent>
            </div>
          </Card>

          <Card className="rounded-[32px] border border-violet-500/20 bg-slate-950/85 p-6 shadow-[0_0_50px_rgba(168,85,247,0.14)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Estadísticas</CardTitle>
              <CardDescription className="text-slate-400">Mira tu rendimiento en batalla.</CardDescription>
            </CardHeader>
            <CardContent className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">Partidas Jugadas</div>
                <div className="mt-2 text-2xl font-semibold text-white">{gamesPlayed}</div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">Victorias</div>
                <div className="mt-2 text-2xl font-semibold text-white">{user?.wins ?? 0}</div>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-4">
                <div className="text-sm uppercase tracking-[0.25em] text-slate-400">Ratio de Victoria</div>
                <div className="mt-2 text-2xl font-semibold text-white">{winRate}%</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
