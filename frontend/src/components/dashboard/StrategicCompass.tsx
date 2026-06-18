import { Compass, Target, Lightbulb } from 'lucide-react';

export default function StrategicCompass() {
  return (
    <div
      className="rounded-card p-5 mb-5"
      style={{
        background: '#141720',
        border: '1px solid rgba(99,102,241,0.4)',
        boxShadow: '0 0 24px rgba(99,102,241,0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Compass size={18} className="text-indigo-light" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-indigo-light">
          Brújula Estratégica
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Misión */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-indigo/15 flex items-center justify-center">
              <Target size={14} className="text-indigo-light" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-ghost">Misión</span>
          </div>
          <p className="text-[12px] text-text-muted leading-relaxed">
            Empoderar a compradores e inquilinos con datos en tiempo real para decisiones financieras seguras,
            impulsando simultáneamente el crecimiento de las agencias inmobiliarias a través de tecnología
            predictiva y prospectos altamente calificados.
          </p>
        </div>

        {/* Visión */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-amber/15 flex items-center justify-center">
              <Lightbulb size={14} className="text-amber" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-ghost">
              Visión 2031
            </span>
          </div>
          <p className="text-[12px] text-text-muted leading-relaxed">
            Para el 2031, ser el ecosistema central que articula la oferta y la demanda de bienes raíces en el
            Perú y la región, transformando la fricción y la especulación actual en un mercado eficiente y
            transparente, impulsado puramente por la inteligencia de datos.
          </p>
        </div>
      </div>
    </div>
  );
}
