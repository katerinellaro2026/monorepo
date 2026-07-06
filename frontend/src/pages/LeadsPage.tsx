import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Users, Lock, Phone, Mail } from 'lucide-react';
import { fetchLeadsFeature } from '@/api/client';

interface LeadRow {
  id: string; name: string; phone: string; email: string;
  budgetSOL: number; district: string; status: string; createdAt: string;
}
interface LeadsData {
  tier: string; masked: boolean; limitApplied: number | null; total: number;
  summary: { new: number; avgBudgetSOL: number };
  leads: LeadRow[];
}

const STATUS_COLOR: Record<string, string> = {
  NEW: '#22c55e', SOLD: '#6366f1', DISCARDED: '#475569',
};

export default function LeadsPage() {
  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadsFeature().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="animate-spin text-text-ghost" /></div>;
  }
  if (!data) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-ghost text-sm">No se pudieron cargar los leads.</div>;
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-teal" />
          <h1 className="text-xl font-black text-text-primary">Leads</h1>
        </div>
        <p className="text-[12px] text-text-ghost mb-5">Prospectos calificados por la IA a partir de las conversaciones</p>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-bg-card rounded-card border border-border-subtle p-4 text-center">
            <div className="text-xl font-black text-emerald">{data.summary.new}</div>
            <div className="text-[9.5px] text-text-ghost">Leads nuevos</div>
          </div>
          <div className="bg-bg-card rounded-card border border-border-subtle p-4 text-center">
            <div className="text-xl font-black text-indigo">{data.total}</div>
            <div className="text-[9.5px] text-text-ghost">Total en el sistema</div>
          </div>
          <div className="bg-bg-card rounded-card border border-border-subtle p-4 text-center">
            <div className="text-xl font-black text-amber">S/ {data.summary.avgBudgetSOL.toLocaleString('es-PE')}</div>
            <div className="text-[9.5px] text-text-ghost">Presupuesto promedio</div>
          </div>
        </div>

        {/* Aviso plan Básico */}
        {data.masked && (
          <div className="flex items-start gap-2 bg-amber/10 border border-amber/30 rounded-xl px-4 py-3 mb-4">
            <Lock size={15} className="text-amber flex-shrink-0 mt-0.5" />
            <div className="text-[11.5px] text-amber">
              <strong>Plan Básico:</strong> ves {data.limitApplied} leads con contacto parcialmente oculto.
              Mejora a <Link to="/seleccionar-plan" className="underline font-semibold">Pro</Link> para ver todos los leads con contacto completo.
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-bg-card rounded-card border border-border-subtle overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle text-[9.5px] text-text-faint uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Prospecto</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Distrito</th>
                <th className="px-4 py-3 font-medium text-right">Presupuesto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {data.leads.map((l) => (
                <tr key={l.id} className="border-b border-border-subtle last:border-0 text-[11.5px]">
                  <td className="px-4 py-3 text-text-secondary font-medium">{l.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-text-ghost"><Phone size={11} /> {l.phone}</div>
                    <div className="flex items-center gap-1.5 text-text-ghost"><Mail size={11} /> {l.email}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{l.district}</td>
                  <td className="px-4 py-3 text-right text-text-secondary font-semibold">
                    {l.budgetSOL ? `S/ ${l.budgetSOL.toLocaleString('es-PE')}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${STATUS_COLOR[l.status] ?? '#475569'}18`, color: STATUS_COLOR[l.status] ?? '#475569' }}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-ghost">{new Date(l.createdAt).toLocaleDateString('es-PE')}</td>
                </tr>
              ))}
              {data.leads.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-text-ghost text-sm">Aún no hay leads registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
