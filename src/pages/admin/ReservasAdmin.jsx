import React, { useEffect, useState } from 'react';
import { Check, X, Calendar, Clock, Users, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const STATUS_STYLE = {
  pendente: 'bg-amber-100 text-amber-800',
  confirmada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};
const STATUS_LABEL = { pendente: 'Pendente', confirmada: 'Confirmada', cancelada: 'Cancelada' };

export default function ReservasAdmin() {
  const { toast } = useToast();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [novoHorario, setNovoHorario] = useState('');

  const carregar = async () => {
    try {
      const r = await base44.entities.Reserva.list('-created_date', 200);
      setReservas(r);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const setStatus = async (r, status) => {
    try {
      await base44.entities.Reserva.update(r.id, { status });
      setReservas(prev => prev.map(x => x.id === r.id ? { ...x, status } : x));
      toast({ title: `Reserva de ${r.cliente_nome} → ${STATUS_LABEL[status]}` });
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const alterarHorario = async (r) => {
    if (!novoHorario) return;
    try {
      await base44.entities.Reserva.update(r.id, { horario: novoHorario });
      setReservas(prev => prev.map(x => x.id === r.id ? { ...x, horario: novoHorario } : x));
      setEditando(null);
      setNovoHorario('');
      toast({ title: 'Horário alterado' });
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Reservas</h1>
        <p className="text-muted-foreground text-sm">{reservas.filter(r => r.status !== 'cancelada').length} reservas ativas.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)}</div>
      ) : reservas.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">Nenhuma reserva registrada.</p>
      ) : (
        <div className="space-y-3">
          {reservas.map(r => (
            <div key={r.id} className="bg-card rounded-2xl border border-border shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-wine/10 rounded-xl px-4 py-2">
                    <p className="text-xs text-muted-foreground">Mesa</p>
                    <p className="font-heading text-xl font-bold text-wine">{r.mesa_numero}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{r.cliente_nome}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(r.data + 'T00:00').toLocaleDateString('pt-BR')}</span>
                      {editando === r.id ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <input type="time" value={novoHorario} onChange={e => setNovoHorario(e.target.value)} className="border border-border rounded px-1 py-0.5 text-xs" />
                          <button onClick={() => alterarHorario(r)} className="text-green-600 font-semibold">✓</button>
                          <button onClick={() => setEditando(null)} className="text-red-500">✕</button>
                        </span>
                      ) : (
                        <button onClick={() => { setEditando(r.id); setNovoHorario(r.horario); }} className="flex items-center gap-1 hover:text-wine"><Clock className="w-3.5 h-3.5" /> {r.horario}</button>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {r.pessoas} pessoas</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {r.cliente_telefone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  {r.status === 'pendente' && (
                    <button onClick={() => setStatus(r, 'confirmada')} className="grid place-items-center w-8 h-8 rounded-full bg-green-100 text-green-700 hover:bg-green-200" title="Confirmar">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {r.status !== 'cancelada' && (
                    <button onClick={() => setStatus(r, 'cancelada')} className="grid place-items-center w-8 h-8 rounded-full bg-red-100 text-red-700 hover:bg-red-200" title="Cancelar">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}