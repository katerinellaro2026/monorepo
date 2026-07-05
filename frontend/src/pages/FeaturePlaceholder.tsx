import { useParams } from 'react-router-dom';
import { BarChart3, Bell, FileText, Users, Plug, Sparkles } from 'lucide-react';

const FEATURES: Record<string, { title: string; desc: string; icon: React.ReactNode }> = {
  comparador: {
    title: 'Comparador de precios',
    desc: 'Compara el precio/m² entre Lince, Jesús María y Miraflores con datos del BCRP y comparables reales de portales.',
    icon: <BarChart3 size={28} />,
  },
  alertas: {
    title: 'Alertas de propiedades',
    desc: 'Recibe avisos cuando aparezcan nuevas propiedades que coincidan con tu presupuesto y zona de interés.',
    icon: <Bell size={28} />,
  },
  acm: {
    title: 'Reportes ACM',
    desc: 'Genera análisis comparativos de mercado por distrito con precios, PER y comparables — listos para exportar.',
    icon: <FileText size={28} />,
  },
  leads: {
    title: 'Leads calificados',
    desc: 'Accede a los leads calificados por la IA: presupuesto, zona y contacto de compradores interesados.',
    icon: <Users size={28} />,
  },
  api: {
    title: 'Acceso API',
    desc: 'Integra InmoData IA con tus sistemas mediante nuestra API. Incluido en el plan Enterprise.',
    icon: <Plug size={28} />,
  },
};

export default function FeaturePlaceholder() {
  const { key } = useParams<{ key: string }>();
  const feature = FEATURES[key ?? ''] ?? {
    title: 'Función',
    desc: 'Esta función está incluida en tu plan.',
    icon: <Sparkles size={28} />,
  };

  return (
    <div className="min-h-screen bg-bg-base px-6 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-bg-card rounded-card border border-border-subtle p-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo/10 text-indigo flex items-center justify-center mb-4">
            {feature.icon}
          </div>
          <h1 className="text-xl font-black text-text-primary mb-2">{feature.title}</h1>
          <p className="text-[13px] text-text-ghost leading-relaxed mb-4">{feature.desc}</p>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald bg-emerald/10 border border-emerald/25 rounded-full px-3 py-1">
            <Sparkles size={12} /> Incluido en tu plan
          </div>
        </div>
      </div>
    </div>
  );
}
