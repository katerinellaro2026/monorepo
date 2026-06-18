import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, BarChart3, Home, LogOut } from 'lucide-react';
import { logout } from '@/api/client';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

interface SidebarProps {
  role?: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/chat',           icon: <MessageSquare size={18} />,  label: 'Chat Tasador',       roles: ['BUYER', 'BROKER', 'ADMIN'] },
  { to: '/command-center', icon: <LayoutDashboard size={18} />, label: 'Centro de Comando', roles: ['ADMIN'] },
  { to: '/pro-dashboard',  icon: <BarChart3 size={18} />,      label: 'Dashboard Pro',      roles: ['BROKER', 'ADMIN'] },
];

export default function Sidebar({ role }: SidebarProps) {
  const visible = NAV_ITEMS.filter((n) => !n.roles || n.roles.includes(role ?? 'BUYER'));

  return (
    <aside className="w-56 flex-shrink-0 bg-bg-surface border-r border-border-subtle flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-subtle">
        <div className="w-8 h-8 bg-indigo rounded-[9px] flex items-center justify-center text-base">
          <Home size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-text-primary leading-none">InmoData IA</div>
          <div className="text-[10px] text-text-faint mt-0.5">PropTech · Lima</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-[9px] text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-bg-elevated text-text-primary border border-border-subtle'
                  : 'text-text-faint hover:text-text-muted hover:bg-bg-elevated/50'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border-subtle">
        <button
          onClick={() => { logout(); window.location.href = '/chat'; }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-[9px] text-sm text-text-ghost hover:text-rose hover:bg-rose/5 transition-all"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
