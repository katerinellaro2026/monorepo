interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  up?: boolean;
  icon: string;
  accent?: string;
}

export default function KPICard({ label, value, change, up, icon, accent = '#6366f1' }: KPICardProps) {
  return (
    <div
      className="bg-bg-card rounded-card p-4"
      style={{ border: `0.5px solid ${accent}33` }}
    >
      <div
        className="w-9 h-9 rounded-[9px] flex items-center justify-center text-lg mb-3"
        style={{ background: `${accent}18` }}
      >
        {icon}
      </div>
      <div className="text-[11px] text-text-faint uppercase tracking-[0.06em] font-medium mb-1">
        {label}
      </div>
      <div className="text-[26px] font-bold text-text-primary leading-none tracking-tight">
        {value}
      </div>
      {change && (
        <div
          className="text-[11px] mt-1.5 flex items-center gap-1"
          style={{ color: up ? '#22c55e' : '#f43f5e' }}
        >
          {up ? '▲' : '▼'} {change}
        </div>
      )}
    </div>
  );
}
