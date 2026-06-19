import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, Loader2 } from 'lucide-react';
import { login } from '@/api/client';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('inmodata_role', data.role);
      localStorage.setItem('inmodata_name', data.name ?? '');
      if (data.role === 'ADMIN') navigate('/command-center');
      else if (data.role === 'BROKER') navigate('/pro-dashboard');
      else navigate('/chat');
    } catch {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo rounded-[14px] flex items-center justify-center mb-4">
            <Home size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">InmoData IA</h1>
          <p className="text-[12px] text-text-ghost mt-1">Plataforma PropTech · Lima, Perú</p>
        </div>

        {/* Card */}
        <div className="bg-bg-card rounded-card border border-border-subtle p-6">
          <h2 className="text-[15px] font-semibold text-text-secondary mb-1">Iniciar sesión</h2>
          <p className="text-[11px] text-text-ghost mb-5">Accede a tu panel de control</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 pr-10 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-ghost hover:text-text-muted transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-rose/10 border border-rose/30 text-rose rounded-[10px] px-3.5 py-2.5 text-[12px]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-indigo hover:bg-indigo/85 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[10px] py-2.5 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Iniciando sesión...' : 'Entrar'}
            </button>
          </form>

          {/* Dev hint */}
          <div className="mt-5 pt-4 border-t border-border-subtle">
            <p className="text-[10.5px] text-text-ghost text-center">
              ¿No tienes cuenta? Contacta al administrador del sistema.
            </p>
          </div>
        </div>

        {/* Public chat link */}
        <p className="text-center mt-4 text-[11px] text-text-ghost">
          ¿Solo quieres tasar una propiedad?{' '}
          <a href="/chat" className="text-indigo-light hover:underline">
            Usar el chat gratuito →
          </a>
        </p>
      </div>
    </div>
  );
}
