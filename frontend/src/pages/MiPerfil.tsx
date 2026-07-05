import { useEffect, useState, FormEvent } from 'react';
import { Loader2, Check } from 'lucide-react';
import { fetchMe, updateMyProfile } from '@/api/client';
import { ROLE_LABEL } from '@/data/plans';

export default function MiPerfil() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then((r) => {
        setName(r.user.name ?? '');
        setEmail(r.user.email ?? '');
        setPhone(r.user.phone ?? '');
        setRole(r.user.role);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setSaving(true);
    try {
      await updateMyProfile({
        name,
        email,
        phone,
        ...(password ? { password } : {}),
      });
      localStorage.setItem('inmodata_name', name);
      setPassword('');
      setOk(true);
    } catch {
      setError('No se pudieron guardar los cambios. Revisa el correo (puede estar en uso).');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <Loader2 className="animate-spin text-text-ghost" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-black text-text-primary mb-1">Mi perfil</h1>
        <p className="text-[12px] text-text-ghost mb-6">Cuenta {ROLE_LABEL[role] ?? role}</p>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-card border border-border-subtle p-6 space-y-4">
          <div>
            <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
              {role === 'BROKER' ? 'Nombre de la empresa' : 'Nombre'}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
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
              className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
              Teléfono
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="999000000"
              className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1.5">
              Nueva contraseña <span className="text-text-ghost normal-case">(opcional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
              className="w-full bg-bg-surface border border-border-subtle rounded-[10px] px-3.5 py-2.5 text-sm text-text-secondary placeholder-text-ghost outline-none focus:border-indigo/50 focus:ring-1 focus:ring-indigo/25 transition-all"
            />
          </div>

          {error && (
            <div className="bg-rose/10 border border-rose/30 text-rose rounded-[10px] px-3.5 py-2.5 text-[12px]">
              {error}
            </div>
          )}
          {ok && (
            <div className="bg-emerald/10 border border-emerald/30 text-emerald rounded-[10px] px-3.5 py-2.5 text-[12px] flex items-center gap-2">
              <Check size={14} /> Cambios guardados.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo hover:bg-indigo/85 disabled:opacity-50 text-white font-semibold text-sm rounded-[10px] py-2.5 flex items-center justify-center gap-2 transition-all"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
