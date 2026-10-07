import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Phone, MapPin, CreditCard, Clock, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const STATUS_FLOW = ['recebido', 'confirmado', 'preparo', 'pronto', 'saiu_entrega', 'entregue'];
const STATUS_LABELS = {
  recebido: 'Recebido', confirmado: 'Confirmado', preparo: 'Em preparo',
  pronto: 'Pronto', saiu_entrega: 'Saiu p/ entrega', entregue: 'Entregue', cancelado: 'Cancelado',
};
const STATUS_COLOR = {
  recebido: 'bg-amber-100 text-amber-800', confirmado: 'bg-blue-100 text-blue-800',
  preparo: 'bg-orange-100 text-orange-800', pronto: 'bg-purple-100 text-purple-800',
  saiu_entrega: 'bg-indigo-100 text-indigo-800', entregue: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export default function PedidosAdmin() {
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('all');
  const [expandido, setExpandido] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const p = await base44.entities.Pedido.list('-created_date', 200);
      setPedidos(p);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const mudarStatus = async (pedido, novoStatus) => {
    try {
      await base44.entities.Pedido.update(pedido.id, { status: novoStatus });
      setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, status: novoStatus } : p));
      toast({ title: `Pedido #${pedido.numero} → ${STATUS_LABELS[novoStatus]}` });
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const filtrados = filtro === 'all' ? pedidos : pedidos.filter(p => p.status === filtro);

  const proximoStatus = (status) => {
    const i = STATUS_FLOW.indexOf(status);
    return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground text-sm">{pedidos.length} pedidos no total.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          <button onClick={() => setFiltro('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filtro === 'all' ? 'bg-wine text-cream' : 'bg-secondary'}`}>Todos</button>
          {Object.entries(STATUS_LABELS).map(([k, l]) => (
            <button key={k} onClick={() => setFiltro(k)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filtro === k ? 'bg-wine text-cream' : 'bg-secondary'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)}</div>
      ) : filtrados.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">Nenhum pedido nesse status.</p>
      ) : (
        <div className="space-y-3">
          {filtrados.map(p => {
            const open = expandido === p.id;
            const prox = proximoStatus(p.status);
            return (
              <div key={p.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <button onClick={() => setExpandido(open ? null : p.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-mono-price text-xl font-bold text-wine">#{p.numero}</p>
                      {p.codigo && <p className="font-mono-price text-[10px] text-muted-foreground tracking-wider">{p.codigo}</p>}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{p.cliente_nome}</p>
                      <p className="text-xs text-muted-foreground">{p.itens?.length || 0} itens · {p.tipo === 'entrega' ? '🛵 Entrega' : '🏪 Retirada'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-price font-semibold">R$ {(p.total || 0).toFixed(2).replace('.', ',')}</span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                    {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {open && (
                  <div className="border-t border-border p-4 space-y-4 bg-secondary/20">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {p.cliente_email || '—'}</p>
                        <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {p.cliente_telefone}</p>
                        <p className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-muted-foreground" /> {p.pagamento}</p>
                        <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> {p.tempo_estimado}</p>
                        {p.tipo === 'entrega' && p.endereco && (
                          <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5" /> {p.endereco.rua}, {p.endereco.numero} - {p.endereco.bairro}{p.endereco.complemento ? ` (${p.endereco.complemento})` : ''}</p>
                        )}
                      </div>
                      <div className="bg-card rounded-xl p-3 border border-border">
                        <p className="font-semibold text-sm mb-2">Itens</p>
                        {p.itens?.map((it, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                            <div>
                              <p>{it.quantidade}× {it.nome}</p>
                              {it.tamanho && <p className="text-xs text-muted-foreground">{it.tamanho}{it.borda && it.borda !== 'Sem borda recheada' ? ` · ${it.borda}` : ''}</p>}
                              {it.adicionais?.length > 0 && <p className="text-xs text-muted-foreground">+ {it.adicionais.map(a => a.nome).join(', ')}</p>}
                              {it.observacoes && <p className="text-xs italic text-muted-foreground">"{it.observacoes}"</p>}
                            </div>
                            <span className="font-mono-price">R$ {(it.preco_unitario * it.quantidade).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold pt-2 mt-1">
                          <span>Total</span>
                          <span className="font-mono-price text-wine">R$ {(p.total || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    </div>

                    {p.observacoes && <p className="text-sm bg-amber-50 text-amber-900 p-2 rounded-lg">Obs: {p.observacoes}</p>}

                    {/* Ações de status */}
                    <div className="flex flex-wrap gap-2">
                      {STATUS_FLOW.map(s => (
                        <button key={s} onClick={() => mudarStatus(p, s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${p.status === s ? 'bg-wine text-cream border-wine' : 'border-border hover:border-wine'}`}>
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                      <button onClick={() => mudarStatus(p, 'cancelado')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-red-300 text-red-600 hover:bg-red-50">
                        Cancelar
                      </button>
                    </div>
                    {prox && (
                      <button onClick={() => mudarStatus(p, prox)} className="w-full bg-gold text-espresso font-semibold py-2.5 rounded-full hover:bg-gold/90 transition-colors">
                        Avançar → {STATUS_LABELS[prox]}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}