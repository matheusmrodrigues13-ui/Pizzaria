import React, { useState, useMemo } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import { Image } from '@/components/ui/image';

const BORDAS = [
  { id: 'nenhuma', nome: 'Sem borda recheada', preco: 0 },
  { id: 'catupiry', nome: 'Borda de Catupiry', preco: 8 },
  { id: 'cheddar', nome: 'Borda de Cheddar', preco: 8 },
  { id: 'chocolate', nome: 'Borda de Chocolate', preco: 9 },
];

const TAMANHOS = [
  { id: 'pequena', label: 'Pequena', campo: 'preco_pequena', mult: 1 },
  { id: 'media', label: 'Média', campo: 'preco_media', mult: 1 },
  { id: 'grande', label: 'Grande', campo: 'preco_grande', mult: 1 },
];

export default function PizzaCustomizer({ produto, complementos, outrasPizzas, onClose, onAdd }) {
  const [tamanho, setTamanho] = useState('media');
  const [quantidade, setQuantidade] = useState(1);
  const [borda, setBorda] = useState('nenhuma');
  const [meioMeio, setMeioMeio] = useState(false);
  const [sabor2, setSabor2] = useState(null);
  const [adicionais, setAdicionais] = useState([]);
  const [remocoes, setRemocoes] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const precoBase = useMemo(() => {
    const t = TAMANHOS.find(t => t.id === tamanho);
    const p1 = produto[t.campo] || produto.preco_media || 0;
    if (meioMeio && sabor2) {
      const p2 = sabor2[t.campo] || sabor2.preco_media || 0;
      return Math.max(p1, p2); // regra comum: maior preço dos dois sabores
    }
    return p1;
  }, [tamanho, meioMeio, sabor2, produto]);

  const adicionaisSelecionados = useMemo(
    () => complementos.filter(c => adicionais.includes(c.id)),
    [adicionais, complementos]
  );

  const precoAdicionais = adicionaisSelecionados.reduce((s, a) => s + (a.preco || 0), 0);
  const precoBorda = BORDAS.find(b => b.id === borda)?.preco || 0;
  const precoUnitario = precoBase + precoAdicionais + precoBorda;
  const precoTotal = precoUnitario * quantidade;

  const toggleAdicional = (id) => {
    setAdicionais(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    const t = TAMANHOS.find(t => t.id === tamanho);
    const nomeCompleto = meioMeio && sabor2
      ? `${produto.nome} / ${sabor2.nome} (meio a meio)`
      : produto.nome;
    onAdd({
      id: produto.id,
      nome: nomeCompleto,
      tipo: 'pizza',
      tamanho: t.label,
      borda: BORDAS.find(b => b.id === borda)?.nome || null,
      meio_a_meio: meioMeio,
      sabor1_id: produto.id,
      sabor2_id: sabor2?.id || null,
      adicionais: adicionaisSelecionados.map(a => ({ id: a.id, nome: a.nome, preco: a.preco })),
      remocoes: remocoes ? remocoes.split(',').map(r => r.trim()).filter(Boolean) : [],
      observacoes,
      quantidade,
      preco_unitario: precoUnitario,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-espresso/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-cream rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-thin shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="sticky top-0 bg-cream/95 backdrop-blur px-6 py-4 border-b border-gold/20 flex items-center justify-between z-10">
          <div>
            <h2 className="font-heading text-2xl font-bold text-wine">{produto.nome}</h2>
            <p className="text-sm text-muted-foreground">{produto.descricao}</p>
          </div>
          <button onClick={onClose} className="grid place-items-center w-10 h-10 rounded-full hover:bg-gold/15 text-espresso">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tamanho */}
          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">Tamanho</label>
            <div className="grid grid-cols-3 gap-2">
              {TAMANHOS.map(t => {
                const preco = produto[t.campo];
                const active = tamanho === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTamanho(t.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${active ? 'border-wine bg-wine text-cream' : 'border-gold/25 hover:border-gold'}`}
                  >
                    <span className="block text-sm font-semibold">{t.label}</span>
                    <span className="block text-xs font-mono-price mt-0.5">
                      {preco ? `R$ ${preco.toFixed(2).replace('.', ',')}` : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meio a meio */}
          <div className="bg-gold/10 rounded-xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-semibold text-espresso">Meio a meio (2 sabores)</span>
              <button
                onClick={() => setMeioMeio(m => !m)}
                className={`relative w-12 h-6 rounded-full transition-colors ${meioMeio ? 'bg-wine' : 'bg-espresso/20'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-cream shadow transition-transform ${meioMeio ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </label>
            {meioMeio && (
              <select
                value={sabor2?.id || ''}
                onChange={e => setSabor2(outrasPizzas.find(p => p.id === e.target.value) || null)}
                className="mt-3 w-full rounded-lg border border-gold/30 bg-cream px-3 py-2 text-sm focus:outline-none focus:border-wine"
              >
                <option value="">Escolha o segundo sabor</option>
                {outrasPizzas.filter(p => p.id !== produto.id).map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            )}
          </div>

          {/* Borda */}
          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">Borda recheada</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {BORDAS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setBorda(b.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${borda === b.id ? 'border-wine bg-wine/5' : 'border-gold/25 hover:border-gold'}`}
                >
                  <span className="text-sm">{b.nome}</span>
                  <span className="text-xs font-mono-price text-muted-foreground">
                    {b.preco > 0 ? `+R$ ${b.preco.toFixed(2).replace('.', ',')}` : 'Grátis'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Adicionais */}
          {complementos.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-espresso mb-2">Adicionais</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {complementos.map(c => {
                  const sel = adicionais.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleAdicional(c.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${sel ? 'border-wine bg-wine/5' : 'border-gold/25 hover:border-gold'}`}
                    >
                      <span className="flex items-center gap-2 text-sm">
                        {sel && <Check className="w-4 h-4 text-wine" />}
                        {c.nome}
                      </span>
                      <span className="text-xs font-mono-price text-muted-foreground">
                        +R$ {(c.preco || 0).toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remover ingredientes */}
          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">Remover ingredientes (separe por vírgula)</label>
            <input
              type="text"
              value={remocoes}
              onChange={e => setRemocoes(e.target.value)}
              placeholder="Ex: cebola, azeitona"
              className="w-full rounded-lg border border-gold/30 bg-cream px-3 py-2 text-sm focus:outline-none focus:border-wine"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-espresso mb-2">Observações</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              rows={2}
              placeholder="Ex: caprichar no orégano, assar bem crocante..."
              className="w-full rounded-lg border border-gold/30 bg-cream px-3 py-2 text-sm focus:outline-none focus:border-wine resize-none"
            />
          </div>

          {/* Quantidade */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-espresso">Quantidade</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantidade(q => Math.max(1, q - 1))} className="grid place-items-center w-9 h-9 rounded-full border border-gold/30 hover:bg-gold/15">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono-price text-lg w-8 text-center">{quantidade}</span>
              <button onClick={() => setQuantidade(q => q + 1)} className="grid place-items-center w-9 h-9 rounded-full border border-gold/30 hover:bg-gold/15">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-cream/95 backdrop-blur border-t border-gold/20 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">Total</span>
            <span className="font-mono-price text-2xl font-bold text-wine">
              R$ {precoTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={meioMeio && !sabor2}
            className="flex-1 sm:flex-none bg-wine text-cream font-semibold px-8 py-3.5 rounded-full hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}