import { useState, useRef, useEffect } from 'react';
import { Send, Home, Loader2 } from 'lucide-react';
import { sendChatMessage } from '@/api/client';
import { getPersona } from '@/data/agentPersonas';
import type { ChatMessage } from '@/types';

function MarkdownText({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function AgentAvatar({ agentKey, size = 28 }: { agentKey?: string | null; size?: number }) {
  const persona = getPersona(agentKey);
  return (
    <img
      src={persona.avatar}
      alt={persona.name}
      width={size}
      height={size}
      className="rounded-[8px] flex-shrink-0 object-cover"
      style={{ width: size, height: size }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy **Sofía**, coordinadora de InmoData IA.\n\nPuedo conectarte con nuestros especialistas para:\n🏠 **Tasar** una propiedad en Lince, Jesús María o Miraflores\n📊 **Comparar precios** del mercado en tiempo real\n🤝 **Calificar tu búsqueda** con un corredor especialista\n\n¿En qué te puedo ayudar hoy?',
      agent: 'TRIAJE',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await sendChatMessage(msg, sessionId);
      setSessionId(res.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.response, agent: res.agent },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, hubo un problema al procesar tu consulta. Intenta de nuevo.', agent: 'ERROR' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const SUGGESTIONS = [
    '¿Cuánto vale un depa de 70m² en Miraflores?',
    'Busco un apartamento en Jesús María hasta S/ 280,000',
    'Compara precios en Lince vs Miraflores',
  ];

  return (
    <div className="flex flex-col h-screen bg-bg-base">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border-subtle bg-bg-surface">
        <div className="w-9 h-9 bg-indigo rounded-[10px] flex items-center justify-center flex-shrink-0">
          <Home size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-text-primary">InmoData IA</div>
          <div className="text-[11px] text-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse inline-block" />
            Sofía · Carlos · Diego · Valeria — en línea
          </div>
        </div>
        {/* Equipo de agentes en miniatura */}
        <div className="flex -space-x-1.5">
          {(['TRIAJE', 'ANALISTA', 'COMERCIAL', 'SOPORTE_B2B'] as const).map((key) => {
            const p = getPersona(key);
            return (
              <img
                key={key}
                src={p.avatar}
                alt={p.name}
                title={`${p.name} — ${p.role}`}
                className="w-7 h-7 rounded-full border-2 border-bg-surface object-cover"
              />
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {messages.map((msg, i) => {
          const persona = getPersona(msg.agent);
          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5`}>
              {msg.role === 'assistant' && (
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <AgentAvatar agentKey={msg.agent} size={30} />
                </div>
              )}

              <div className="flex flex-col max-w-[75%]">
                {/* Agent name above bubble */}
                {msg.role === 'assistant' && (
                  <div className="text-[10px] font-semibold mb-1 ml-0.5" style={{ color: persona.color }}>
                    {persona.name}
                    <span className="font-normal text-text-ghost ml-1">· {persona.role}</span>
                  </div>
                )}

                <div
                  className={`rounded-[14px] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo text-white rounded-tr-[4px]'
                      : 'bg-bg-card border border-border-subtle text-text-secondary rounded-tl-[4px]'
                  }`}
                  style={msg.role === 'assistant' ? { borderTopColor: persona.color + '40' } : {}}
                >
                  <MarkdownText text={msg.content} />
                </div>

                {/* Agent indicator pill below bubble */}
                {msg.role === 'assistant' && msg.agent && msg.agent !== 'ERROR' && (
                  <div className="flex items-center gap-1 mt-1.5 ml-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: persona.color + '15', color: persona.color }}>
                      {persona.emoji} Agente {msg.agent.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-indigo/20 flex items-center justify-center text-[12px] flex-shrink-0 mt-5">
                  👤
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start gap-2.5">
            <AgentAvatar agentKey="DEFAULT" size={30} />
            <div className="flex flex-col">
              <div className="text-[10px] font-semibold mb-1 ml-0.5 text-indigo-light">
                Procesando…
              </div>
              <div className="bg-bg-card border border-border-subtle rounded-[14px] rounded-tl-[4px] px-4 py-3">
                <Loader2 size={16} className="text-indigo-light animate-spin" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="text-[11.5px] text-indigo-light bg-indigo/10 border border-indigo/25 rounded-pill px-3 py-1.5 hover:bg-indigo/20 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-border-subtle bg-bg-surface">
        <div className="flex items-center gap-3 bg-bg-card border border-border-subtle rounded-[14px] px-4 py-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Consulta una propiedad, zona o precio…"
            className="flex-1 bg-transparent text-sm text-text-secondary placeholder-text-ghost outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-[8px] bg-indigo flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo/80 transition-colors"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-text-ghost text-center mt-2">
          Sofía · Carlos · Diego · Valeria — Equipo InmoData IA · Lima, Perú
        </p>
      </div>
    </div>
  );
}
