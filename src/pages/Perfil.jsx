import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Mail, LogIn, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PedidoHistorico from '@/components/perfil/PedidoHistorico';
import ReservaAtiva from '@/components/perfil/ReservaAtiva';

export default function Perfil() {
  const { isAuthenticated, user, isLoadingAuth } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }
    let ativo = true;
    (async () => {
      setLoading(true);
      setErro('');
      try {
        const [p, r] = await Promise.all([
          base44.entities.Pedido.filter({ created_by_id: user.id }, '-created_date', 50),
          base44.entities.Reserva.filter({ created_by_id: user.id }, '-created_date', 50),
        ]);
        if (!ativo) return;
        setPedidos(p);
        setReservas(r);
      } catch (e) {
        if (ativo) setErro('Não foi possível carregar seus dados. Tente novamente.');
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [isAuthenticated, user?.id]);

  const reservasAtivas = reservas.filter(r => r.status !== 'cancelada');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-gold text-sm tracking-[0.2em] uppercase">Minha conta</span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mt-2">Perfil</h1>
        <p className="text-muted-foreground mt-3">Seus dados, seu histórico de pedidos e suas reservas.</p>
      </div>

      {isLoadingAuth ? (
        <div className="h-40 rounded-2xl bg-secondary animate-pulse" />
      ) : !isAuthenticated ? (
        <div className="bg-card rounded-2xl border border-gold/15 shadow-sm p-10 text-center">
          <UserRound className="w-14 h-14 text-gold mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-espresso">Entre para ver seu perfil</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Faça login ou crie sua conta para consultar seus dados, pedidos anteriores e reservas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/login?returnTo=%2Fperfil" className="inline-flex items-center gap-2 bg-wine text-cream font-semibold px-6 py-3 rounded-full hover:bg-accent transition-colors">
              <LogIn className="w-4 h-4" /> Entrar
            </Link>
            <Link to="/register" className="border border-gold/40 text-espresso font-semibold px-6 py-3 rounded-full hover:bg-gold/10 transition-colors">
              Criar conta
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dados cadastrais */}
          <section className="bg-card rounded-2xl border border-gold/15 shadow-sm p-6">
            <h2 className="font-heading text-xl font-bold text-espresso mb-4">Dados cadastrais</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-wine/10 text-wine shrink-0">
                  <UserRound className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium text-espresso">{user?.full_name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-wine/10 text-wine shrink-0">
                  <Mail className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Login (e-mail)</p>
                  <p className="font-medium text-espresso break-all">{user?.email || '—'}</p>
                </div>
              </div>
            </div>
          </section>

          {erro && (
            <p className="flex items-center justify-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" /> {erro}
            </p>
          )}

          {/* Histórico de pedidos */}
          <section>
            <h2 className="font-heading text-2xl font-bold text-espresso mb-4">Histórico de pedidos</h2>
            <PedidoHistorico pedidos={pedidos} loading={loading} />
          </section>

          {/* Reservas ativas */}
          <section>
            <h2 className="font-heading text-2xl font-bold text-espresso mb-4">Reservas ativas</h2>
            <ReservaAtiva reservas={reservasAtivas} loading={loading} />
          </section>
        </div>
      )}
    </div>
  );
}