import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      if (result.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setUser(result.data.user);
        navigate('/menu');
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030b] text-white">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_bottom,rgba(56,189,248,0.16),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-20">
        <Card className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-cyan-500/20 bg-slate-950/85 shadow-[0_0_60px_rgba(56,189,248,0.14)] backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-cyan-500/20 via-violet-500/15 to-fuchsia-500/10" />
          <div className="relative p-10">
            <CardHeader className="space-y-3 text-center">
              <CardTitle className="text-4xl font-black tracking-[0.2em] text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text">
                MATHRIFT
              </CardTitle>
              <CardDescription className="text-slate-300">
                Inicia sesión y entra al campo de batalla.
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-900/80 border border-cyan-600/20 text-white placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-900/80 border border-cyan-600/20 text-white placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
                {error && (
                  <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-200">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  variant="gaming"
                  className="w-full px-6 py-4 text-base"
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-300">
              <div>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Regístrate
                </button>
              </div>
              <div>
                <button
                  onClick={() => navigate('/welcome')}
                  className="font-semibold text-violet-300 hover:text-violet-200"
                >
                  Volver al inicio
                </button>
              </div>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
