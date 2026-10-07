import React, { useEffect, useState } from 'react';
import { Armchair, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const STATUS_OPCOES = [
  { id: 'disponivel', label: 'Disponível', color: 'bg-green-100 text-green-800 border-green-300' },
  { id: 'reservada', label: 'Reservada', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'ocupada', label: 'Ocupada', color: 'bg-red-100 text-red-800 border-red-300' },
  { id: 'limpeza', label: 'Em limpeza', color: 'bg-blue-100 text-blue-800 border-blue-300' },
];

export default function MesasAdmin() {
  const { toast } = useToast();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const m = await base44.entities.Mesa.list();
      setMesas(m.sort((a, b) => a.numero - b.numero));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const mudarStatus = async (mesa, status) => {
    try {
      await base44.entities.Mesa.update(mesa.id, { status });
      setMesas(prev => prev.map(m => m.id === mesa.id ? { ...m, status } : m));
      toast({ title: `Mesa ${mesa.numero} → ${STATUS_OPCOES.find(s => s.id === status).label}` });
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Mesas</h1>
        <p className="text-muted-foreground text-sm">Altere o status das mesas manualmente.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {mesas.map(m => {
            const st = STATUS_OPCOES.find(s => s.id === m.status) || STATUS_OPCOES[0];
            return (
              <div key={m.id} className={`rounded-2xl border-2 p-4 ${st.color}`}>
                <div className="flex items-center justify-between">
                  <Armchair className="w-6 h-6" />
                  <span className="text-xs font-semibold">{st.label}</span>
                </div>
                <p className="font-heading text-xl font-bold mt-2">Mesa {m.numero}</p>
                <p className="text-xs flex items-center gap-1 opacity-80"><Users className="w-3 h-3" /> {m.capacidade} lugares</p>
                <div className="mt-3 grid grid-cols-2 gap-1">
                  {STATUS_OPCOES.map(s => (
                    <button key={s.id} onClick={() => mudarStatus(m, s.id)}
                      className={`text-[11px] py-1 rounded-full font-medium transition-all ${m.status === s.id ? 'bg-espresso text-cream' : 'bg-white/60 hover:bg-white'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}