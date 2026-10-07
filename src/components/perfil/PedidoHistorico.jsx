import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen, ArrowRight } from 'lucide-react';

const STATUS_LABELS = {
  recebido: 'Recebido',
  confirmado: 'Confirmado',
  preparo: 'Em preparo',
  pronto: 'Pronto',
  saiu_entrega: 'Saiu p/ entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

const STATUS_COLOR = {
  recebido: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-blue-100 text-blue-800',
  preparo: 'bg-orange-100 text-orange-800',
  pronto: 'bg-purple-100 text-purple-800',
  saiu_entrega: 'bg-indigo-100 text-indigo-800',
  entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export default function PedidoHistorico({ pedidos, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-gold/30 rounded-2xl">
        <PackageOpen className="w-10 h-10 text-gold/50 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Você ainda não fez nenhum pedido.</p>
        <Link to="/cardapio" className="inline-flex items-center gap-1 mt-3 text-wine font-medium hover:gap-2 transition-all">
          Ver o cardápio <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pedidos.map(p => (
        <div key={p.id} className="bg-card rounded-xl border border-gold/15 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading font-bold text-espresso">Pedido #{p.numero}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(p.created_date).toLocaleDateString('pt-BR')} · {p.itens?.length || 0} itens · {p.tipo === 'entrega' ? 'Entrega' : 'Retirada'}
            </p>
            {p.codigo && <p className="font-mono-price text-[11px] text-muted-foreground tracking-wider">{p.codigo}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono-price font-semibold text-wine">R$ {(p.total || 0).toFixed(2).replace('.', ',')}</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[p.status] || 'bg-secondary text-espresso'}`}>
              {STATUS_LABELS[p.status] || p.status}
            </span>
            <Link to={`/acompanhamento?numero=${p.numero}`} className="text-wine hover:text-accent" aria-label={`Acompanhar pedido ${p.numero}`}>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}