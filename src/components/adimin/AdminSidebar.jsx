import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Armchair, CalendarDays, UtensilsCrossed, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAdminAuth } from '@/lib/AdminAuth';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/mesas', label: 'Mesas', icon: Armchair },
  { to: '/admin/reservas', label: 'Reservas', icon: CalendarDays },
  { to: '/admin/produtos', label: 'Cardápio', icon: UtensilsCrossed },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [open, setOpen] = useState(false);

  const go = (path) => { setOpen(false); navigate(path); };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="lg:hidden fixed top-4 left-4 z-50 grid place-items-center w-11 h-11 rounded-full bg-sidebar text-sidebar-foreground shadow-lg"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-gold text-espresso font-heading font-bold">L</span>
            <div className="leading-none">
              <span className="font-heading text-lg font-bold text-sidebar-foreground">La Tavola</span>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-gold">Painel Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {LINKS.map(l => {
            const active = location.pathname === l.to;
            return (
              <button
                key={l.to}
                onClick={() => go(l.to)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-gold text-espresso' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent'}`}
              >
                <l.icon className="w-5 h-5" />
                {l.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
            <UtensilsCrossed className="w-5 h-5" /> Ver site
          </Link>
          <button onClick={() => { logout(); navigate('/admin/login'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}
    </>
  );
}