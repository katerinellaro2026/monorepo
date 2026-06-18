import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { RevenueByMonth } from '@/types';

const ttStyle = {
  backgroundColor: '#1a1d2e',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e2e8f0',
  padding: '8px 12px',
};

interface RevenueChartProps {
  data: RevenueByMonth[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-bg-card rounded-card p-4 border border-border-subtle mb-4">
      <div className="text-[13px] font-semibold text-text-muted mb-0.5">
        Ingresos combinados — últimos 6 meses
      </div>
      <div className="text-[11px] text-text-ghost mb-3">Desglose SaaS vs. Leads en Soles</div>

      {/* Legend */}
      <div className="flex gap-4 mb-3">
        {[['#6366f1', 'Ingresos SaaS'], ['#2dd4bf', 'Ingresos por Leads']].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <span className="w-2.5 h-2.5 rounded-[2px] inline-block" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#475569', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `S/${Math.round(v / 1000)}k`}
          />
          <Tooltip
            contentStyle={ttStyle}
            formatter={(v: number, name: string) => [
              `S/ ${v.toLocaleString('es-PE')}`,
              name === 'SaaS' ? 'Ingresos SaaS' : 'Ingresos Leads',
            ]}
          />
          <Bar dataKey="SaaS" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Leads" stackId="a" fill="#2dd4bf" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
