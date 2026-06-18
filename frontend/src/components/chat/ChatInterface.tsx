import { useState, useRef, useEffect } from 'react';
import { Send, Home, Loader2 } from 'lucide-react';
import { sendChatMessage } from '@/api/client';
import type { ChatMessage } from '@/types';

function MarkdownText({ text }: { text: string }) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente de **InmoData IA**.\n\nPuedo ayudarte a tasar una propiedad en **Lince, Jesús María o Miraflores** con datos de mercado en tiempo real.\n\n¿Qué propiedad te gustaría consultar?',
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
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle bg-bg-surface">
        <div className="w-9 h-9 bg-indigo rounded-[10px] flex items-center justify-center">
          <Home size={18} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-text-primary">InmoData IA</div>
          <div className="text-[11px] text-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse inline-block" />
            Tasador en vivo · Lince · Jesús María · Miraflores
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-[8px] bg-indigo/20 flex items-center justify-center text-sm mr-2 mt-0.5 flex-shrink-0">
                🏠
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-[14px] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo text-white rounded-tr-[4px]'
                  : 'bg-bg-card border border-border-subtle text-text-secondary rounded-tl-[4px]'
              }`}
            >
              <MarkdownText text={msg.content} />
              {msg.agent && msg.role === 'assistant' && (
                <div className="text-[10px] text-text-ghost mt-1.5">
                  via {msg.agent}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-[8px] bg-indigo/20 flex items-center justify-center text-sm mr-2 mt-0.5 flex-shrink-0">
              🏠
            </div>
            <div className="bg-bg-card border border-border-subtle rounded-[14px] rounded-tl-[4px] px-4 py-3">
              <Loader2 size={16} className="text-indigo-light animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only on first interaction) */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
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
            placeholder="Consulta una propiedad, zona o precio..."
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
          InmoData IA · Datos de Urbania y Adondevivir en tiempo real
        </p>
      </div>
    </div>
  );
}
