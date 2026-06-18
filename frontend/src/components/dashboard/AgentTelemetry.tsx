import { useEffect, useState } from 'react';
import type { AgentLog } from '@/types';

const AGENT_CONFIG = {
  TRIAJE: {
    label: 'Agente Triaje',
    role: 'Orquestador',
    icon: '🔀',
    color: '#818cf8',
    metrics: (log: AgentLog) => [
      { label: 'Mensajes procesados', value: `${log.volume?.toLocaleString('es-PE') ?? 0}`, pct: Math.min(100, ((log.volume ?? 0) / 6000) * 100), color: '#818cf8' },
      { label: 'Precisión de enrutamiento', value: `${((log.precision ?? 0) * 100).toFixed(1)}%`, pct: (log.precision ?? 0) * 100, color: '#22c55e' },
    ],
  },
  ANALISTA: {
    label: 'Agente Analista',
    role: 'RAG · Tasador',
    icon: '🔍',
    color: '#f59e0b',
    metrics: (log: AgentLog) => [
      { label: 'Tasaciones calculadas hoy', value: `${log.volume?.toLocaleString('es-PE') ?? 0}`, pct: Math.min(100, ((log.volume ?? 0) / 2000) * 100), color: '#f59e0b' },
      { label: 'Latencia vectorial promedio', value: `${((log.latencyMs ?? 0) / 1000).toFixed(1)} s`, pct: Math.max(0, 100 - ((log.latencyMs ?? 2000) / 3000) * 100), color: '#22c55e' },
    ],
  },
  COMERCIAL: {
    label: 'Agente Comercial',
    role: 'Cualificador',
    icon: '💬',
    color: '#2dd4bf',
    metrics: (log: AgentLog) => [
      { label: 'Tasa de extracción de datos', value: `${((log.precision ?? 0) * 100).toFixed(1)}%`, pct: (log.precision ?? 0) * 100, color: '#2dd4bf' },
      { label: 'Leads enviados a B2B hoy', value: `${log.volume?.toLocaleString('es-PE') ?? 0}`, pct: Math.min(100, ((log.volume ?? 0) / 150) * 100), color: '#6366f1' },
    ],
  },
  SOPORTE_B2B: {
    label: 'Agente Soporte B2B',
    role: 'Generador ACM',
    icon: '📄',
    color: '#22c55e',
    metrics: (log: AgentLog) => [
      { label: 'Reportes ACM generados hoy', value: `${log.volume?.toLocaleString('es-PE') ?? 0}`, pct: Math.min(100, ((log.volume ?? 0) / 50) * 100), color: '#22c55e' },
      { label: 'Satisfacción corredor', value: `${((log.precision ?? 0) * 100).toFixed(1)}%`, pct: (log.precision ?? 0) * 100, color: '#22c55e' },
    ],
  },
} as const;

interface AgentTelemetryProps {
  logs: AgentLog[];
}

function ProgressBar({ label, value, pct, color, animated }: { label: string; value: string; pct: number; color: string; animated: boolean }) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between mb-1">
        <span className="text-[11.5px] text-text-muted">{label}</span>
        <span className="text-[12px] font-semibold text-text-primary">{value}</span>
      </div>
      <div className="bg-white/[0.06] rounded h-1.5 overflow-hidden">
        <div
          className="h-full rounded transition-all duration-1000 ease-out"
          style={{ width: `${animated ? pct : 0}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function AgentTelemetry({ logs }: AgentTelemetryProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 350);
    return () => clearTimeout(t);
  }, []);

  const logMap = Object.fromEntries(logs.map((l) => [l.agent, l]));

  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      {(Object.entries(AGENT_CONFIG) as [string, typeof AGENT_CONFIG[keyof typeof AGENT_CONFIG]][]).map(([key, cfg]) => {
        const log = logMap[key] ?? { agent: key as AgentLog['agent'], latencyMs: 0, precision: 0, volume: 0 };
        const metrics = cfg.metrics(log);

        return (
          <div key={key} className="bg-bg-card rounded-card p-4 border border-border-subtle">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-lg" style={{ background: `${cfg.color}18` }}>
                {cfg.icon}
              </div>
              <div className="flex-1">
                <div className="text-[12.5px] font-semibold text-text-secondary">{cfg.label}</div>
                <div className="text-[10.5px] text-text-faint">{cfg.role}</div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.05em] rounded-[5px] px-2 py-0.5 border"
                style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}>
                ● Operativo
              </span>
            </div>
            {metrics.map((m, i) => (
              <ProgressBar key={i} {...m} animated={animated} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
