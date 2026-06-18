import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const ttStyle = {
  backgroundColor: '#1a1d2e',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
  padding: '8px 12px',
};

const RADAR_DATA = [
  { metric: 'Vol. búsqueda', Lince: 82, JesusMaria: 68, Miraflores: 55 },
  { metric: 'Brecha precio', Lince: 90, JesusMaria: 74, Miraflores: 58 },
  { metric: 'Conv. lead',    Lince: 45, JesusMaria: 62, Miraflores: 80 },
  { metric: 'Recurrencia',   Lince: 60, JesusMaria: 55, Miraflores: 88 },
  { metric: 'Urgencia',      Lince: 75, JesusMaria: 70, Miraflores: 65 },
];

interface MarketIntelligenceProps {
  demandVsSupply: Array<{ distrito: string; demanda: number; oferta: number }>;
}

export default function MarketIntelligence({ demandVsSupply }: MarketIntelligenceProps) {
  const insights = [
    {
      text: `El ${Math.round(((demandVsSupply.find(d => d.distrito === 'Lince')?.oferta ?? 220000) - (demandVsSupply.find(d => d.distrito === 'Lince')?.demanda ?? 180000)) / (demandVsSupply.find(d => d.distrito === 'Lince')?.oferta ?? 220000) * 100)}% de brecha en Lince entre presupuesto usuario y precio publicado.`,
      tag: 'Brecha crítica',
      tagColor: '#f43f5e',
    },
    {
      text: 'Jesús María muestra la mayor tasa de intención de compra real según sesiones de chat activas.',
      tag: 'Oportunidad',
      tagColor: '#22c55e',
    },
    {
      text: 'Miraflores lidera en conversión de lead: mayor presupuesto declarado vs. oferta del mercado.',
      tag: 'Tendencia',
      tagColor: '#f59e0b',
    },
    {
      text: `Precio/m² promedio en Miraflores: S/ ${((demandVsSupply.find(d => d.distrito === 'Miraflores')?.oferta ?? 440000) / 95).toFixed(0).toLocaleString()} según scraping activo.`,
      tag: 'Dato macro',
      tagColor: '#6366f1',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Demand vs Supply */}
        <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
          <div className="text-[13px] font-semibold text-text-muted mb-0.5">Mapa de demanda vs. oferta</div>
          <div className="text-[11px] text-text-ghost mb-2.5">Presupuesto usuario (interno) vs. precio publicado (externo)</div>
          <div className="flex gap-3.5 mb-2.5">
            {[['#6366f1', 'Presupuesto usuario'], ['#f43f5e', 'Precio oferta']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1 text-[11px] text-text-muted">
                <span className="w-2 h-2 rounded-[2px] inline-block" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={demandVsSupply} barSize={22} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="distrito" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `S/${Math.round(v / 1000)}k`} />
              <Tooltip contentStyle={ttStyle} formatter={(v: number) => [`S/ ${v.toLocaleString('es-PE')}`]} />
              <Bar dataKey="demanda" name="Presupuesto usuario" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="oferta" name="Precio oferta" fill="#f43f5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
          <div className="text-[13px] font-semibold text-text-muted mb-0.5">Radar distrital</div>
          <div className="text-[11px] text-text-ghost mb-2">Índice comparativo de 5 dimensiones por distrito</div>
          <div className="flex gap-3 mb-1.5 flex-wrap">
            {[['#6366f1', 'Lince'], ['#2dd4bf', 'Jesús María'], ['#f59e0b', 'Miraflores']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1 text-[10.5px] text-text-muted">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} /> {l}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 9.5 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar name="Lince"       dataKey="Lince"       stroke="#6366f1" fill="#6366f1" fillOpacity={0.12} strokeWidth={1.5} />
              <Radar name="Jesús María" dataKey="JesusMaria"  stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.12} strokeWidth={1.5} />
              <Radar name="Miraflores"  dataKey="Miraflores"  stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.12} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="text-[12px] font-semibold text-text-muted mb-3">Top insights de mercado — generados por IA</div>
      <div className="grid grid-cols-2 gap-3">
        {insights.map((ins, i) => (
          <div key={i} className="bg-bg-card rounded-card p-3.5 border-l-[3px]"
            style={{ borderColor: ins.tagColor, borderTop: '0.5px solid rgba(255,255,255,0.07)', borderRight: '0.5px solid rgba(255,255,255,0.07)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.05em] rounded-[5px] px-2 py-0.5 border inline-block mb-2"
              style={{ background: `${ins.tagColor}18`, color: ins.tagColor, borderColor: `${ins.tagColor}33` }}
            >
              {ins.tag}
            </span>
            <p className="text-[12px] text-text-muted leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
