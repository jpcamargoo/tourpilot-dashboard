'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DEMO_USERS = [
  { role: 'Admin', email: 'admin@example.com', password: 'admin123' },
  { role: 'Guia', email: 'guia@example.com', password: 'guia123' },
  { role: 'Equipe', email: 'equipe@example.com', password: 'equipe123' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doSignIn = async (credEmail: string, credPassword: string) => {
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: credEmail,
        password: credPassword,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSignIn(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            TourPilot Dashboard
          </CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais ou use um perfil demo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-3">
            <p className="text-sm font-semibold text-center text-gray-700">
              Acesso rápido (demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.map((u) => (
                <Button
                  key={u.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => doSignIn(u.email, u.password)}
                >
                  {u.role}
                </Button>
              ))}
            </div>
            <div className="text-xs text-gray-500 text-center pt-2">
              <p>admin@example.com / admin123</p>
              <p>guia@example.com / guia123</p>
              <p>equipe@example.com / equipe123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
