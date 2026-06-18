import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onRefresh, refreshing, actions }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-5 border-b border-border-subtle">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo rounded-[10px] flex items-center justify-center text-xl flex-shrink-0">
          🏠
        </div>
        <div>
          <div className="text-base font-bold text-text-primary">{title}</div>
          {subtitle && <div className="text-[11px] text-text-ghost mt-0.5">{subtitle}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live badge */}
        <span className="flex items-center gap-1.5 bg-indigo/14 text-indigo-light border border-indigo/30 rounded-pill px-3 py-1 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-light animate-pulse inline-block" />
          En vivo
        </span>

        <span className="text-[11px] text-text-deep">Lince · Jesús María · Miraflores</span>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-text-ghost hover:text-text-muted hover:bg-bg-elevated transition-all"
            aria-label="Actualizar"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        )}

        {actions}
      </div>
    </div>
  );
}
