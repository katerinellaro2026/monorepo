import { useEffect, useState } from 'react';
import { Loader2, Plug, Copy, Check } from 'lucide-react';
import { fetchApiAccess } from '@/api/client';

interface ApiData {
  apiToken: string; baseUrl: string;
  docs: Array<{ method: string; path: string; desc: string }>;
  note: string;
}

export default function ApiAccessPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApiAccess().then(setData).finally(() => setLoading(false));
  }, []);

  function copyToken() {
    if (!data) return;
    navigator.clipboard.writeText(data.apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center"><Loader2 className="animate-spin text-text-ghost" /></div>;
  }
  if (!data) {
    return <div className="min-h-screen bg-bg-base flex items-center justify-center text-text-ghost text-sm">No se pudo cargar el acceso API.</div>;
  }

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Plug size={20} className="text-violet" />
          <h1 className="text-xl font-black text-text-primary">Acceso API</h1>
        </div>
        <p className="text-[12px] text-text-ghost mb-5">Integra InmoData IA con tus sistemas — plan Enterprise</p>

        {/* Token */}
        <div className="bg-bg-card rounded-card border border-border-subtle p-5 mb-4">
          <div className="text-[10px] text-text-faint uppercase tracking-wide mb-2">Tu API token (válido 1 año)</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#0d1117] text-emerald text-[10px] font-mono rounded-lg px-3 py-2.5 overflow-x-auto whitespace-nowrap">
              {data.apiToken}
            </code>
            <button
              onClick={copyToken}
              className="flex items-center gap-1.5 bg-bg-surface border border-border-subtle hover:border-indigo/50 text-text-secondary text-[11px] font-semibold rounded-lg px-3 py-2.5 transition-all flex-shrink-0"
            >
              {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-[10px] text-text-ghost mt-2">{data.note}</p>
        </div>

        {/* Endpoints */}
        <div className="bg-bg-card rounded-card border border-border-subtle p-5 mb-4">
          <div className="text-[10px] text-text-faint uppercase tracking-wide mb-3">Endpoints disponibles</div>
          <div className="space-y-2">
            {data.docs.map((d, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-border-subtle last:border-0">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-teal/15 text-teal flex-shrink-0 mt-0.5">{d.method}</span>
                <div className="min-w-0">
                  <code className="text-[11px] font-mono text-text-secondary break-all">{d.path}</code>
                  <div className="text-[10px] text-text-ghost">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ejemplo curl */}
        <div className="bg-bg-card rounded-card border border-border-subtle p-5">
          <div className="text-[10px] text-text-faint uppercase tracking-wide mb-2">Ejemplo</div>
          <pre className="bg-[#0d1117] text-[#e6edf3] text-[10.5px] font-mono rounded-lg px-3 py-3 overflow-x-auto whitespace-pre-wrap">
{`curl -H "Authorization: Bearer <API_TOKEN>" \\
  ${data.baseUrl}/features/comparador`}
          </pre>
        </div>
      </div>
    </div>
  );
}
