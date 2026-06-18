import { useState } from 'react';
import Header from '@/components/layout/Header';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import TransactionsTable from '@/components/dashboard/TransactionsTable';
import StrategicCompass from '@/components/dashboard/StrategicCompass';
import DataSources from '@/components/dashboard/DataSources';
import AgentTelemetry from '@/components/dashboard/AgentTelemetry';
import MarketIntelligence from '@/components/dashboard/MarketIntelligence';
import SystemicFunnel from '@/components/dashboard/SystemicFunnel';
import { useApi } from '@/hooks/useApi';
import { fetchDashboardMetrics, fetchRevenueByMonth, fetchTransactions } from '@/api/client';

const TABS = ['📊 Rendimiento B2B', '⚙️ Visión Sistémica'];

function SectionLine({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep">
      {children}
      <span className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

function LoadingCard() {
  return <div className="bg-bg-card rounded-card p-4 border border-border-subtle animate-pulse h-28" />;
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="bg-rose/10 border border-rose/30 text-rose rounded-card px-4 py-3 text-sm mb-4">
      Error cargando datos: {msg}
    </div>
  );
}

export default function CommandCenter() {
  const [tab, setTab] = useState(0);

  const metrics = useApi(fetchDashboardMetrics);
  const revenue = useApi(fetchRevenueByMonth);
  const transactions = useApi(() => fetchTransactions(5));

  const { data: m } = metrics;

  function formatSOL(n: number) {
    return `S/ ${n.toLocaleString('es-PE')}`;
  }

  function formatPct(n: number | null, up?: boolean) {
    if (n == null) return undefined;
    return `${Math.abs(n).toFixed(1)}% vs. mes anterior`;
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="InmoData IA — Centro de Comando"
        subtitle="CEO Dashboard · Junio 2026"
        onRefresh={() => { metrics.refetch(); revenue.refetch(); transactions.refetch(); }}
        refreshing={metrics.loading}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-bg-surface border border-border-subtle rounded-card p-1">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex-1 py-2.5 text-center text-[13px] font-medium rounded-[9px] transition-all duration-200 ${
              tab === i
                ? 'bg-bg-elevated text-text-secondary border border-border-subtle'
                : 'text-text-faint hover:text-text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 1: B2B Performance ── */}
      {tab === 0 && (
        <div className="animate-fadeIn">
          {metrics.error && <ErrorBanner msg={metrics.error} />}

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {metrics.loading || !m ? (
              Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)
            ) : (
              <>
                <KPICard
                  label="MRR Suscripciones SaaS"
                  value={formatSOL(m.kpis.mrrSOL)}
                  change={formatPct(m.kpis.mrrChangePct)}
                  up={(m.kpis.mrrChangePct ?? 0) >= 0}
                  icon="💳"
                  accent="#6366f1"
                />
                <KPICard
                  label="Ingresos por Leads (CPL)"
                  value={formatSOL(m.kpis.cplSOL)}
                  change={formatPct(m.kpis.cplChangePct)}
                  up={(m.kpis.cplChangePct ?? 0) >= 0}
                  icon="🎯"
                  accent="#2dd4bf"
                />
                <KPICard
                  label="Corredores activos"
                  value={String(m.kpis.activeBrokers)}
                  icon="🏢"
                  accent="#22c55e"
                />
                <KPICard
                  label="Tasa de conversión"
                  value={`${m.kpis.conversionRate}%`}
                  icon="📊"
                  accent="#f59e0b"
                />
              </>
            )}
          </div>

          {/* Revenue chart */}
          {revenue.loading ? (
            <div className="bg-bg-card rounded-card p-4 border border-border-subtle h-80 animate-pulse mb-4" />
          ) : revenue.data ? (
            <RevenueChart data={revenue.data} />
          ) : null}

          {/* Transactions */}
          {transactions.loading ? (
            <div className="bg-bg-card rounded-card p-4 border border-border-subtle h-60 animate-pulse" />
          ) : transactions.data ? (
            <TransactionsTable transactions={transactions.data} />
          ) : null}
        </div>
      )}

      {/* ── Tab 2: Systemic Vision ── */}
      {tab === 1 && (
        <div className="animate-fadeIn">
          {/* Strategic Compass */}
          <StrategicCompass />

          {/* 2.1 Data Sources */}
          <SectionLine>2.1 · Fuentes de datos — Inputs del sistema</SectionLine>
          {metrics.loading || !m ? (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)}
            </div>
          ) : (
            <DataSources
              extractedToday={m.dataSources.propertiesExtractedToday}
              totalActive={m.dataSources.totalActiveProperties}
              ddpTotal={m.dataSources.ddpTotal}
              ddpNewThisWeek={m.dataSources.ddpNewThisWeek}
              vectorDocsIndexed={m.dataSources.vectorDocsIndexed}
            />
          )}

          {/* 2.2 Agent Telemetry */}
          <SectionLine>2.2 · Telemetría de agentes IA — El procesamiento</SectionLine>
          {metrics.loading || !m ? (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {Array.from({ length: 4 }).map((_, i) => <LoadingCard key={i} />)}
            </div>
          ) : (
            <AgentTelemetry logs={m.agentTelemetry} />
          )}

          {/* 2.3 Business Intelligence */}
          <SectionLine>2.3 · Inteligencia de negocio — Visión empresarial</SectionLine>
          {metrics.loading || !m ? (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {Array.from({ length: 2 }).map((_, i) => <LoadingCard key={i} />)}
            </div>
          ) : (
            <MarketIntelligence demandVsSupply={m.demandVsSupply} />
          )}

          {/* Funnel */}
          <div className="mt-5">
            <SectionLine>Funnel sistémico — Etapas del negocio</SectionLine>
            {metrics.loading || !m ? (
              <LoadingCard />
            ) : (
              <SystemicFunnel data={m.funnel} />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-7 pt-4 border-t border-white/[0.06] flex justify-between text-[11px] text-text-deep">
        <span>InmoData IA · Datos en tiempo real</span>
        <span>Lince · Jesús María · Miraflores, Lima — Perú</span>
      </div>
    </div>
  );
}
