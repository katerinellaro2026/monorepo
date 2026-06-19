import { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar,
} from 'recharts';

/* ─── Tokens ─────────────────────────────────────────────────────── */
const C = {
  indigo: '#6366f1', teal: '#2dd4bf', amber: '#f59e0b',
  green: '#22c55e', rose: '#f43f5e', violet: '#a78bfa',
  orange: '#f97316', sky: '#38bdf8', slate: '#475569', muted: '#94a3b8',
};
const ttStyle = {
  backgroundColor: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', fontSize: '11px', color: '#e2e8f0', padding: '8px 12px',
};

/* ─── Tipos ──────────────────────────────────────────────────────── */
interface ScenarioVars {
  corredores: number;
  precioCpl: number;
  tasaConversion: number;
  distritos: number;
  latenciaMs: number;
  invMarketing: number;
  leadsPerMonth: number;
}

interface ComputedMetrics {
  mrrSaas: number; mrrCpl: number; mrrTotal: number;
  costoMensual: number; utilidad: number; roiPct: number;
  nps: number; precisionTriaje: number; propiedades: number;
  uptime: number; coberturaLimaPct: number; cac: number;
}

type ScenarioKey = 'base' | 'optimista' | 'pesimista' | 'custom';

/* ─── Escenarios predefinidos ────────────────────────────────────── */
const PRESET: Record<Exclude<ScenarioKey, 'custom'>, ScenarioVars> = {
  base: {
    corredores: 10, precioCpl: 320, tasaConversion: 8,
    distritos: 3, latenciaMs: 1800, invMarketing: 500, leadsPerMonth: 50,
  },
  optimista: {
    corredores: 50, precioCpl: 420, tasaConversion: 14,
    distritos: 9, latenciaMs: 1200, invMarketing: 2500, leadsPerMonth: 160,
  },
  pesimista: {
    corredores: 3, precioCpl: 250, tasaConversion: 3,
    distritos: 3, latenciaMs: 2700, invMarketing: 150, leadsPerMonth: 10,
  },
};

/* ─── Motor de cálculo ───────────────────────────────────────────── */
function compute(v: ScenarioVars): ComputedMetrics {
  const mrrSaas     = v.corredores * 150;
  const mrrCpl      = v.leadsPerMonth * v.precioCpl;
  const mrrTotal    = mrrSaas + mrrCpl;
  const costoMensual = 300 + v.invMarketing + v.distritos * 55 + v.corredores * 4;
  const utilidad    = mrrTotal - costoMensual;
  const roiPct      = costoMensual > 0 ? Math.round((utilidad / costoMensual) * 100) : 0;
  const nps         = Math.min(72, Math.max(0, Math.round(v.tasaConversion * 4.5 + v.corredores * 0.4)));
  const precisionTriaje = Math.min(99, Math.round(88 + v.distritos * 1.2 + v.leadsPerMonth * 0.04));
  const propiedades = v.distritos * 35;
  const uptime      = Math.min(99.9, 97 + v.distritos * 0.2 + (v.latenciaMs < 1500 ? 1 : 0));
  const coberturaLimaPct = Math.min(100, Math.round((v.distritos / 19) * 100));
  const cac         = v.corredores > 0 ? Math.round((costoMensual * 0.35) / v.corredores) : 0;
  return { mrrSaas, mrrCpl, mrrTotal, costoMensual, utilidad, roiPct,
           nps, precisionTriaje, propiedades, uptime, coberturaLimaPct, cac };
}

/* ─── BSC Semáforo ───────────────────────────────────────────────── */
const BSC_TARGETS = {
  financiera:  { mrrTotal: 17500, roiPct: 100, utilidad: 0 },
  clientes:    { nps: 40, tasaConversion: 8, leadsPerMonth: 50 },
  procesos:    { latenciaMs: 1500, precisionTriaje: 95, propiedades: 100 },
  aprendizaje: { distritos: 6, coberturaLimaPct: 30, uptime: 99 },
};

function scoreFinanciera(m: ComputedMetrics) {
  const s1 = Math.min(1, m.mrrTotal / BSC_TARGETS.financiera.mrrTotal);
  const s2 = Math.min(1, Math.max(0, m.roiPct) / BSC_TARGETS.financiera.roiPct);
  const s3 = m.utilidad >= 0 ? 1 : 0;
  return Math.round(((s1 + s2 + s3) / 3) * 100);
}
function scoreClientes(m: ComputedMetrics, v: ScenarioVars) {
  const s1 = Math.min(1, m.nps / BSC_TARGETS.clientes.nps);
  const s2 = Math.min(1, v.tasaConversion / BSC_TARGETS.clientes.tasaConversion);
  const s3 = Math.min(1, v.leadsPerMonth / BSC_TARGETS.clientes.leadsPerMonth);
  return Math.round(((s1 + s2 + s3) / 3) * 100);
}
function scoreProcesos(m: ComputedMetrics, v: ScenarioVars) {
  const s1 = Math.min(1, BSC_TARGETS.procesos.latenciaMs / v.latenciaMs);
  const s2 = Math.min(1, m.precisionTriaje / BSC_TARGETS.procesos.precisionTriaje);
  const s3 = Math.min(1, m.propiedades / BSC_TARGETS.procesos.propiedades);
  return Math.round(((s1 + s2 + s3) / 3) * 100);
}
function scoreAprendizaje(m: ComputedMetrics, v: ScenarioVars) {
  const s1 = Math.min(1, v.distritos / BSC_TARGETS.aprendizaje.distritos);
  const s2 = Math.min(1, m.coberturaLimaPct / BSC_TARGETS.aprendizaje.coberturaLimaPct);
  const s3 = Math.min(1, m.uptime / BSC_TARGETS.aprendizaje.uptime);
  return Math.round(((s1 + s2 + s3) / 3) * 100);
}

function semaforo(score: number): { color: string; label: string; bg: string } {
  if (score >= 75) return { color: C.green,  label: 'ÓPTIMO',   bg: `${C.green}15` };
  if (score >= 45) return { color: C.amber,  label: 'ALERTA',   bg: `${C.amber}15` };
  return              { color: C.rose,   label: 'CRÍTICO',  bg: `${C.rose}15` };
}

/* ─── Decisiones de agentes IA ───────────────────────────────────── */
interface AgentDecision {
  action: string; outcome: string; confidence: number; impact: string;
}

function getAgentDecisions(v: ScenarioVars, m: ComputedMetrics): Record<string, AgentDecision> {
  const volumen = v.leadsPerMonth;

  const triaje: AgentDecision = volumen > 100
    ? { action: 'Activa caché de patrones frecuentes y enrutamiento batch', outcome: `${m.precisionTriaje}% precisión con latencia reducida`, confidence: 96, impact: 'Alto — escala sin incremento de costo LLM' }
    : volumen > 30
    ? { action: 'Clasifica y enruta intent en tiempo real, modelo estándar', outcome: `${m.precisionTriaje}% precisión, latencia ~${v.latenciaMs}ms`, confidence: 92, impact: 'Medio — operación normal, sin optimizaciones adicionales' }
    : { action: 'Modo conservador: enruta al Analista por defecto', outcome: `${m.precisionTriaje}% precisión con bajo volumen`, confidence: 78, impact: 'Bajo — modelo subutilizado, costo fijo elevado por lead' };

  const analista: AgentDecision = v.distritos >= 9
    ? { action: 'RAG profundo: 9+ distritos, pgvector con alta densidad de comparables', outcome: `~${m.propiedades} propiedades comparables disponibles`, confidence: 95, impact: 'Alto — valuaciones con margen de error <8%' }
    : v.distritos >= 3
    ? { action: 'RAG estándar: 3 distritos activos, complementa con BCRP IVT Q4 2025', outcome: `~${m.propiedades} propiedades indexadas`, confidence: 85, impact: 'Medio — buena precisión con soporte de datos oficiales BCRP' }
    : { action: 'Fallback a BCRP puro: insuficientes comparables reales en BD', outcome: 'Valuación indicativa solo con datos oficiales BCRP', confidence: 60, impact: 'Bajo — mayor incertidumbre, sin comparables de mercado local' };

  const comercial: AgentDecision = m.mrrCpl > 40000
    ? { action: 'Pipeline activo: extracción 4 datos + notificación WhatsApp al corredor', outcome: `${volumen} leads calificados/mes, asignación automática por zona`, confidence: 94, impact: 'Alto — ciclo lead→corredor en <2 min' }
    : m.mrrCpl > 5000
    ? { action: 'Flujo conversacional: extrae nombre, teléfono, presupuesto y zona', outcome: `${volumen} leads/mes, asignación manual por corredor`, confidence: 87, impact: 'Medio — calidad alta, velocidad de asignación moderada' }
    : { action: 'Modo mínimo: captura solo teléfono + presupuesto', outcome: `${volumen} leads/mes con datos incompletos`, confidence: 68, impact: 'Bajo — leads sin zona ni nombre, mayor esfuerzo del corredor' };

  const b2b: AgentDecision = v.corredores >= 30
    ? { action: 'Genera ACM templates personalizados por zona, exporta a PDF/email', outcome: `~${Math.round(v.corredores * 1.8)} ACM/semana, NPS corredor ${m.nps}`, confidence: 95, impact: 'Alto — diferenciador clave frente a portales tradicionales' }
    : v.corredores >= 8
    ? { action: 'Genera ACM bajo demanda con datos BCRP + comparables reales', outcome: `~${Math.round(v.corredores * 1.5)} ACM/semana, NPS ${m.nps}`, confidence: 90, impact: 'Medio — valor demostrado, tracción inicial con corredores' }
    : { action: 'ACM manual asistido, escasa demanda por bajo volumen de corredores', outcome: `~${Math.round(v.corredores * 1.2)} ACM/semana`, confidence: 65, impact: 'Bajo — riesgo de cancelación de suscripciones' };

  return { triaje, analista, comercial, b2b };
}

/* ─── Proyección mensual (6 meses) ──────────────────────────────── */
function buildProjection(vars: Record<ScenarioKey, ScenarioVars>, custom: ScenarioVars) {
  const all = { ...vars, custom };
  return Array.from({ length: 6 }, (_, i) => {
    const row: Record<string, number | string> = { mes: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i] };
    (['base', 'optimista', 'pesimista', 'custom'] as ScenarioKey[]).forEach((k) => {
      const v = all[k];
      const growth = k === 'optimista' ? 1.22 : k === 'pesimista' ? 1.04 : k === 'base' ? 1.14 : 1.1;
      row[k] = Math.round(compute({ ...v, corredores: v.corredores * Math.pow(growth, i * 0.5), leadsPerMonth: v.leadsPerMonth * Math.pow(growth, i * 0.4) }).mrrTotal);
    });
    return row;
  });
}

/* ─── Componentes UI base ────────────────────────────────────────── */
function Card({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bg-bg-card rounded-card border border-border-subtle p-4 ${className}`} style={style}>
      {children}
    </div>
  );
}

function SectionTitle({ children, icon, sub }: { children: React.ReactNode; icon?: string; sub?: string }) {
  return (
    <div className="mb-4 mt-7 first:mt-0">
      <div className="flex items-center gap-2.5 mb-0.5">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-[10px] font-semibold uppercase tracking-[0.09em] text-text-deep">{children}</span>
        <span className="flex-1 h-px bg-white/[0.06]" />
      </div>
      {sub && <p className="text-[10.5px] text-text-ghost pl-1 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─── Semáforo card ──────────────────────────────────────────────── */
function SemaforoCard({
  perspectiva, icon, score, submetrics, color, bg, label,
}: {
  perspectiva: string; icon: string; score: number;
  submetrics: { k: string; v: string; pct: number; color: string }[];
  color: string; bg: string; label: string;
}) {
  return (
    <Card style={{ borderTop: `3px solid ${color}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-[12px] font-semibold text-text-secondary">{perspectiva}</span>
        </div>
        {/* Semáforo visual */}
        <div className="flex flex-col gap-1">
          {[C.rose, C.amber, C.green].map((c) => (
            <div key={c} className="w-3.5 h-3.5 rounded-full transition-all"
              style={{ background: c === color ? color : `${c}20`, boxShadow: c === color ? `0 0 8px ${color}` : 'none' }} />
          ))}
        </div>
      </div>

      {/* Score gauge */}
      <div className="relative mb-3">
        <div className="flex justify-between text-[9px] text-text-ghost mb-1">
          <span>Rendimiento BSC</span><span style={{ color }}>{score}%</span>
        </div>
        <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: color }} />
        </div>
        <div className="flex justify-between text-[8px] text-text-ghost mt-0.5">
          <span>0</span><span>Meta 100%</span>
        </div>
      </div>

      {/* Estado */}
      <div className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold mb-3"
        style={{ background: bg, color }}>
        {label}
      </div>

      {/* Submétricas */}
      <div className="space-y-2">
        {submetrics.map((s) => (
          <div key={s.k}>
            <div className="flex justify-between text-[10px] mb-0.5">
              <span className="text-text-ghost">{s.k}</span>
              <span style={{ color: s.color }} className="font-semibold">{s.v}</span>
            </div>
            <div className="w-full h-1 bg-white/[0.05] rounded-full">
              <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ─── Variable Slider ────────────────────────────────────────────── */
function VarSlider({
  label, value, min, max, step, unit, onChange, color = C.indigo,
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (v: number) => void; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-text-ghost">{label}</span>
        <span className="font-bold" style={{ color }}>{unit}{value.toLocaleString('es-PE')}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
          WebkitAppearance: 'none',
        }}
      />
      <div className="flex justify-between text-[8px] text-text-ghost mt-0.5">
        <span>{unit}{min}</span><span>{unit}{max.toLocaleString('es-PE')}</span>
      </div>
    </div>
  );
}

/* ─── AgentDecision Card ─────────────────────────────────────────── */
function AgentCard({
  icon, name, role, decision, accentColor,
}: {
  icon: string; name: string; role: string; decision: AgentDecision; accentColor: string;
}) {
  const confColor = decision.confidence >= 90 ? C.green : decision.confidence >= 75 ? C.amber : C.rose;
  return (
    <Card style={{ borderLeft: `3px solid ${accentColor}` }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-[12px] font-bold text-text-secondary">{name}</div>
          <div className="text-[9.5px]" style={{ color: accentColor }}>{role}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[18px] font-black" style={{ color: confColor }}>{decision.confidence}%</div>
          <div className="text-[8.5px] text-text-ghost">confianza</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-bg-elevated rounded-lg p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.06em] mb-1" style={{ color: accentColor }}>⚡ Decisión / Acción</div>
          <div className="text-[10.5px] text-text-ghost leading-snug">{decision.action}</div>
        </div>
        <div className="bg-bg-elevated rounded-lg p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.06em] mb-1" style={{ color: C.green }}>✅ Resultado esperado</div>
          <div className="text-[10.5px] text-text-ghost leading-snug">{decision.outcome}</div>
        </div>
        <div className="bg-bg-elevated rounded-lg p-2.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.06em] mb-1" style={{ color: C.amber }}>📊 Impacto de negocio</div>
          <div className="text-[10.5px] text-text-ghost leading-snug">{decision.impact}</div>
        </div>
      </div>

      {/* Barra de confianza */}
      <div className="mt-3 pt-2 border-t border-border-subtle">
        <div className="flex justify-between text-[9px] text-text-ghost mb-1">
          <span>Nivel de confianza del agente</span>
          <span style={{ color: confColor }}>
            {decision.confidence >= 90 ? '🟢 Alta' : decision.confidence >= 75 ? '🟡 Media' : '🔴 Baja'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-white/[0.06] rounded-full">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${decision.confidence}%`, background: confColor }} />
        </div>
      </div>
    </Card>
  );
}

/* ─── Tabla comparativa ──────────────────────────────────────────── */
function ComparativaTable({ metrics }: { metrics: Record<ScenarioKey, { v: ScenarioVars; m: ComputedMetrics }> }) {
  const rows = [
    { label: 'MRR Total (S/)',           fn: (_: ScenarioVars, m: ComputedMetrics) => `S/ ${m.mrrTotal.toLocaleString('es-PE')}`, better: 'max' },
    { label: 'Ingresos SaaS (S/)',       fn: (_: ScenarioVars, m: ComputedMetrics) => `S/ ${m.mrrSaas.toLocaleString('es-PE')}`, better: 'max' },
    { label: 'Ingresos CPL (S/)',        fn: (_: ScenarioVars, m: ComputedMetrics) => `S/ ${m.mrrCpl.toLocaleString('es-PE')}`, better: 'max' },
    { label: 'Utilidad mensual (S/)',    fn: (_: ScenarioVars, m: ComputedMetrics) => `S/ ${m.utilidad.toLocaleString('es-PE')}`, better: 'max' },
    { label: 'ROI (%)',                  fn: (_: ScenarioVars, m: ComputedMetrics) => `${m.roiPct}%`, better: 'max' },
    { label: 'CAC (S/)',                 fn: (_: ScenarioVars, m: ComputedMetrics) => `S/ ${m.cac}`, better: 'min' },
    { label: 'NPS corredores',           fn: (_: ScenarioVars, m: ComputedMetrics) => `${m.nps}`, better: 'max' },
    { label: 'Leads calificados / mes',  fn: (v: ScenarioVars) => `${v.leadsPerMonth}`, better: 'max' },
    { label: 'Tasa conversión (%)',      fn: (v: ScenarioVars) => `${v.tasaConversion}%`, better: 'max' },
    { label: 'Latencia agentes (ms)',    fn: (v: ScenarioVars) => `${v.latenciaMs} ms`, better: 'min' },
    { label: 'Precisión Triaje (%)',     fn: (_: ScenarioVars, m: ComputedMetrics) => `${m.precisionTriaje}%`, better: 'max' },
    { label: 'Propiedades en BD',        fn: (_: ScenarioVars, m: ComputedMetrics) => `${m.propiedades}`, better: 'max' },
    { label: 'Distritos cubiertos',      fn: (v: ScenarioVars) => `${v.distritos}`, better: 'max' },
    { label: 'Corredores activos',       fn: (v: ScenarioVars) => `${v.corredores}`, better: 'max' },
    { label: 'Cobertura Lima (%)',       fn: (_: ScenarioVars, m: ComputedMetrics) => `${m.coberturaLimaPct}%`, better: 'max' },
  ];

  const cols: { key: ScenarioKey; label: string; color: string }[] = [
    { key: 'pesimista', label: '📉 Pesimista', color: C.rose },
    { key: 'base',      label: '📊 Base',      color: C.indigo },
    { key: 'optimista', label: '🚀 Optimista', color: C.green },
    { key: 'custom',    label: '⚙️ Custom',    color: C.amber },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr>
            <th className="text-left px-3 py-2 text-text-ghost font-medium text-[10px] uppercase tracking-[0.05em] border-b border-border-subtle bg-bg-card">KPI</th>
            {cols.map((c) => (
              <th key={c.key} className="px-3 py-2 text-center font-bold text-[10.5px] border-b border-border-subtle bg-bg-card"
                style={{ color: c.color }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const values = cols.map((c) => row.fn(metrics[c.key].v, metrics[c.key].m));
            const nums = values.map((v) => parseFloat(v.replace(/[^0-9.\-]/g, '')));
            const best = row.better === 'max' ? Math.max(...nums) : Math.min(...nums);
            return (
              <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.01]' : ''}>
                <td className="px-3 py-2 text-text-ghost border-b border-border-subtle/40">{row.label}</td>
                {cols.map((c, j) => {
                  const isBest = nums[j] === best;
                  return (
                    <td key={c.key} className="px-3 py-2 text-center border-b border-border-subtle/40">
                      <span className={isBest ? 'font-bold' : 'text-text-ghost'}
                        style={isBest ? { color: c.color } : {}}>
                        {values[j]}
                        {isBest && <span className="ml-1 text-[8px]">★</span>}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────────────── */
export default function SimuladorBSC() {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('base');
  const [customVars, setCustomVars] = useState<ScenarioVars>({ ...PRESET.base });

  const allVars: Record<ScenarioKey, ScenarioVars> = useMemo(() => ({
    base:      PRESET.base,
    optimista: PRESET.optimista,
    pesimista: PRESET.pesimista,
    custom:    customVars,
  }), [customVars]);

  const activeVars = allVars[activeScenario];
  const activeM    = useMemo(() => compute(activeVars), [activeVars]);

  const allMetrics = useMemo(() => ({
    base:      { v: PRESET.base,      m: compute(PRESET.base) },
    optimista: { v: PRESET.optimista, m: compute(PRESET.optimista) },
    pesimista: { v: PRESET.pesimista, m: compute(PRESET.pesimista) },
    custom:    { v: customVars,        m: compute(customVars) },
  }), [customVars]);

  const scoreFin  = useMemo(() => scoreFinanciera(activeM),             [activeM]);
  const scoreCli  = useMemo(() => scoreClientes(activeM, activeVars),   [activeM, activeVars]);
  const scorePro  = useMemo(() => scoreProcesos(activeM, activeVars),   [activeM, activeVars]);
  const scoreApr  = useMemo(() => scoreAprendizaje(activeM, activeVars),[activeM, activeVars]);

  const semFin  = semaforo(scoreFin);
  const semCli  = semaforo(scoreCli);
  const semPro  = semaforo(scorePro);
  const semApr  = semaforo(scoreApr);

  const agentDecisions = useMemo(() => getAgentDecisions(activeVars, activeM), [activeVars, activeM]);

  const projection = useMemo(() => buildProjection(PRESET as Record<ScenarioKey, ScenarioVars>, customVars), [customVars]);

  const radarData = useMemo(() => [
    { axis: 'Financiera',   base: scoreFinanciera(allMetrics.base.m),      optimista: scoreFinanciera(allMetrics.optimista.m),   pesimista: scoreFinanciera(allMetrics.pesimista.m),   custom: scoreFin },
    { axis: 'Clientes',     base: scoreClientes(allMetrics.base.m, PRESET.base), optimista: scoreClientes(allMetrics.optimista.m, PRESET.optimista), pesimista: scoreClientes(allMetrics.pesimista.m, PRESET.pesimista), custom: scoreCli },
    { axis: 'Procesos',     base: scoreProcesos(allMetrics.base.m, PRESET.base), optimista: scoreProcesos(allMetrics.optimista.m, PRESET.optimista), pesimista: scoreProcesos(allMetrics.pesimista.m, PRESET.pesimista), custom: scorePro },
    { axis: 'Aprendizaje',  base: scoreAprendizaje(allMetrics.base.m, PRESET.base), optimista: scoreAprendizaje(allMetrics.optimista.m, PRESET.optimista), pesimista: scoreAprendizaje(allMetrics.pesimista.m, PRESET.pesimista), custom: scoreApr },
  ], [allMetrics, scoreFin, scoreCli, scorePro, scoreApr]);

  const bscBarData = useMemo(() => [
    { p: 'Financiera',   pesimista: scoreFinanciera(allMetrics.pesimista.m), base: scoreFinanciera(allMetrics.base.m), optimista: scoreFinanciera(allMetrics.optimista.m), custom: scoreFin },
    { p: 'Clientes',     pesimista: scoreClientes(allMetrics.pesimista.m, PRESET.pesimista), base: scoreClientes(allMetrics.base.m, PRESET.base), optimista: scoreClientes(allMetrics.optimista.m, PRESET.optimista), custom: scoreCli },
    { p: 'Procesos Int.', pesimista: scoreProcesos(allMetrics.pesimista.m, PRESET.pesimista), base: scoreProcesos(allMetrics.base.m, PRESET.base), optimista: scoreProcesos(allMetrics.optimista.m, PRESET.optimista), custom: scorePro },
    { p: 'Aprendizaje',  pesimista: scoreAprendizaje(allMetrics.pesimista.m, PRESET.pesimista), base: scoreAprendizaje(allMetrics.base.m, PRESET.base), optimista: scoreAprendizaje(allMetrics.optimista.m, PRESET.optimista), custom: scoreApr },
  ], [allMetrics, scoreFin, scoreCli, scorePro, scoreApr]);

  function setVar(key: keyof ScenarioVars) {
    return (val: number) => setCustomVars((prev) => ({ ...prev, [key]: val }));
  }

  const scenarioMeta: Record<ScenarioKey, { label: string; color: string; icon: string; desc: string }> = {
    base:      { label: 'Escenario Base',      color: C.indigo, icon: '📊', desc: '10 corredores · 50 leads/mes · 3 distritos' },
    optimista: { label: 'Escenario Optimista', color: C.green,  icon: '🚀', desc: '50 corredores · 160 leads/mes · 9 distritos' },
    pesimista: { label: 'Escenario Pesimista', color: C.rose,   icon: '📉', desc: '3 corredores · 10 leads/mes · 3 distritos' },
    custom:    { label: 'Escenario Custom',    color: C.amber,  icon: '⚙️', desc: 'Variables configuradas por el usuario' },
  };

  const meta = scenarioMeta[activeScenario];

  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Métricas & Simulador BSC"
        subtitle="Balanced Scorecard · Escenarios · Decisiones IA"
        onRefresh={() => {}}
        refreshing={false}
      />

      {/* ── Selector de escenario ──────────────────────────────── */}
      <SectionTitle icon="🎬" sub="Selecciona un escenario predefinido o personaliza las variables para simular en tiempo real">
        Escenarios simulados
      </SectionTitle>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {(['base', 'optimista', 'pesimista', 'custom'] as ScenarioKey[]).map((key) => {
          const sm = scenarioMeta[key];
          const m  = allMetrics[key].m;
          const active = activeScenario === key;
          return (
            <button key={key} onClick={() => setActiveScenario(key)}
              className="text-left rounded-card border transition-all duration-150 p-3.5"
              style={{
                background: active ? `${sm.color}12` : 'var(--bg-card)',
                borderColor: active ? sm.color : 'rgba(255,255,255,0.08)',
                borderWidth: active ? '1.5px' : '1px',
              }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span>{sm.icon}</span>
                <span className="text-[11.5px] font-bold" style={{ color: active ? sm.color : 'var(--text-secondary)' }}>
                  {sm.label}
                </span>
                {active && (
                  <span className="ml-auto text-[8.5px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${sm.color}20`, color: sm.color }}>ACTIVO</span>
                )}
              </div>
              <div className="text-[9.5px] text-text-ghost mb-2 leading-tight">{sm.desc}</div>
              <div className="text-[17px] font-black" style={{ color: sm.color }}>
                S/ {m.mrrTotal.toLocaleString('es-PE')}
              </div>
              <div className="text-[9px] text-text-ghost">MRR estimado</div>
            </button>
          );
        })}
      </div>

      {/* ── Panel de variables custom ──────────────────────────── */}
      {activeScenario === 'custom' && (
        <Card className="mb-5">
          <div className="text-[11px] font-semibold text-text-muted mb-4">
            ⚙️ Variables de entrada — modifica para simular en tiempo real
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <VarSlider label="Corredores activos" value={customVars.corredores} min={0} max={100} step={1} unit="" onChange={setVar('corredores')} color={C.indigo} />
            <VarSlider label="Leads calificados / mes" value={customVars.leadsPerMonth} min={0} max={500} step={5} unit="" onChange={setVar('leadsPerMonth')} color={C.teal} />
            <VarSlider label="Tasa de conversión (%)" value={customVars.tasaConversion} min={1} max={30} step={0.5} unit="" onChange={setVar('tasaConversion')} color={C.green} />
            <VarSlider label="Precio CPL (S/)" value={customVars.precioCpl} min={100} max={1000} step={10} unit="S/ " onChange={setVar('precioCpl')} color={C.amber} />
            <VarSlider label="Distritos cubiertos" value={customVars.distritos} min={1} max={19} step={1} unit="" onChange={setVar('distritos')} color={C.violet} />
            <VarSlider label="Inversión marketing (S/)" value={customVars.invMarketing} min={0} max={5000} step={50} unit="S/ " onChange={setVar('invMarketing')} color={C.orange} />
            <VarSlider label="Latencia agentes (ms)" value={customVars.latenciaMs} min={300} max={5000} step={100} unit="" onChange={setVar('latenciaMs')} color={C.rose} />
          </div>
        </Card>
      )}

      {/* ── Escenario activo — KPIs headline ──────────────────── */}
      <div className="bg-bg-card rounded-card border p-4 mb-5"
        style={{ borderColor: meta.color, borderWidth: '1px' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <div className="text-[14px] font-black text-text-secondary">{meta.label}</div>
            <div className="text-[10.5px] text-text-ghost">{meta.desc}</div>
          </div>
          <div className="ml-auto flex gap-6">
            {[
              { l: 'MRR Total',    v: `S/ ${activeM.mrrTotal.toLocaleString('es-PE')}`,  color: meta.color },
              { l: 'Utilidad',     v: `S/ ${activeM.utilidad.toLocaleString('es-PE')}`,  color: activeM.utilidad >= 0 ? C.green : C.rose },
              { l: 'ROI',          v: `${activeM.roiPct}%`,                              color: activeM.roiPct >= 100 ? C.green : activeM.roiPct >= 0 ? C.amber : C.rose },
              { l: 'Corredores',   v: `${activeVars.corredores}`,                         color: meta.color },
              { l: 'Leads / mes',  v: `${activeVars.leadsPerMonth}`,                      color: meta.color },
              { l: 'Propiedades',  v: `${activeM.propiedades}`,                           color: meta.color },
            ].map((k) => (
              <div key={k.l} className="text-center">
                <div className="text-[9px] text-text-ghost uppercase tracking-wide mb-0.5">{k.l}</div>
                <div className="text-[16px] font-black" style={{ color: k.color }}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 Semáforos BSC ───────────────────────────────────── */}
      <SectionTitle icon="🚦" sub={`Estado del Balanced Scorecard en el ${meta.label} — 4 perspectivas con indicador de semáforo`}>
        Semáforos BSC — {meta.label}
      </SectionTitle>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <SemaforoCard
          perspectiva="Financiera" icon="💰"
          score={scoreFin} {...semFin}
          submetrics={[
            { k: 'MRR Total', v: `S/ ${activeM.mrrTotal.toLocaleString('es-PE')}`, pct: Math.min(100, (activeM.mrrTotal / 17500) * 100), color: semFin.color },
            { k: 'ROI', v: `${activeM.roiPct}%`, pct: Math.min(100, Math.max(0, activeM.roiPct)), color: activeM.roiPct >= 100 ? C.green : activeM.roiPct >= 0 ? C.amber : C.rose },
            { k: 'Utilidad neta', v: `S/ ${activeM.utilidad.toLocaleString('es-PE')}`, pct: Math.min(100, Math.max(0, (activeM.utilidad / 15000) * 100)), color: activeM.utilidad >= 0 ? C.green : C.rose },
          ]}
        />
        <SemaforoCard
          perspectiva="Clientes" icon="👥"
          score={scoreCli} {...semCli}
          submetrics={[
            { k: 'NPS corredores', v: `${activeM.nps}`, pct: Math.min(100, (activeM.nps / 70) * 100), color: semCli.color },
            { k: 'Conv. chat→lead', v: `${activeVars.tasaConversion}%`, pct: Math.min(100, (activeVars.tasaConversion / 14) * 100), color: activeVars.tasaConversion >= 8 ? C.green : activeVars.tasaConversion >= 4 ? C.amber : C.rose },
            { k: 'Leads / mes', v: `${activeVars.leadsPerMonth}`, pct: Math.min(100, (activeVars.leadsPerMonth / 150) * 100), color: semCli.color },
          ]}
        />
        <SemaforoCard
          perspectiva="Procesos Internos" icon="⚙️"
          score={scorePro} {...semPro}
          submetrics={[
            { k: 'Latencia agentes', v: `${activeVars.latenciaMs} ms`, pct: Math.min(100, (1500 / activeVars.latenciaMs) * 100), color: activeVars.latenciaMs <= 1500 ? C.green : activeVars.latenciaMs <= 2500 ? C.amber : C.rose },
            { k: 'Precisión Triaje', v: `${activeM.precisionTriaje}%`, pct: activeM.precisionTriaje, color: semPro.color },
            { k: 'Propiedades BD', v: `${activeM.propiedades}`, pct: Math.min(100, (activeM.propiedades / 300) * 100), color: semPro.color },
          ]}
        />
        <SemaforoCard
          perspectiva="Aprendizaje & Crec." icon="🌱"
          score={scoreApr} {...semApr}
          submetrics={[
            { k: 'Distritos cubiertos', v: `${activeVars.distritos}`, pct: Math.min(100, (activeVars.distritos / 19) * 100), color: semApr.color },
            { k: 'Cobertura Lima', v: `${activeM.coberturaLimaPct}%`, pct: activeM.coberturaLimaPct, color: semApr.color },
            { k: 'Uptime del sistema', v: `${activeM.uptime.toFixed(1)}%`, pct: activeM.uptime, color: activeM.uptime >= 99 ? C.green : C.amber },
          ]}
        />
      </div>

      {/* ── Impacto BSC por escenario (bar chart) ─────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="text-[11px] font-semibold text-text-muted mb-0.5">Impacto BSC por escenario — Score %</div>
          <div className="text-[10px] text-text-ghost mb-3">Comparación de las 4 perspectivas en los 4 escenarios</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={bscBarData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="p" tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number, n: string) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }} />
              <Bar dataKey="pesimista" name="Pesimista" fill={C.rose}    radius={[3, 3, 0, 0]} />
              <Bar dataKey="base"      name="Base"      fill={C.indigo}  radius={[3, 3, 0, 0]} />
              <Bar dataKey="optimista" name="Optimista" fill={C.green}   radius={[3, 3, 0, 0]} />
              <Bar dataKey="custom"    name="Custom"    fill={C.amber}   radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="text-[11px] font-semibold text-text-muted mb-0.5">Radar BSC — Cobertura estratégica</div>
          <div className="text-[10px] text-text-ghost mb-3">Perfil de madurez de cada escenario en las 4 perspectivas</div>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: C.muted, fontSize: 9 }} />
              <Radar name="Pesimista" dataKey="pesimista" stroke={C.rose}   fill={C.rose}   fillOpacity={0.1} strokeWidth={1.5} />
              <Radar name="Base"      dataKey="base"      stroke={C.indigo} fill={C.indigo} fillOpacity={0.1} strokeWidth={1.5} />
              <Radar name="Optimista" dataKey="optimista" stroke={C.green}  fill={C.green}  fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Custom"    dataKey="custom"    stroke={C.amber}  fill={C.amber}  fillOpacity={0.12} strokeWidth={1.5} strokeDasharray="4 2" />
              <Legend wrapperStyle={{ fontSize: '9px' }} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number, n: string) => [`${v}%`, n]} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Decisiones de agentes IA ───────────────────────────── */}
      <SectionTitle icon="🤖" sub={`Cómo decide cada agente IA en el ${meta.label} — acción, resultado esperado e impacto de negocio`}>
        Decisiones de agentes IA — {meta.label}
      </SectionTitle>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <AgentCard icon="🔀" name="Ag. Triaje"       role="Router de intenciones"  decision={agentDecisions.triaje}    accentColor={C.indigo} />
        <AgentCard icon="🔍" name="Ag. Analista"     role="Valuador RAG + BCRP"    decision={agentDecisions.analista}  accentColor={C.amber}  />
        <AgentCard icon="💬" name="Ag. Comercial"    role="Calificador de leads"   decision={agentDecisions.comercial} accentColor={C.teal}   />
        <AgentCard icon="📄" name="Ag. Soporte B2B"  role="Generador ACM"          decision={agentDecisions.b2b}       accentColor={C.green}  />
      </div>

      {/* ── Proyección MRR 6 meses ─────────────────────────────── */}
      <SectionTitle icon="📈" sub="Proyección de MRR para los 4 escenarios en los próximos 6 meses (Jul–Dic 2026), asumiendo crecimiento orgánico">
        Proyección MRR — Jul → Dic 2026
      </SectionTitle>

      <Card className="mb-6">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `S/${Math.round(v / 1000)}k`} />
            <Tooltip contentStyle={ttStyle} formatter={(v: number, n: string) => [`S/ ${v.toLocaleString('es-PE')}`, n]} />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
            <Line dataKey="pesimista" name="Pesimista" stroke={C.rose}   strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
            <Line dataKey="base"      name="Base"      stroke={C.indigo} strokeWidth={2}   dot={{ r: 3 }} />
            <Line dataKey="optimista" name="Optimista" stroke={C.green}  strokeWidth={2.5} dot={{ r: 4 }} />
            <Line dataKey="custom"    name="Custom"    stroke={C.amber}  strokeWidth={2}   dot={{ r: 3 }} strokeDasharray="6 2" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Tabla comparativa ─────────────────────────────────── */}
      <SectionTitle icon="📋" sub="KPIs calculados para los 4 escenarios — ★ marca el mejor valor en cada indicador">
        Tabla comparativa de escenarios
      </SectionTitle>

      <Card className="mb-8">
        <ComparativaTable metrics={allMetrics} />
      </Card>

      <div className="pt-4 border-t border-border-subtle flex justify-between text-[11px] text-text-deep">
        <span>InmoData IA · Simulador BSC v1.0 · Junio 2026</span>
        <span>Cálculos basados en BCRP IVT Q4 2025 · TC S/ 3.77 = USD 1</span>
      </div>
    </div>
  );
}
