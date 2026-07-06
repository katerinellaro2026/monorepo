import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, BarChart3, Home, LogOut, Map, GitFork,
  Activity, Network, Users, Terminal, CreditCard, User as UserIcon, Bell,
  FileText, Plug,
} from 'lucide-react';
import { logout } from '@/api/client';
import { ROLE_LABEL } from '@/data/plans';

interface SidebarProps {
  role?: string;
  planMenus?: string[];
  onOpenChat?: () => void;
}

// Menús de cliente habilitados por plan (chat se maneja aparte como panel)
const FEATURE_MENU: Record<string, { to: string; label: string; icon: React.ReactNode }> = {
  comparador: { to: '/comparador', label: 'Comparador de precios', icon: <BarChart3 size={18} /> },
  alertas:    { to: '/alertas',    label: 'Alertas',              icon: <Bell size={18} /> },
  acm:        { to: '/acm',        label: 'Reportes ACM',         icon: <FileText size={18} /> },
  leads:      { to: '/leads',      label: 'Leads',                icon: <Users size={18} /> },
  api:        { to: '/api-access', label: 'Acceso API',           icon: <Plug size={18} /> },
};

// Dashboards internos — solo ADMIN
const ADMIN_ITEMS = [
  { to: '/command-center',         icon: <LayoutDashboard size={18} />, label: 'Centro de Comando' },
  { to: '/admin-suscripciones',    icon: <CreditCard size={18} />,      label: 'Suscripciones' },
  { to: '/pro-dashboard',          icon: <BarChart3 size={18} />,       label: 'Dashboard Pro' },
  { to: '/plan-estrategico',       icon: <Map size={18} />,             label: 'Plan Estratégico' },
  { to: '/mapa-procesos',          icon: <GitFork size={18} />,         label: 'Mapa de Procesos' },
  { to: '/simulador-bsc',          icon: <Activity size={18} />,        label: 'Métricas & Simulador' },
  { to: '/estructura-ia',          icon: <Network size={18} />,         label: 'Estructura IA' },
  { to: '/cultura-organizacional', icon: <Users size={18} />,           label: 'Cultura Organizacional' },
  { to: '/monitor-ia',             icon: <Terminal size={18} />,        label: 'Monitor IA — Logs' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2 rounded-[9px] text-sm font-medium transition-all duration-150 ${
    isActive
      ? 'bg-bg-elevated text-text-primary border border-border-subtle'
      : 'text-text-faint hover:text-text-muted hover:bg-bg-elevated/50'
  }`;

export default function Sidebar({ role, planMenus = [], onOpenChat }: SidebarProps) {
  const isAdmin = role === 'ADMIN';
  const featureItems = planMenus
    .filter((m) => m !== 'chat' && FEATURE_MENU[m])
    .map((m) => FEATURE_MENU[m]);

  return (
    <aside className="w-56 flex-shrink-0 bg-bg-surface border-r border-border-subtle flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-subtle">
        <div className="w-8 h-8 bg-indigo rounded-[9px] flex items-center justify-center text-base">
          <Home size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-text-primary leading-none">InmoData IA</div>
          <div className="text-[10px] text-text-faint mt-0.5">{ROLE_LABEL[role ?? ''] ?? 'PropTech · Lima'}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Chat Tasador — abre panel lateral (no es una ruta) */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[9px] text-sm font-medium text-text-faint hover:text-text-muted hover:bg-bg-elevated/50 transition-all"
        >
          <MessageSquare size={18} />
          Chat Tasador
        </button>

        {isAdmin ? (
          ADMIN_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ))
        ) : (
          <>
            {/* Menús habilitados por el plan */}
            {featureItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            {/* Cuenta — siempre visibles para clientes */}
            <div className="pt-3 mt-2 border-t border-border-subtle space-y-1">
              <NavLink to="/mi-suscripcion" className={linkClass}>
                <CreditCard size={18} />
                Mi Suscripción
              </NavLink>
              <NavLink to="/mi-perfil" className={linkClass}>
                <UserIcon size={18} />
                Mi Perfil
              </NavLink>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border-subtle">
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[9px] text-sm text-text-ghost hover:text-rose hover:bg-rose/5 transition-all"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
