import React, { useEffect, useState } from 'react';
import { Search, Package, ChefHat, CheckCircle2, Bike, Home, Receipt, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_FLOW = [
  { key: 'recebido', label: 'Recebido', icon: Receipt },
  { key: 'confirmado', label: 'Confirmado', icon: CheckCircle2 },
  { key: 'preparo', label: 'Em preparo', icon: ChefHat },
  { key: 'pronto', label: 'Pronto', icon: Package },
  { key: 'saiu_entrega', label: 'Saiu para entrega', icon: Bike },
  { key: 'entregue', label: 'Entregue', icon: Home },
];

export default function Acompanhamento() {
  const [numero, setNumero] = useState('');
  const [buscado, setBuscado] = useState('');
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const buscar = async (n) => {
    const alvo = (n || buscado).trim();
    if (!alvo) return;
    setLoading(true);
    setErro('');
    setPedido(null);
    try {
      const porNumero = /^\d+$/.test(alvo)
        ? await base44.entities.Pedido.filter({ numero: Number(alvo) })
        : [];
      const res = porNumero.length > 0
        ? porNumero
        : await base44.entities.Pedido.filter({ codigo: alvo.toUpperCase() });
      if (res.length === 0) {
        setErro(`Pedido "${alvo}" não encontrado.`);
      } else {
        setPedido(res[0]);
      }
    } catch (e) {
      setErro('Erro ao buscar pedido.');
    } finally {
      setLoading(false);
    }
  };

  // Inscreve para atualizações em tempo real do pedido
  useEffect(() => {
    if (!pedido) return;
    const unsub = base44.entities.Pedido.subscribe((event) => {
      if (event.type === 'update' && event.data?.id === pedido.id) {
        setPedido(event.data);
      }
    });
    return unsub;
  }, [pedido?.id]);

  // Auto-busca via query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get('numero');
    if (n) {
      setNumero(n);
      setBuscado(n);
      buscar(n);
    }
  }, []);

  const statusIndex = pedido ? STATUS_FLOW.findIndex(s => s.key === pedido.status) : -1;
  const cancelado = pedido?.status === 'cancelado';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-gold text-sm tracking-[0.2em] uppercase">Acompanhe</span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mt-2">Meu pedido</h1>
        <p className="text-muted-foreground mt-3">Digite o número ou o código do seu pedido para acompanhar o status.</p>
      </div>

      <div className="flex gap-2 max-w-md mx-auto mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (setBuscado(numero), buscar(numero))}
            placeholder="Nº do pedido ou código"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-gold/25 text-sm focus:outline-none focus:border-wine"
          />
        </div>
        <button
          onClick={() => { setBuscado(numero); buscar(numero); }}
          disabled={loading || !numero}
          className="bg-wine text-cream font-semibold px-6 py-3 rounded-full hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {erro && <p className="text-center text-destructive">{erro}</p>}

      {pedido && (
        <div className="bg-card rounded-2xl border border-gold/15 shadow-sm overflow-hidden">
          <div className="bg-wine text-cream px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-cream/70 text-xs uppercase tracking-wide">Pedido</p>
              <p className="font-heading text-2xl font-bold">#{pedido.numero}</p>
              {pedido.codigo && <p className="font-mono-price text-cream/80 text-xs tracking-wider">{pedido.codigo}</p>}
            </div>
            <div className="text-right">
              <p className="text-cream/70 text-xs flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Tempo estimado</p>
              <p className="font-mono-price font-semibold">{pedido.tempo_estimado || '—'}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6">
            {cancelado ? (
              <div className="text-center py-8">
                <p className="text-destructive font-semibold text-lg">Pedido cancelado</p>
                <p className="text-muted-foreground text-sm">Entre em contato com a pizzaria para mais informações.</p>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-8">
                {STATUS_FLOW.map((s, i) => {
                  const done = i <= statusIndex;
                  const current = i === statusIndex;
                  return (
                    <div key={s.key} className="flex flex-col items-center flex-1 relative">
                      {i > 0 && <div className={`absolute right-1/2 top-5 h-0.5 w-full ${i <= statusIndex ? 'bg-wine' : 'bg-gold/20'} translate-y-0`} />}
                      <div className={`relative z-10 grid place-items-center w-10 h-10 rounded-full border-2 transition-all ${done ? 'bg-wine border-wine text-cream' : 'bg-card border-gold/25 text-muted-foreground'} ${current ? 'ring-4 ring-gold/30 scale-110' : ''}`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] mt-2 text-center leading-tight ${done ? 'text-wine font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Itens */}
            <div className="border-t border-gold/15 pt-4 space-y-2">
              <h3 className="font-heading text-lg font-semibold text-espresso mb-2">Itens</h3>
              {pedido.itens?.map((it, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{it.quantidade}× {it.nome}</p>
                    {it.tamanho && <p className="text-xs text-muted-foreground">{it.tamanho}{it.borda && it.borda !== 'Sem borda recheada' ? ` · ${it.borda}` : ''}</p>}
                    {it.adicionais?.length > 0 && <p className="text-xs text-muted-foreground">+ {it.adicionais.map(a => a.nome).join(', ')}</p>}
                  </div>
                  <span className="font-mono-price">R$ {(it.preco_unitario * it.quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="border-t border-gold/15 mt-4 pt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-mono-price">R$ {(pedido.subtotal || 0).toFixed(2).replace('.', ',')}</span></div>
              {pedido.tipo === 'entrega' && <div className="flex justify-between"><span className="text-muted-foreground">Entrega</span><span className="font-mono-price">R$ {(pedido.taxa_entrega || 0).toFixed(2).replace('.', ',')}</span></div>}
              <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span className="font-mono-price text-wine">R$ {(pedido.total || 0).toFixed(2).replace('.', ',')}</span></div>
            </div>

            <div className="border-t border-gold/15 mt-4 pt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Tipo</p><p className="font-medium">{pedido.tipo === 'entrega' ? '🛵 Entrega' : '🏪 Retirada'}</p></div>
              <div><p className="text-xs text-muted-foreground">Pagamento</p><p className="font-medium">{pedido.pagamento}</p></div>
              {pedido.tipo === 'entrega' && pedido.endereco && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Endereço</p><p className="font-medium">{pedido.endereco.rua}, {pedido.endereco.numero} - {pedido.endereco.bairro}</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}