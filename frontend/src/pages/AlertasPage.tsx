import { useEffect, useState } from 'react';
import { Loader2, Bell, MapPin } from 'lucide-react';
import { fetchAlertas } from '@/api/client';

interface PropRow {
  id: string; district: string; address: string | null; price: number; priceSOL: number;
  areaSqm: number | null; bedrooms: number | null; source: string; extractedAt: string;
  pricePerSqm: number | null; withinBudget: boolean | null;
}
interface AlertasData {
  matchedDistrict: string | null; budgetSOL: number | null; properties: PropRow[];
}

export default function AlertasPage() {
  const [data, setData] = useState<AlertasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlertas().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="animate-spin text-text-ghost" /></div>;
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={20} className="text-amber" />
          <h1 className="text-xl font-black text-text-primary">Alertas de propiedades</h1>
        </div>
        <p className="text-[12px] text-text-ghost mb-5">
          Últimas propiedades publicadas
          {data?.matchedDistrict ? <> en <strong className="text-text-secondary">{data.matchedDistrict}</strong> (tu zona de interés)</> : ' en tus distritos'}
          {data?.budgetSOL ? <> · presupuesto S/ {data.budgetSOL.toLocaleString('es-PE')}</> : ''}
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {data?.properties.map((p) => (
            <div key={p.id} className="bg-bg-card rounded-card border border-border-subtle p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] text-text-ghost">
                  <MapPin size={12} /> {p.district}
                </div>
                {p.withinBudget !== null && (
                  <span className="text-[8.5px] font-bold px-2 py-0.5 rounded-full"
                    style={p.withinBudget
                      ? { background: '#22c55e18', color: '#22c55e' }
                      : { background: '#f43f5e18', color: '#f43f5e' }}>
                    {p.withinBudget ? 'En presupuesto' : 'Sobre presupuesto'}
                  </span>
                )}
              </div>
              <div className="text-[12.5px] text-text-secondary font-medium mb-1">{p.address ?? 'Sin dirección'}</div>
              <div className="flex items-center gap-3 text-[10.5px] text-text-ghost mb-2">
                {p.areaSqm && <span>{p.areaSqm} m²</span>}
                {p.bedrooms && <span>{p.bedrooms} dorm.</span>}
                <span>{p.source}</span>
              </div>
              <div className="text-lg font-black text-text-primary">S/ {p.priceSOL.toLocaleString('es-PE')}</div>
              <div className="text-[9px] text-text-ghost mt-1">Publicado {new Date(p.extractedAt).toLocaleDateString('es-PE')}</div>
            </div>
          ))}
        </div>
        {data?.properties.length === 0 && (
          <div className="text-center text-text-ghost text-sm py-10">No hay propiedades nuevas por ahora.</div>
        )}
      </div>
    </div>
  );
}
