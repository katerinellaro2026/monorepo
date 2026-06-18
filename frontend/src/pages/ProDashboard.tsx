import { useApi } from '@/hooks/useApi';
import { fetchLeads, fetchDashboardMetrics } from '@/api/client';
import Header from '@/components/layout/Header';
import KPICard from '@/components/dashboard/KPICard';
import MarketIntelligence from '@/components/dashboard/MarketIntelligence';
import type { Lead } from '@/types';

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Nuevo',
  SOLD: 'Vendido',
  DISCARDED: 'Descartado',
};
const STATUS_COLOR: Record<string, string> = {
  NEW: '#2dd4bf',
  SOLD: '#22c55e',
  DISCARDED: '#f43f5e',
};

function LeadRow({ lead }: { lead: Lead }) {
  return (
    <tr>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-secondary text-[12px] font-medium">
        {lead.user?.name ?? 'Anónimo'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-muted text-[12px]">
        {lead.districtSought ?? '—'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-primary font-bold text-[12px] tabular-nums">
        {lead.budgetExtracted ? `S/ ${lead.budgetExtracted.toLocaleString('es-PE')}` : '—'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-muted text-[12px]">
        {lead.user?.phone ?? lead.phone ?? '—'}
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.05em] rounded-[5px] px-2 py-0.5 border"
          style={{
            color: STATUS_COLOR[lead.status],
            background: `${STATUS_COLOR[lead.status]}18`,
            borderColor: `${STATUS_COLOR[lead.status]}33`,
          }}
        >
          {STATUS_LABEL[lead.status]}
        </span>
      </td>
      <td className="px-3 py-2.5 border-b border-border-muted text-text-ghost text-[11px]">
        {new Date(lead.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
      </td>
    </tr>
  );
}

export default function ProDashboard() {
  const leads = useApi(() => fetchLeads({ status: 'NEW' }));
  const metrics = useApi(fetchDashboardMetrics);

  const m = metrics.data;

  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="InmoData IA — Dashboard Pro"
        subtitle="Corredor · Vista personalizada"
        onRefresh={() => { leads.refetch(); metrics.refetch(); }}
        refreshing={leads.loading}
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <KPICard
          label="Leads asignados (activos)"
          value={String(leads.data?.length ?? 0)}
          icon="🎯"
          accent="#2dd4bf"
        />
        <KPICard
          label="Presupuesto promedio"
          value={
            leads.data && leads.data.length > 0
              ? `S/ ${Math.round(
                  leads.data.reduce((s, l) => s + (l.budgetExtracted ?? 0), 0) / leads.data.length
                ).toLocaleString('es-PE')}`
              : '—'
          }
          icon="💰"
          accent="#6366f1"
        />
        <KPICard
          label="Tasa de conversión"
          value={m ? `${m.kpis.conversionRate}%` : '—'}
          icon="📊"
          accent="#f59e0b"
        />
      </div>

      {/* Leads table */}
      <div className="bg-bg-card rounded-card p-4 border border-border-subtle mb-5">
        <div className="text-[13px] font-semibold text-text-muted mb-0.5">Mis leads activos</div>
        <div className="text-[11px] text-text-ghost mb-4">Prospectos calificados asignados a tu perfil</div>

        {leads.loading ? (
          <div className="h-40 animate-pulse bg-bg-elevated rounded-lg" />
        ) : leads.error ? (
          <div className="text-rose text-sm">{leads.error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {['Contacto', 'Zona', 'Presupuesto', 'Teléfono', 'Estado', 'Recibido'].map((h) => (
                    <th key={h} className="text-left text-text-ghost font-medium px-3 py-2 border-b border-border-subtle text-[10.5px] uppercase tracking-[0.05em]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.data?.map((lead) => <LeadRow key={lead.id} lead={lead} />)}
                {leads.data?.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-text-ghost text-sm">Sin leads activos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Market intelligence (read-only subset) */}
      {m && (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep mb-3 flex items-center gap-2.5">
            Inteligencia de mercado — Tu zona
            <span className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <MarketIntelligence demandVsSupply={m.demandVsSupply} />
        </>
      )}
    </div>
  );
}
