import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Pizza, CalendarCheck, Home as HomeIcon, UtensilsCrossed, LogIn, LogOut, Tag, MessageCircle, UserRound } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const primeiroNome = user?.full_name?.split(' ')[0];

  const links = [
    { to: '/', label: 'Início', icon: HomeIcon },
    { to: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
    { to: '/promocoes', label: 'Promoções', icon: Tag },
    { to: '/reserva', label: 'Reservar Mesa', icon: CalendarCheck },
    { to: '/acompanhamento', label: 'Meu Pedido', icon: Pizza },
    { to: '/contato', label: 'Contato', icon: MessageCircle },
  ];

  const go = (path) => { setOpen(false); navigate(path); };

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <span className="grid place-items-center w-10 h-10 rounded-full bg-wine text-cream shadow-md group-hover:scale-105 transition-transform">
            <Pizza className="w-5 h-5" />
          </span>
          <div className="leading-none">
            <span className="font-heading text-xl md:text-2xl font-bold text-wine tracking-tight">La Tavola</span>
            <span className="block text-[10px] tracking-[0.25em] uppercase text-gold">Pizzaria</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const active = location.pathname === l.to;
            return (
              <button
                key={l.to}
                onClick={() => go(l.to)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-wine text-cream' : 'text-espresso hover:bg-gold/15'}`}
              >
                {l.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/perfil" className="text-sm font-medium text-espresso hover:text-wine transition-colors">Olá, {primeiroNome}</Link>
              <button
                onClick={() => logout()}
                className="grid place-items-center w-10 h-10 rounded-full border border-gold/30 text-espresso hover:bg-gold/15"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 px-4 h-11 rounded-full border border-gold/30 text-sm font-medium text-espresso hover:bg-gold/15"
            >
              <LogIn className="w-4 h-4" /> Entrar
            </Link>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="relative grid place-items-center w-11 h-11 rounded-full bg-wine text-cream hover:bg-wine/90 transition-colors shadow-sm"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-gold text-espresso text-xs font-bold font-mono-price">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden grid place-items-center w-11 h-11 rounded-full border border-gold/30 text-espresso"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-gold/20 bg-cream animate-fade-in">
          {links.map(l => (
            <button
              key={l.to}
              onClick={() => go(l.to)}
              className="w-full flex items-center gap-3 px-6 py-4 text-left text-espresso hover:bg-gold/10 border-b border-gold/10"
            >
              <l.icon className="w-5 h-5 text-wine" />
              <span className="font-medium">{l.label}</span>
            </button>
          ))}
          {isAuthenticated ? (
            <>
              <button
                onClick={() => go('/perfil')}
                className="w-full flex items-center gap-3 px-6 py-4 text-left text-espresso hover:bg-gold/10 border-b border-gold/10"
              >
                <UserRound className="w-5 h-5 text-wine" />
                <span className="font-medium">Meu Perfil</span>
              </button>
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-6 py-4 text-left text-espresso hover:bg-gold/10"
              >
                <LogOut className="w-5 h-5 text-wine" />
                <span className="font-medium">Sair{primeiroNome ? ` (${primeiroNome})` : ''}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => go('/login')}
              className="w-full flex items-center gap-3 px-6 py-4 text-left text-espresso hover:bg-gold/10"
            >
              <LogIn className="w-5 h-5 text-wine" />
              <span className="font-medium">Entrar</span>
            </button>
          )}
        </nav>
      )}
    </header>
  );
}