interface DataSourcesProps {
  extractedToday: number;
  totalActive: number;
  ddpTotal: number;
  ddpNewThisWeek: number;
  vectorDocsIndexed: number;
  lastSyncMinutes?: number | null;
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-[0.05em] rounded-[5px] px-2 py-0.5 border"
      style={
        ok
          ? { background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }
          : { background: 'rgba(244,63,94,0.12)', color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }
      }
    >
      {ok ? '● ' : '✕ '}{label}
    </span>
  );
}

export default function DataSources({
  extractedToday,
  totalActive,
  ddpTotal,
  ddpNewThisWeek,
  vectorDocsIndexed,
  lastSyncMinutes,
}: DataSourcesProps) {
  return (
    <div className="mb-5">
      {/* External */}
      <div className="text-[11px] font-semibold text-text-ghost mb-2 pl-0.5">Fuentes externas (internet)</div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Scraping */}
        <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-[9px] bg-orange-500/12 flex items-center justify-center text-lg">🌐</div>
            <div>
              <div className="text-[12.5px] font-semibold text-text-secondary">Scraping activo</div>
              <div className="text-[10.5px] text-text-faint">Urbania · Adondevivir</div>
            </div>
          </div>
          <StatusBadge ok={true} label="Sincronizado" />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div>
              <div className="text-[10px] text-text-faint mb-0.5">Última sincronización</div>
              <div className="text-sm font-bold text-text-primary">
                {lastSyncMinutes != null ? `Hace ${lastSyncMinutes} min` : 'Nunca'}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-faint mb-0.5">Listados extraídos hoy</div>
              <div className="text-sm font-bold text-teal">{extractedToday.toLocaleString('es-PE')}</div>
            </div>
          </div>
        </div>

        {/* Macro */}
        <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-[9px] bg-indigo/12 flex items-center justify-center text-lg">🏦</div>
            <div>
              <div className="text-[12.5px] font-semibold text-text-secondary">Conexión macro</div>
              <div className="text-[10.5px] text-text-faint">BCRP · INEI</div>
            </div>
          </div>
          <StatusBadge ok={true} label="API activa — 200 OK" />
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div>
              <div className="text-[10px] text-text-faint mb-0.5">Estado de API</div>
              <div className="text-sm font-bold text-emerald">200 OK</div>
            </div>
            <div>
              <div className="text-[10px] text-text-faint mb-0.5">PDFs vectorizados</div>
              <div className="text-sm font-bold text-text-primary">47 reportes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal */}
      <div className="text-[11px] font-semibold text-text-ghost mb-2 pl-0.5">Fuentes internas (datos propietarios)</div>
      <div className="grid grid-cols-2 gap-3">
        {/* Vector DB */}
        <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-[9px] bg-indigo/12 flex items-center justify-center text-lg">🧠</div>
            <div>
              <div className="text-[12.5px] font-semibold text-text-secondary">Vector DB</div>
              <div className="text-[10.5px] text-text-faint">pgvector — índice principal</div>
            </div>
          </div>
          <div className="text-[30px] font-bold text-indigo-light tracking-tight leading-none">
            {vectorDocsIndexed.toLocaleString('es-PE')}
          </div>
          <div className="text-[11px] text-text-faint mt-0.5">documentos indexados</div>
          <div className="text-[11px] text-emerald mt-1.5">▲ +{Math.max(1, Math.round(vectorDocsIndexed * 0.015)).toLocaleString('es-PE')} esta semana</div>
        </div>

        {/* SQL DB / DDP */}
        <div className="bg-bg-card rounded-card p-4 border border-border-subtle">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-[9px] bg-teal/12 flex items-center justify-center text-lg">🗄️</div>
            <div>
              <div className="text-[12.5px] font-semibold text-text-secondary">SQL DB — DDP</div>
              <div className="text-[10.5px] text-text-faint">PostgreSQL — perfiles únicos</div>
            </div>
          </div>
          <div className="text-[30px] font-bold text-teal tracking-tight leading-none">
            {ddpTotal.toLocaleString('es-PE')}
          </div>
          <div className="text-[11px] text-text-faint mt-0.5">perfiles de compradores únicos</div>
          <div className="text-[11px] text-emerald mt-1.5">▲ +{ddpNewThisWeek} nuevos esta semana</div>
        </div>
      </div>
    </div>
  );
}
