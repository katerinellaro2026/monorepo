import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { api } from '@/api/client';
import { AGENT_PERSONAS } from '@/data/agentPersonas';

/* ─── Types ──────────────────────────────────────────────────────── */
interface GeminiLog {
  id: string; agent: string; latencyMs: number | null; createdAt: string;
  userMessage: string | null; prompt: string | null; geminiResponse: string | null;
  geminiError: string | null;
  inputTokens: number; outputTokens: number; totalTokens: number;
  inputCostUsd: number; outputCostUsd: number; totalCostUsd: number;
}
interface LogsResponse {
  logs: GeminiLog[]; total: number; page: number; limit: number; pages: number;
}

/* ─── Tokens ─────────────────────────────────────────────────────── */
const C = {
  indigo: '#6366f1', teal: '#2dd4bf', amber: '#f59e0b',
  green: '#22c55e', rose: '#f43f5e', violet: '#a78bfa', slate: '#475569',
};

const AGENTS = [
  { key: 'ALL',        label: 'Todos',     color: C.slate  },
  { key: 'TRIAJE',     label: 'Triaje',    color: '#6366f1' },
  { key: 'ANALISTA',   label: 'Analista',  color: '#2dd4bf' },
  { key: 'COMERCIAL',  label: 'Comercial', color: '#f59e0b' },
  { key: 'SOPORTE_B2B',label: 'Soporte',   color: '#a78bfa' },
];

/* ─── Sub-components ─────────────────────────────────────────────── */
function TokenBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex flex-col items-center px-2.5 py-1 rounded-lg" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
      <span className="text-[11px] font-black" style={{ color }}>{value}</span>
      <span className="text-[8px] text-text-ghost leading-none mt-0.5">{label}</span>
    </div>
  );
}

const PROMPT_PREVIEW = 300;
const RESPONSE_PREVIEW = 400;

function LogCard({ log }: { log: GeminiLog }) {
  const [fullPrompt, setFullPrompt] = useState(false);
  const [fullResponse, setFullResponse] = useState(false);
  const persona = AGENT_PERSONAS[log.agent] ?? { name: log.agent, color: C.slate, avatar: '' };
  const ts = new Date(log.createdAt);
  const dateStr = ts.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = ts.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const promptText   = log.prompt ?? '';
  const responseText = log.geminiResponse ?? '';

  return (
    <div className="bg-bg-card border border-border-subtle rounded-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {persona.avatar && (
            <img src={persona.avatar} alt={persona.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black" style={{ color: persona.color }}>{persona.name}</span>
              <span className="text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                style={{ background: `${persona.color}15`, color: persona.color }}>
                {log.agent}
              </span>
            </div>
            <div className="text-[9px] text-text-ghost mt-0.5">{dateStr} · {timeStr}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <TokenBadge label="entrada"  value={log.inputTokens.toLocaleString()}  color={C.teal}   />
          <TokenBadge label="salida"   value={log.outputTokens.toLocaleString()} color={C.violet} />
          <TokenBadge label="total"    value={log.totalTokens.toLocaleString()}  color={C.indigo} />
          <TokenBadge label="latencia" value={log.latencyMs ? `${log.latencyMs}ms` : '—'} color={C.slate} />
          <div className="flex flex-col items-center px-2.5 py-1 rounded-lg" style={{ background: `${C.amber}12`, border: `1px solid ${C.amber}25` }}>
            <span className="text-[11px] font-black" style={{ color: C.amber }}>${log.totalCostUsd.toFixed(5)}</span>
            <span className="text-[8px] text-text-ghost leading-none mt-0.5">costo USD</span>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {log.geminiError && (
        <div className="px-3 py-2 rounded-lg flex items-start gap-2" style={{ background: '#f43f5e10', border: '1px solid #f43f5e30' }}>
          <span className="flex-shrink-0">⚠️</span>
          <div>
            <div className="text-[8.5px] font-bold uppercase tracking-wider mb-0.5" style={{ color: '#f43f5e' }}>Error Gemini — fallback activado</div>
            <div className="text-[10px] font-mono" style={{ color: '#f43f5e' }}>{log.geminiError}</div>
          </div>
        </div>
      )}

      {/* Mensaje del usuario */}
      {log.userMessage && (
        <div className="px-3 py-2 rounded-lg" style={{ background: `${C.indigo}08`, border: `1px solid ${C.indigo}20` }}>
          <div className="text-[8.5px] font-bold uppercase tracking-wider text-text-ghost mb-1">Mensaje del usuario</div>
          <div className="text-[10.5px] text-text-secondary">{log.userMessage}</div>
        </div>
      )}

      {/* Prompt enviado a Gemini — siempre visible */}
      <div style={{ border: `1px solid ${C.teal}25`, borderRadius: '10px', overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-3 py-2" style={{ background: `${C.teal}08` }}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: C.teal }}>📤 Prompt enviado a Gemini</span>
            <span className="text-[8px] text-text-ghost">{log.inputTokens > 0 ? `${log.inputTokens.toLocaleString()} tokens` : ''} · {promptText.length.toLocaleString()} chars</span>
          </div>
          {promptText.length > PROMPT_PREVIEW && (
            <button onClick={() => setFullPrompt(v => !v)}
              className="text-[8.5px] font-bold px-2 py-0.5 rounded"
              style={{ background: `${C.teal}20`, color: C.teal }}>
              {fullPrompt ? 'Contraer' : 'Ver completo'}
            </button>
          )}
        </div>
        {promptText ? (
          <pre className="p-3 text-[9.5px] leading-relaxed whitespace-pre-wrap break-words font-mono overflow-y-auto"
            style={{ background: '#0d1117', color: '#e6edf3', maxHeight: fullPrompt ? '600px' : '160px' }}>
            {fullPrompt ? promptText : promptText.slice(0, PROMPT_PREVIEW) + (promptText.length > PROMPT_PREVIEW ? '\n…' : '')}
          </pre>
        ) : (
          <div className="p-3 text-[9.5px] text-text-ghost italic" style={{ background: '#0d1117' }}>
            Sin prompt registrado — Gemini no fue invocado en esta interacción.
          </div>
        )}
      </div>

      {/* Respuesta de Gemini — siempre visible */}
      <div style={{ border: `1px solid ${C.green}25`, borderRadius: '10px', overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-3 py-2" style={{ background: `${C.green}08` }}>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: C.green }}>💬 Respuesta de Gemini</span>
            <span className="text-[8px] text-text-ghost">{log.outputTokens > 0 ? `${log.outputTokens.toLocaleString()} tokens` : ''} · {responseText.length.toLocaleString()} chars</span>
          </div>
          {responseText.length > RESPONSE_PREVIEW && (
            <button onClick={() => setFullResponse(v => !v)}
              className="text-[8.5px] font-bold px-2 py-0.5 rounded"
              style={{ background: `${C.green}20`, color: C.green }}>
              {fullResponse ? 'Contraer' : 'Ver completo'}
            </button>
          )}
        </div>
        {responseText ? (
          <pre className="p-3 text-[9.5px] leading-relaxed whitespace-pre-wrap break-words font-mono overflow-y-auto"
            style={{ background: '#0d1117', color: '#a8ff78', maxHeight: fullResponse ? '600px' : '140px' }}>
            {fullResponse ? responseText : responseText.slice(0, RESPONSE_PREVIEW) + (responseText.length > RESPONSE_PREVIEW ? '\n…' : '')}
          </pre>
        ) : (
          <div className="p-3 text-[9.5px] text-text-ghost italic" style={{ background: '#0d1117' }}>
            Sin respuesta registrada — revisar error arriba.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function MonitorIA() {
  const [activeAgent, setActiveAgent] = useState('ALL');
  const [data, setData] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async (agent: string, p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 20, page: p };
      if (agent !== 'ALL') params.agent = agent;
      const { data: res } = await api.get('/metrics/gemini-logs', { params });
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeAgent, page); }, [activeAgent, page, load]);

  const handleAgent = (key: string) => { setActiveAgent(key); setPage(1); };

  const totals = data?.logs.reduce(
    (acc, l) => ({ input: acc.input + l.inputTokens, output: acc.output + l.outputTokens, cost: acc.cost + l.totalCostUsd }),
    { input: 0, output: 0, cost: 0 }
  ) ?? { input: 0, output: 0, cost: 0 };

  return (
    <div className="min-h-screen bg-bg-base px-6 py-5">
      <Header
        title="Monitor IA — Logs de Gemini"
        subtitle="Prompts enviados · Respuestas recibidas · Tokens consumidos · Costo por request"
        onRefresh={() => load(activeAgent, page)}
        refreshing={loading}
      />

      {/* KPIs de la página actual */}
      <div className="mt-4 mb-5 grid grid-cols-5 gap-3">
        {[
          { label: 'Logs en esta vista',   value: data?.total ?? '—',                                     color: C.indigo  },
          { label: 'Tokens entrada',        value: totals.input  ? `${(totals.input  / 1000).toFixed(1)}K` : '—', color: C.teal    },
          { label: 'Tokens salida',         value: totals.output ? `${(totals.output / 1000).toFixed(1)}K` : '—', color: C.violet  },
          { label: 'Costo en vista (USD)',  value: totals.cost   ? `$${totals.cost.toFixed(5)}`           : '—', color: C.amber   },
          { label: 'Página',               value: data ? `${data.page} / ${data.pages}`                  : '—', color: C.slate   },
        ].map((k) => (
          <div key={k.label} className="bg-bg-card rounded-card border border-border-subtle p-3 text-center">
            <div className="text-[20px] font-black leading-none mb-1" style={{ color: k.color }}>{String(k.value)}</div>
            <div className="text-[9px] text-text-ghost">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs de agente + reload */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1 p-1 bg-bg-card rounded-xl border border-border-subtle">
          {AGENTS.map((a) => (
            <button
              key={a.key}
              onClick={() => handleAgent(a.key)}
              className="px-4 py-2 rounded-lg text-[10.5px] font-bold transition-all"
              style={activeAgent === a.key
                ? { background: a.color, color: '#fff' }
                : { color: '#94a3b8' }}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => load(activeAgent, page)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10.5px] font-bold transition-all disabled:opacity-40"
          style={{ background: '#ffffff0a', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}
          title="Recargar logs"
        >
          <span className={loading ? 'animate-spin inline-block' : 'inline-block'}>⟳</span>
          Recargar
        </button>
      </div>

      {/* Lista de logs */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-text-ghost text-[11px]">
          Cargando logs desde la base de datos...
        </div>
      ) : !data || data.logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-[12px] font-bold text-text-secondary mb-1">Sin logs con prompts registrados aún</div>
          <div className="text-[10.5px] text-text-ghost text-center max-w-md">
            Envía un mensaje en el chat o ejecuta un escenario de entrenamiento.<br />
            A partir del próximo request, los prompts y respuestas quedarán registrados aquí.
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {data.logs.map((log) => <LogCard key={log.id} log={log} />)}
          </div>

          {/* Paginación */}
          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg text-[10.5px] font-bold disabled:opacity-30 transition-all"
                style={{ background: `${C.indigo}15`, color: C.indigo, border: `1px solid ${C.indigo}30` }}
              >
                ← Anterior
              </button>
              {Array.from({ length: Math.min(data.pages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-[10.5px] font-bold transition-all"
                    style={page === p
                      ? { background: C.indigo, color: '#fff' }
                      : { color: '#94a3b8', background: 'transparent' }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, data.pages))}
                disabled={page === data.pages}
                className="px-4 py-2 rounded-lg text-[10.5px] font-bold disabled:opacity-30 transition-all"
                style={{ background: `${C.indigo}15`, color: C.indigo, border: `1px solid ${C.indigo}30` }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-8 pt-4 border-t border-border-subtle flex justify-between text-[10px] text-text-deep">
        <span>InmoData IA · Monitor IA · Gemini Logs</span>
        <span>Precio referencia: entrada $0.10/M · salida $0.40/M tokens</span>
      </div>
    </div>
  );
}
