import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarX, CalendarDays, Armchair, ArrowRight } from 'lucide-react';

const STATUS_LABELS = {
  pendente: 'Aguardando confirmação',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
};

const STATUS_COLOR = {
  pendente: 'bg-amber-100 text-amber-800',
  confirmada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};

export default function ReservaAtiva({ reservas, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
      </div>
    );
  }

  if (reservas.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-gold/30 rounded-2xl">
        <CalendarX className="w-10 h-10 text-gold/50 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Nenhuma reserva ativa no momento.</p>
        <Link to="/reserva" className="inline-flex items-center gap-1 mt-3 text-wine font-medium hover:gap-2 transition-all">
          Reservar uma mesa <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservas.map(r => (
        <div key={r.id} className="bg-card rounded-xl border border-gold/15 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="flex items-center gap-2 font-semibold text-espresso">
              <Armchair className="w-4 h-4 text-wine" /> Mesa {r.mesa_numero}
            </p>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(r.data + 'T00:00').toLocaleDateString('pt-BR')} às {r.horario} · {r.pessoas} pessoa(s)
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[r.status] || 'bg-secondary text-espresso'}`}>
            {STATUS_LABELS[r.status] || r.status}
          </span>
        </div>
      ))}
    </div>
  );
}