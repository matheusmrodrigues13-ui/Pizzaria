import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, UserRound } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

const BAIRROS = [
  { nome: 'Bela Vista', taxa: 5 },
  { nome: 'Centro', taxa: 7 },
  { nome: 'Jardim Europa', taxa: 9 },
  { nome: 'Vila Mariana', taxa: 8 },
  { nome: 'Outros bairros', taxa: 12 },
];

const PAGAMENTOS = ['Dinheiro', 'Pix', 'Cartão de crédito', 'Cartão de débito'];

const gerarCodigo = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) codigo += chars[Math.floor(Math.random() * chars.length)];
  return `LT-${codigo}`;
};

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQty, removeItem, subtotal, clearCart, itemKey } = useCart();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState('cart');
  const [ultimoPedido, setUltimoPedido] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState({
    nome: '', telefone: '',
    tipo: 'entrega',
    bairro: 'Bela Vista',
    cep: '', rua: '', numero: '', complemento: '', referencia: '',
    pagamento: 'Pix',
    observacoes: '',
  });

  useEffect(() => {
    if (isAuthenticated && user?.full_name) {
      setForm(f => (f.nome ? f : { ...f, nome: user.full_name }));
    }
  }, [isAuthenticated, user]);

  const taxaEntrega = form.tipo === 'entrega' ? (BAIRROS.find(b => b.nome === form.bairro)?.taxa || 0) : 0;
  const total = subtotal + taxaEntrega;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validar = () => {
    if (!form.nome.trim() || !form.telefone.trim()) {
      toast({ title: 'Preencha nome e telefone', variant: 'destructive' });
      return false;
    }
    if (form.tipo === 'entrega') {
      if (!form.rua.trim() || !form.numero.trim() || !form.bairro.trim()) {
        toast({ title: 'Preencha o endereço de entrega', variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const irParaLogin = () => {
    window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname)}`;
  };

  const finalizar = async () => {
    if (!isAuthenticated) { irParaLogin(); return; }
    if (!validar()) return;
    setEnviando(true);
    try {
      const existentes = await base44.entities.Pedido.list('-created_date', 1);
      const proximoNumero = existentes.length > 0 ? (existentes[0].numero || 1041) + 1 : 1042;

      const pedido = await base44.entities.Pedido.create({
        numero: proximoNumero,
        codigo: gerarCodigo(),
        cliente_nome: form.nome,
        cliente_email: user?.email || null,
        cliente_telefone: form.telefone,
        itens: items.map(i => ({
          nome: i.nome,
          tipo: i.tipo,
          tamanho: i.tamanho || null,
          borda: i.borda || null,
          adicionais: i.adicionais || [],
          remocoes: i.remocoes || [],
          observacoes: i.observacoes || null,
          quantidade: i.quantidade,
          preco_unitario: i.preco_unitario,
        })),
        tipo: form.tipo,
        endereco: form.tipo === 'entrega' ? {
          cep: form.cep, rua: form.rua, numero: form.numero,
          bairro: form.bairro, complemento: form.complemento, referencia: form.referencia
        } : null,
        pagamento: form.pagamento,
        subtotal,
        taxa_entrega: taxaEntrega,
        desconto: 0,
        total,
        status: 'recebido',
        observacoes: form.observacoes,
        tempo_estimado: form.tipo === 'entrega' ? '45-60 min' : '25-35 min',
      });

      setUltimoPedido(pedido);
      setStep('done');
      clearCart();
    } catch (e) {
      toast({ title: 'Erro ao finalizar pedido', description: e.message, variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  };

  const fechar = () => {
    setIsOpen(false);
    setTimeout(() => setStep('cart'), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-espresso/50 backdrop-blur-sm animate-fade-in" onClick={fechar} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/20 bg-wine text-cream">
          <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {step === 'cart' && 'Seu carrinho'}
            {step === 'checkout' && 'Finalizar pedido'}
            {step === 'done' && 'Pedido confirmado'}
          </h2>
          <button onClick={fechar} className="grid place-items-center w-9 h-9 rounded-full hover:bg-cream/15">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'done' && ultimoPedido && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center text-center justify-center gap-4">
            <CheckCircle2 className="w-20 h-20 text-gold" />
            <h3 className="font-heading text-2xl text-wine">Pedido #{ultimoPedido.numero}</h3>
            <p className="text-muted-foreground">Seu pedido foi recebido e está sendo preparado!</p>
            <div className="bg-secondary rounded-xl p-4 w-full text-left text-sm space-y-1">
              <p><strong>Código:</strong> <span className="font-mono-price tracking-wider">{ultimoPedido.codigo}</span></p>
              <p><strong>Total:</strong> <span className="font-mono-price">R$ {ultimoPedido.total.toFixed(2).replace('.', ',')}</span></p>
              <p><strong>Tipo:</strong> {ultimoPedido.tipo === 'entrega' ? 'Entrega' : 'Retirada'}</p>
              <p><strong>Tempo estimado:</strong> {ultimoPedido.tempo_estimado}</p>
              <p><strong>Pagamento:</strong> {ultimoPedido.pagamento}</p>
            </div>
            <button
              onClick={() => { fechar(); window.location.href = `/acompanhamento?numero=${ultimoPedido.numero}`; }}
              className="w-full bg-wine text-cream font-semibold py-3 rounded-full hover:bg-accent transition-colors"
            >
              Acompanhar pedido
            </button>
          </div>
        )}

        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 text-gold/40" />
                  <p>Seu carrinho está vazio.</p>
                  <button onClick={fechar} className="text-wine font-medium hover:underline">Ver cardápio</button>
                </div>
              ) : (
                items.map(item => {
                  const k = itemKey(item);
                  return (
                    <div key={k} className="bg-card rounded-xl p-3 border border-gold/15 flex gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-espresso text-sm leading-tight">{item.nome}</p>
                        {item.tamanho && <p className="text-xs text-muted-foreground">{item.tamanho}</p>}
                        {item.borda && item.borda !== 'Sem borda recheada' && <p className="text-xs text-muted-foreground">Borda: {item.borda}</p>}
                        {item.adicionais?.length > 0 && (
                          <p className="text-xs text-muted-foreground">+ {item.adicionais.map(a => a.nome).join(', ')}</p>
                        )}
                        {item.observacoes && <p className="text-xs text-muted-foreground italic">"{item.observacoes}"</p>}
                        <p className="font-mono-price text-wine font-semibold text-sm mt-1">
                          R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeItem(k)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateQty(k, item.quantidade - 1)} className="grid place-items-center w-7 h-7 rounded-full border border-gold/30 hover:bg-gold/15">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono-price text-sm w-5 text-center">{item.quantidade}</span>
                          <button onClick={() => updateQty(k, item.quantidade + 1)} className="grid place-items-center w-7 h-7 rounded-full border border-gold/30 hover:bg-gold/15">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-gold/20 p-4 space-y-3 bg-cream">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono-price font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <button
                  onClick={() => (isAuthenticated ? setStep('checkout') : irParaLogin())}
                  className="w-full bg-wine text-cream font-semibold py-3.5 rounded-full hover:bg-accent transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {isAuthenticated ? 'Finalizar pedido' : 'Entrar para pedir'} <ArrowRight className="w-4 h-4" />
                </button>
                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground">Você precisa entrar na sua conta para finalizar o pedido.</p>
                )}
              </div>
            )}
          </>
        )}

        {step === 'checkout' && (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {user?.email && (
                <div className="flex items-center gap-2 text-sm bg-wine/10 text-wine rounded-lg px-3 py-2">
                  <UserRound className="w-4 h-4" />
                  <span>Logado como <strong>{user.email}</strong></span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-espresso">Nome*</label>
                  <input value={form.nome} onChange={e => set('nome', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="Seu nome" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-espresso">Telefone*</label>
                  <input value={form.telefone} onChange={e => set('telefone', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['entrega', 'retirada'].map(t => (
                  <button key={t} onClick={() => set('tipo', t)} className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${form.tipo === t ? 'border-wine bg-wine text-cream' : 'border-gold/25 hover:border-gold'}`}>
                    {t === 'entrega' ? '🛵 Receber em casa' : '🏪 Retirar na pizzaria'}
                  </button>
                ))}
              </div>

              {form.tipo === 'entrega' && (
                <div className="space-y-3 bg-secondary/50 p-3 rounded-xl">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-espresso">CEP</label>
                      <input value={form.cep} onChange={e => set('cep', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-2 py-2 text-sm focus:outline-none focus:border-wine" placeholder="00000-000" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-espresso">Rua*</label>
                      <input value={form.rua} onChange={e => set('rua', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="Rua" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-espresso">Número*</label>
                      <input value={form.numero} onChange={e => set('numero', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="Nº" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-espresso">Bairro*</label>
                      <select value={form.bairro} onChange={e => set('bairro', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine">
                        {BAIRROS.map(b => <option key={b.nome} value={b.nome}>{b.nome} (R$ {b.taxa})</option>)}
                      </select>
                    </div>
                  </div>
                  <input value={form.complemento} onChange={e => set('complemento', e.target.value)} className="w-full rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="Complemento (apto, bloco...)" />
                  <input value={form.referencia} onChange={e => set('referencia', e.target.value)} className="w-full rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="Ponto de referência" />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-espresso">Forma de pagamento</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {PAGAMENTOS.map(p => (
                    <button key={p} onClick={() => set('pagamento', p)} className={`p-2.5 rounded-lg border-2 text-sm transition-all ${form.pagamento === p ? 'border-wine bg-wine/5' : 'border-gold/25 hover:border-gold'}`}>
                      {p}
                    </button>
                  ))}
                </div>
                {form.pagamento === 'Pix' && (
                  <p className="mt-2 text-xs bg-secondary p-2 rounded-lg text-muted-foreground">
                    Pagamento simulado via Pix. Ao confirmar, geraremos um QR Code fictício para você.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-espresso">Observações do pedido</label>
                <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} rows={2} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine resize-none" placeholder="Ex: caprichar no orégano..." />
              </div>
            </div>

            <div className="border-t border-gold/20 p-4 space-y-2 bg-cream">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono-price">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {form.tipo === 'entrega' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de entrega ({form.bairro})</span>
                  <span className="font-mono-price">R$ {taxaEntrega.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-base pt-1 border-t border-gold/15">
                <span className="font-semibold">Total</span>
                <span className="font-mono-price font-bold text-wine text-lg">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep('cart')} className="grid place-items-center w-12 rounded-full border border-gold/30 hover:bg-gold/15">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={finalizar}
                  disabled={enviando}
                  className="flex-1 bg-wine text-cream font-semibold py-3.5 rounded-full hover:bg-accent transition-colors disabled:opacity-50 shadow-md"
                >
                  {enviando ? 'Enviando...' : `Confirmar · R$ ${total.toFixed(2).replace('.', ',')}`}
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}