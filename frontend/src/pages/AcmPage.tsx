import { useEffect, useState } from 'react';
import { Loader2, FileText, Building2, Download } from 'lucide-react';
import { fetchAcm } from '@/api/client';

const DISTRICTS = ['Lince', 'Jesús María', 'Miraflores'];

interface AcmData {
  district: string; covered: boolean; areaSqm: number;
  bcrp: { sector: string; salePriceUsdPerSqm: number; annualRentUsdPerSqm: number; monthlyRentUsdPerSqm: number; per: number } | null;
  valuation: { low: number; mid: number; high: number; currency: string };
  market: { comparablesCount: number; avgPricePerSqmSOL: number; avgPricePerSqmUSD: number };
  comparables: Array<{ address: string; priceSOL: number; priceUSD: number; areaSqm: number | null; bedrooms: number | null; pricePerSqmSOL: number | null; source: string }>;
  source: string; generatedAt: string;
}

export default function AcmPage() {
  const [district, setDistrict] = useState('Miraflores');
  const [area, setArea] = useState(80);
  const [data, setData] = useState<AcmData | null>(null);
  const [loading, setLoading] = useState(true);

  function load(d: string, a: number) {
    setLoading(true);
    fetchAcm(d, a).then(setData).finally(() => setLoading(false));
  }

  useEffect(() => { load(district, area); /* eslint-disable-next-line */ }, []);

  function downloadPdf() {
    if (!data) return;
    const fmtUsd = (n: number) => 'US$ ' + n.toLocaleString('en-US');
    const fmtSol = (n: number) => 'S/ ' + n.toLocaleString('es-PE');
    const rows = data.comparables.map((c) => `
      <tr>
        <td>${c.address}</td>
        <td style="text-align:right">${fmtUsd(c.priceUSD)}</td>
        <td style="text-align:right">${c.areaSqm ?? '—'} m²</td>
        <td style="text-align:right">${c.pricePerSqmSOL ? fmtSol(c.pricePerSqmSOL) : '—'}</td>
        <td>${c.source}</td>
      </tr>`).join('');
    const bcrp = data.bcrp
      ? `<ul>
           <li>Sector: <b>${data.bcrp.sector === 'altos' ? 'Ingresos altos' : 'Ingresos medios'}</b></li>
           <li>Precio venta: <b>US$ ${data.bcrp.salePriceUsdPerSqm}/m²</b></li>
           <li>Alquiler mensual: <b>US$ ${data.bcrp.monthlyRentUsdPerSqm}/m²</b></li>
           <li>PER: <b>${data.bcrp.per} años</b></li>
         </ul>`
      : '<p>Sin datos BCRP para este distrito.</p>';

    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
      <title>ACM ${data.district} — InmoData IA</title>
      <style>
        * { font-family: -apple-system, Segoe UI, Roboto, sans-serif; color: #1a1f2e; }
        body { padding: 32px 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 22px; margin: 0 0 2px; }
        .sub { color: #667; font-size: 12px; margin: 0 0 20px; }
        .brand { color: #6366f1; font-weight: 800; letter-spacing: .5px; font-size: 13px; }
        .val { display: flex; gap: 12px; margin: 14px 0 20px; }
        .val div { flex: 1; border: 1px solid #e2e6ef; border-radius: 10px; padding: 12px; text-align: center; }
        .val .mid { background: #eef0ff; border-color: #c7cbff; }
        .val small { color: #889; font-size: 10px; text-transform: uppercase; display:block; margin-bottom:4px; }
        .val b { font-size: 18px; }
        h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .5px; color: #667; margin: 22px 0 8px; }
        ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.7; }
        table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 6px; }
        th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #eef0f4; }
        th { color: #889; font-size: 9.5px; text-transform: uppercase; }
        .foot { margin-top: 24px; color: #99a; font-size: 10px; }
      </style></head><body>
        <div class="brand">INMODATA IA</div>
        <h1>Reporte ACM — ${data.district}</h1>
        <p class="sub">Análisis Comparativo de Mercado · ${data.areaSqm} m² · generado ${new Date(data.generatedAt).toLocaleString('es-PE')}</p>

        <h2>Valuación estimada</h2>
        <div class="val">
          <div><small>Mínimo</small><b>${fmtUsd(data.valuation.low)}</b></div>
          <div class="mid"><small>Referencia</small><b>${fmtUsd(data.valuation.mid)}</b></div>
          <div><small>Máximo</small><b>${fmtUsd(data.valuation.high)}</b></div>
        </div>

        <h2>Referencia BCRP (IVT 2025)</h2>
        ${bcrp}

        <h2>Mercado (portales)</h2>
        <ul>
          <li>Comparables analizados: <b>${data.market.comparablesCount}</b></li>
          <li>Precio/m² promedio: <b>${fmtSol(data.market.avgPricePerSqmSOL)}</b> (${fmtUsd(data.market.avgPricePerSqmUSD)})</li>
        </ul>

        <h2>Comparables en ${data.district}</h2>
        <table>
          <thead><tr><th>Dirección</th><th style="text-align:right">Precio</th><th style="text-align:right">Área</th><th style="text-align:right">S//m²</th><th>Fuente</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="5">Sin comparables en base de datos.</td></tr>'}</tbody>
        </table>

        <p class="foot">${data.source}</p>
      </body></html>`;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={20} className="text-indigo" />
          <h1 className="text-xl font-black text-text-primary">Reporte ACM</h1>
        </div>
        <p className="text-[12px] text-text-ghost mb-5">Análisis Comparativo de Mercado con datos BCRP IVT 2025 + comparables reales</p>

        {/* Controles */}
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <div>
            <label className="block text-[10px] text-text-faint uppercase tracking-wide mb-1">Distrito</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-bg-surface border border-border-subtle rounded-[10px] px-3 py-2 text-sm text-text-secondary outline-none focus:border-indigo/50"
            >
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-text-faint uppercase tracking-wide mb-1">Área (m²)</label>
            <input
              type="number" value={area} min={20} max={500}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-24 bg-bg-surface border border-border-subtle rounded-[10px] px-3 py-2 text-sm text-text-secondary outline-none focus:border-indigo/50"
            />
          </div>
          <button
            onClick={() => load(district, area)}
            className="bg-indigo hover:bg-indigo/85 text-white font-semibold text-[12px] rounded-[10px] px-4 py-2 transition-all"
          >
            Generar reporte
          </button>
          <button
            onClick={downloadPdf}
            disabled={!data || loading}
            className="flex items-center gap-1.5 bg-bg-surface border border-border-subtle hover:border-indigo/50 disabled:opacity-40 text-text-secondary font-semibold text-[12px] rounded-[10px] px-4 py-2 transition-all"
          >
            <Download size={14} /> Descargar PDF
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-text-ghost" /></div>
        ) : !data ? (
          <div className="text-center text-text-ghost text-sm py-10">No se pudo generar el reporte.</div>
        ) : (
          <>
            {/* Valuación */}
            <div className="bg-bg-card rounded-card border border-indigo/40 p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} className="text-indigo" />
                <h2 className="text-[13px] font-semibold text-text-secondary">Valuación estimada · {data.district} · {data.areaSqm}m²</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bg-surface rounded-lg p-3 text-center">
                  <div className="text-[9px] text-text-ghost mb-1">Mínimo</div>
                  <div className="text-lg font-black text-text-secondary">US$ {data.valuation.low.toLocaleString('en-US')}</div>
                </div>
                <div className="bg-indigo/10 rounded-lg p-3 text-center border border-indigo/30">
                  <div className="text-[9px] text-indigo mb-1">Referencia</div>
                  <div className="text-xl font-black text-text-primary">US$ {data.valuation.mid.toLocaleString('en-US')}</div>
                </div>
                <div className="bg-bg-surface rounded-lg p-3 text-center">
                  <div className="text-[9px] text-text-ghost mb-1">Máximo</div>
                  <div className="text-lg font-black text-text-secondary">US$ {data.valuation.high.toLocaleString('en-US')}</div>
                </div>
              </div>
            </div>

            {/* BCRP + mercado */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-bg-card rounded-card border border-border-subtle p-5">
                <div className="text-[10px] text-text-faint uppercase tracking-wide mb-3">Referencia BCRP (IVT 2025)</div>
                {data.bcrp ? (
                  <div className="space-y-2 text-[12px]">
                    <Row label="Sector" value={data.bcrp.sector === 'altos' ? 'Ingresos altos' : 'Ingresos medios'} />
                    <Row label="Precio venta" value={`US$ ${data.bcrp.salePriceUsdPerSqm}/m²`} />
                    <Row label="Alquiler mensual" value={`US$ ${data.bcrp.monthlyRentUsdPerSqm}/m²`} />
                    <Row label="PER (años)" value={`${data.bcrp.per}`} />
                  </div>
                ) : (
                  <div className="text-[11.5px] text-text-ghost">Sin datos BCRP para este distrito.</div>
                )}
              </div>
              <div className="bg-bg-card rounded-card border border-border-subtle p-5">
                <div className="text-[10px] text-text-faint uppercase tracking-wide mb-3">Mercado (portales)</div>
                <div className="space-y-2 text-[12px]">
                  <Row label="Comparables" value={`${data.market.comparablesCount}`} />
                  <Row label="Precio/m² promedio" value={`S/ ${data.market.avgPricePerSqmSOL.toLocaleString('es-PE')}`} />
                  <Row label="Precio/m² (USD)" value={`US$ ${data.market.avgPricePerSqmUSD.toLocaleString('en-US')}`} />
                </div>
              </div>
            </div>

            {/* Comparables */}
            <div className="bg-bg-card rounded-card border border-border-subtle overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle text-[11px] font-semibold text-text-secondary">
                Comparables en {data.district}
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] text-text-faint uppercase tracking-wide border-b border-border-subtle">
                    <th className="px-4 py-2 font-medium">Dirección</th>
                    <th className="px-4 py-2 font-medium text-right">Precio</th>
                    <th className="px-4 py-2 font-medium text-right">Área</th>
                    <th className="px-4 py-2 font-medium text-right">S//m²</th>
                    <th className="px-4 py-2 font-medium">Fuente</th>
                  </tr>
                </thead>
                <tbody>
                  {data.comparables.map((c, i) => (
                    <tr key={i} className="border-b border-border-subtle last:border-0 text-[11px]">
                      <td className="px-4 py-2 text-text-secondary">{c.address}</td>
                      <td className="px-4 py-2 text-right text-text-secondary">US$ {c.priceUSD.toLocaleString('en-US')}</td>
                      <td className="px-4 py-2 text-right text-text-ghost">{c.areaSqm ?? '—'} m²</td>
                      <td className="px-4 py-2 text-right text-text-ghost">{c.pricePerSqmSOL ? `S/ ${c.pricePerSqmSOL.toLocaleString('es-PE')}` : '—'}</td>
                      <td className="px-4 py-2 text-text-ghost">{c.source}</td>
                    </tr>
                  ))}
                  {data.comparables.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-text-ghost text-[11px]">Sin comparables en base de datos para este distrito.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-[9.5px] text-text-ghost mt-3">{data.source}</p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-ghost">{label}</span>
      <span className="text-text-secondary font-semibold">{value}</span>
    </div>
  );
}
