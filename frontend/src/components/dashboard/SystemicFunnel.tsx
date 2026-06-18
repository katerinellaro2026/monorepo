import { Users, Eye, Target, Building2 } from 'lucide-react';

interface FunnelData {
  usersB2C: number;
  intentionDiscovered: number;
  qualifiedLeads: number;
  soldLeads: number;
}

function pct(a: number, b: number) {
  if (b === 0) return 0;
  return Math.round((a / b) * 100);
}

const STAGES = [
  { key: 'usersB2C',             label: 'Usuarios B2C Gratuitos',    icon: Users,     color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { key: 'intentionDiscovered',  label: 'Descubrimiento de Intención', icon: Eye,       color: '#2dd4bf', bg: 'rgba(20,184,166,0.12)' },
  { key: 'qualifiedLeads',       label: 'Leads Calificados',          icon: Target,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'soldLeads',            label: 'Agencias B2B / Monetización', icon: Building2, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
] as const;

export default function SystemicFunnel({ data }: { data: FunnelData }) {
  const values = [data.usersB2C, data.intentionDiscovered, data.qualifiedLeads, data.soldLeads];
  const max = Math.max(...values, 1);

  return (
    <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
      <div className="text-[13px] font-semibold text-text-muted mb-0.5">Funnel sistémico</div>
      <div className="text-[11px] text-text-ghost mb-4">Volumen y tasa de conversión por etapa</div>

      <div className="flex flex-col gap-2">
        {STAGES.map((stage, i) => {
          const val = values[i];
          const convPct = i > 0 ? pct(val, values[i - 1]) : 100;
          const barW = Math.round((val / max) * 100);
          const Icon = stage.icon;

          return (
            <div key={stage.key}>
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="w-8 h-8 rounded-[8px] flex-shrink-0 flex items-center justify-center" style={{ background: stage.bg }}>
                  <Icon size={15} style={{ color: stage.color }} />
                </div>

                {/* Bar */}
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11.5px] text-text-muted">{stage.label}</span>
                    <span className="text-[12px] font-bold text-text-primary">{val.toLocaleString('es-PE')}</span>
                  </div>
                  <div className="bg-white/[0.06] rounded h-2 overflow-hidden">
                    <div className="h-full rounded transition-all duration-700" style={{ width: `${barW}%`, background: stage.color }} />
                  </div>
                </div>

                {/* Conversion */}
                <div className="w-12 text-right">
                  {i > 0 && (
                    <span className="text-[11px] font-semibold" style={{ color: stage.color }}>
                      {convPct}%
                    </span>
                  )}
                </div>
              </div>

              {/* Connector arrow */}
              {i < STAGES.length - 1 && (
                <div className="flex items-center gap-3 my-0.5">
                  <div className="w-8" />
                  <div className="flex-1 flex items-center gap-1 pl-1">
                    <div className="w-px h-3 bg-white/10 ml-3.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
