import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react';
import { register } from '@/api/client';
import axios from 'axios';

type AccountType = 'USER' | 'COMPANY';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('USER');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await register({ name, email, password, accountType });
      localStorage.setItem('inmodata_role', data.role);
      localStorage.setItem('inmodata_name', data.name ?? '');
      navigate('/seleccionar-plan');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError('Ya existe una cuenta con ese correo.');
      } else if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError('Revisa los datos: la contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('No se pudo crear la cuenta. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-indigo rounded-[14px] flex items-center justify-center mb-4">
            <Home size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">InmoData IA</h1>
          <p className="text-[12px] text-text-ghost mt-1">Crea tu cuenta · Lima, Perú</p>
        </div>

        <div className="bg-bg-card rounded-card border border-border-subtle p-6">
          <h2 className="text-[15px] font-semibold text-text-secondary mb-1">Registrarse</h2>
          <p className="text-[11px] text-text-ghost mb-5">Elige tu tipo de cuenta y empieza</p>

          {/* Selector de tipo de cuenta */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {([
              { key: 'USER', label: 'Usuario', desc: 'Persona', icon: <User size={16} /> },
              { key: 'COMPANY', label: 'Empresa', desc: 'Inmobiliaria', icon: <Building2 size={16} /> },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setAccountType(opt.key)}
                className={`flex flex-col items-center gap-1 py-3 rounded-[10px] border transition-all ${
                  accountType === opt.key
                    ? 'border-indigo bg-indigo/10 text-text-primary'
                    : 'border-border-subtle text-text-ghost hover:text-text-muted'
                }`}
              >
                {opt.icon}
                <span className="text-[12px] font-semibold">{opt.label}</span>
                <span className="text-[9px] text-text-ghost">{opt.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
                {accountType === 'COMPANY' ? 'Nombre de la empresa' : 'Nombre completo'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={accountType === 'COMPANY' ? 'Inmobiliaria Lima SAC' : 'Juan Pérez'}
                className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
              />
            </div>

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
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
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

            {error && (
              <div className="bg-rose/10 border border-rose/30 text-rose rounded-[10px] px-3.5 py-2.5 text-[12px]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name || !email || password.length < 6}
              className="w-full bg-indigo hover:bg-indigo/85 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-[10px] py-2.5 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Creando cuenta...' : 'Crear cuenta y elegir plan'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border-subtle">
            <p className="text-[10.5px] text-text-ghost text-center">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-indigo-light hover:underline">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
