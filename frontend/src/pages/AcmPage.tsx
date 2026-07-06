import { useEffect, useState } from 'react';
import { Loader2, FileText, Building2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const M = 40;               // margen izquierdo
    const W = doc.internal.pageSize.getWidth();
    let y = 48;

    // Marca + título
    doc.setTextColor(99, 102, 241);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('INMODATA IA', M, y);
    y += 22;
    doc.setTextColor(26, 31, 46);
    doc.setFontSize(20);
    doc.text(`Reporte ACM — ${data.district}`, M, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(110, 120, 140);
    doc.text(
      `Análisis Comparativo de Mercado · ${data.areaSqm} m² · generado ${new Date(data.generatedAt).toLocaleString('es-PE')}`,
      M, y
    );
    y += 26;

    // Valuación (3 tarjetas)
    const sectionTitle = (t: string) => {
      doc.setTextColor(110, 120, 140);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(t.toUpperCase(), M, y);
      y += 14;
      doc.setTextColor(26, 31, 46);
      doc.setFont('helvetica', 'normal');
    };

    sectionTitle('Valuación estimada');
    const cardW = (W - M * 2 - 20) / 3;
    const cards = [
      { label: 'Mínimo', value: fmtUsd(data.valuation.low), hi: false },
      { label: 'Referencia', value: fmtUsd(data.valuation.mid), hi: true },
      { label: 'Máximo', value: fmtUsd(data.valuation.high), hi: false },
    ];
    cards.forEach((c, i) => {
      const x = M + i * (cardW + 10);
      if (c.hi) { doc.setFillColor(238, 240, 255); doc.setDrawColor(199, 203, 255); }
      else { doc.setFillColor(248, 249, 252); doc.setDrawColor(226, 230, 239); }
      doc.roundedRect(x, y, cardW, 46, 6, 6, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 160);
      doc.text(c.label.toUpperCase(), x + cardW / 2, y + 16, { align: 'center' });
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 31, 46);
      doc.text(c.value, x + cardW / 2, y + 34, { align: 'center' });
      doc.setFont('helvetica', 'normal');
    });
    y += 66;

    // BCRP
    sectionTitle('Referencia BCRP (IVT 2025)');
    doc.setFontSize(11);
    doc.setTextColor(50, 60, 80);
    if (data.bcrp) {
      const lines = [
        `• Sector: ${data.bcrp.sector === 'altos' ? 'Ingresos altos' : 'Ingresos medios'}`,
        `• Precio de venta: US$ ${data.bcrp.salePriceUsdPerSqm}/m²`,
        `• Alquiler mensual: US$ ${data.bcrp.monthlyRentUsdPerSqm}/m²`,
        `• PER: ${data.bcrp.per} años`,
      ];
      lines.forEach((l) => { doc.text(l, M, y); y += 15; });
    } else {
      doc.text('Sin datos BCRP para este distrito.', M, y); y += 15;
    }
    y += 10;

    // Mercado
    sectionTitle('Mercado (portales)');
    doc.setFontSize(11);
    doc.setTextColor(50, 60, 80);
    doc.text(`• Comparables analizados: ${data.market.comparablesCount}`, M, y); y += 15;
    doc.text(`• Precio/m² promedio: ${fmtSol(data.market.avgPricePerSqmSOL)} (${fmtUsd(data.market.avgPricePerSqmUSD)})`, M, y); y += 22;

    // Tabla de comparables
    autoTable(doc, {
      startY: y,
      head: [['Dirección', 'Precio', 'Área', 'S//m²', 'Fuente']],
      body: data.comparables.length
        ? data.comparables.map((c) => [
            c.address,
            fmtUsd(c.priceUSD),
            c.areaSqm ? `${c.areaSqm} m²` : '—',
            c.pricePerSqmSOL ? fmtSol(c.pricePerSqmSOL) : '—',
            c.source,
          ])
        : [['Sin comparables en base de datos.', '', '', '', '']],
      styles: { fontSize: 9, cellPadding: 5, textColor: [40, 48, 66] },
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 8.5 },
      alternateRowStyles: { fillColor: [248, 249, 252] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      margin: { left: M, right: M },
    });

    const endY = (doc as any).lastAutoTable?.finalY ?? y;
    doc.setFontSize(8);
    doc.setTextColor(150, 160, 180);
    doc.text(data.source, M, endY + 20);

    doc.save(`ACM_${data.district.replace(/\s+/g, '_')}_${data.areaSqm}m2.pdf`);
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
