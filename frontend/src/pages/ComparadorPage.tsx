import { useEffect, useState } from 'react';
import { Loader2, BarChart3 } from 'lucide-react';
import { fetchComparador } from '@/api/client';

interface DistrictRow {
  district: string; sector: string;
  bcrpPriceUsdPerSqm: number; bcrpPriceSolPerSqm: number;
  annualRentUsdPerSqm: number; monthlyRentUsdPerSqm: number; per: number;
  marketAvgPriceSOL: number | null; marketAvgPricePerSqmSOL: number | null; listingCount: number;
}

export default function ComparadorPage() {
  const [districts, setDistricts] = useState<DistrictRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparador().then((r) => setDistricts(r.districts)).finally(() => setLoading(false));
  }, []);

  const maxPrice = Math.max(...districts.map((d) => d.bcrpPriceUsdPerSqm), 1);

  if (loading) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="animate-spin text-text-ghost" /></div>;
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={20} className="text-teal" />
          <h1 className="text-xl font-black text-text-primary">Comparador de precios</h1>
        </div>
        <p className="text-[12px] text-text-ghost mb-5">Precio/m², alquiler y rentabilidad (PER) por distrito — BCRP IVT 2025 + mercado</p>

        {/* Barras de precio/m² */}
        <div className="bg-bg-card rounded-card border border-border-subtle p-5 mb-4">
          <div className="text-[10px] text-text-faint uppercase tracking-wide mb-3">Precio de venta US$/m² (BCRP)</div>
          <div className="space-y-3">
            {districts.map((d) => (
              <div key={d.district} className="flex items-center gap-3">
                <div className="w-28 text-[11.5px] text-text-secondary font-medium">{d.district}</div>
                <div className="flex-1 h-6 bg-bg-surface rounded-md overflow-hidden">
                  <div
                    className="h-6 rounded-md bg-teal/70 flex items-center justify-end px-2"
                    style={{ width: `${(d.bcrpPriceUsdPerSqm / maxPrice) * 100}%` }}
                  >
                    <span className="text-[10px] font-bold text-bg-base">US$ {d.bcrpPriceUsdPerSqm}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla comparativa */}
        <div className="bg-bg-card rounded-card border border-border-subtle overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] text-text-faint uppercase tracking-wide border-b border-border-subtle">
                <th className="px-4 py-3 font-medium">Distrito</th>
                <th className="px-4 py-3 font-medium">Sector</th>
                <th className="px-4 py-3 font-medium text-right">Venta US$/m²</th>
                <th className="px-4 py-3 font-medium text-right">Alq. US$/m²/mes</th>
                <th className="px-4 py-3 font-medium text-right">PER</th>
                <th className="px-4 py-3 font-medium text-right">Avisos</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => (
                <tr key={d.district} className="border-b border-border-subtle last:border-0 text-[11.5px]">
                  <td className="px-4 py-3 text-text-secondary font-semibold">{d.district}</td>
                  <td className="px-4 py-3 text-text-ghost">{d.sector === 'altos' ? 'Altos' : 'Medios'}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">US$ {d.bcrpPriceUsdPerSqm}</td>
                  <td className="px-4 py-3 text-right text-text-ghost">US$ {d.monthlyRentUsdPerSqm}</td>
                  <td className="px-4 py-3 text-right text-text-secondary font-semibold">{d.per}</td>
                  <td className="px-4 py-3 text-right text-text-ghost">{d.listingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[9.5px] text-text-ghost mt-3">Un PER más bajo indica mejor rentabilidad por alquiler (menos años para recuperar la inversión).</p>
      </div>
    </div>
  );
}
