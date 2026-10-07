import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Power, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Image } from '@/components/ui/image';

const CATEGORIAS = {
  pizza_salgada: 'Pizza salgada',
  pizza_doce: 'Pizza doce',
  bebida: 'Bebida',
  sobremesa: 'Sobremesa',
  complemento: 'Complemento',
};
const EH_PIZZA = (c) => c === 'pizza_salgada' || c === 'pizza_doce';

const VAZIO = {
  nome: '', descricao: '', ingredientes: '', categoria: 'pizza_salgada',
  imagem: '', preco_pequena: 35, preco_media: 45, preco_grande: 55, preco: 7,
  ativo: true, popular: false, promocao: false, promocao_texto: '',
};

export default function ProdutosAdmin() {
  const { toast } = useToast();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('all');
  const [modal, setModal] = useState(null); // null | {modo: 'novo'|'editar', dados}
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    try {
      const p = await base44.entities.Produto.list();
      setProdutos(p);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const abrirNovo = () => setModal({ modo: 'novo', dados: { ...VAZIO } });
  const abrirEditar = (p) => setModal({ modo: 'editar', dados: { ...p } });

  const salvar = async () => {
    const d = modal.dados;
    if (!d.nome.trim()) { toast({ title: 'Nome é obrigatório', variant: 'destructive' }); return; }
    setSalvando(true);
    try {
      const payload = {
        nome: d.nome, descricao: d.descricao, ingredientes: d.ingredientes,
        categoria: d.categoria, imagem: d.imagem,
        ativo: d.ativo, popular: d.popular, promocao: d.promocao, promocao_texto: d.promocao_texto,
      };
      if (EH_PIZZA(d.categoria)) {
        payload.preco_pequena = Number(d.preco_pequena) || 0;
        payload.preco_media = Number(d.preco_media) || 0;
        payload.preco_grande = Number(d.preco_grande) || 0;
      } else {
        payload.preco = Number(d.preco) || 0;
      }
      if (modal.modo === 'novo') {
        await base44.entities.Produto.create(payload);
        toast({ title: 'Produto adicionado' });
      } else {
        await base44.entities.Produto.update(d.id, payload);
        toast({ title: 'Produto atualizado' });
      }
      setModal(null);
      await carregar();
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (p) => {
    if (!confirm(`Excluir "${p.nome}"?`)) return;
    try {
      await base44.entities.Produto.delete(p.id);
      setProdutos(prev => prev.filter(x => x.id !== p.id));
      toast({ title: 'Produto excluído' });
    } catch (e) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const toggleAtivo = async (p) => {
    const novo = p.ativo === false;
    try {
      await base44.entities.Produto.update(p.id, { ativo: novo });
      setProdutos(prev => prev.map(x => x.id === p.id ? { ...x, ativo: novo } : x));
    } catch (e) {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const set = (k, v) => setModal(m => ({ ...m, dados: { ...m.dados, [k]: v } }));

  const filtrados = filtro === 'all' ? produtos : produtos.filter(p => p.categoria === filtro);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Cardápio</h1>
          <p className="text-muted-foreground text-sm">{produtos.length} produtos cadastrados.</p>
        </div>
        <button onClick={abrirNovo} className="flex items-center gap-2 bg-wine text-cream font-semibold px-5 py-2.5 rounded-full hover:bg-accent transition-colors shadow-md">
          <Plus className="w-5 h-5" /> Novo produto
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin mb-4 pb-1">
        <button onClick={() => setFiltro('all')} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filtro === 'all' ? 'bg-wine text-cream' : 'bg-secondary'}`}>Todos</button>
        {Object.entries(CATEGORIAS).map(([k, l]) => (
          <button key={k} onClick={() => setFiltro(k)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filtro === k ? 'bg-wine text-cream' : 'bg-secondary'}`}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-secondary animate-pulse" />)}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(p => (
            <div key={p.id} className={`bg-card rounded-2xl border border-border shadow-sm p-4 ${p.ativo === false ? 'opacity-50' : ''}`}>
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary shrink-0">
                  {p.imagem ? <Image src={p.imagem} alt={p.nome} className="w-full h-full" fittingType="fill" /> : <div className="w-full h-full grid place-items-center text-gold/30 text-xs">sem img</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">{CATEGORIAS[p.categoria]}</p>
                  <p className="font-mono-price text-sm text-wine font-semibold mt-0.5">
                    {EH_PIZZA(p.categoria)
                      ? `R$ ${(p.preco_media || 0).toFixed(2).replace('.', ',')}+`
                      : `R$ ${(p.preco || 0).toFixed(2).replace('.', ',')}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => abrirEditar(p)} className="flex-1 flex items-center justify-center gap-1 text-sm py-1.5 rounded-lg bg-secondary hover:bg-gold/20 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => toggleAtivo(p)} className={`grid place-items-center w-9 rounded-lg ${p.ativo === false ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'}`} title={p.ativo === false ? 'Ativar' : 'Desativar'}>
                  <Power className="w-4 h-4" />
                </button>
                <button onClick={() => excluir(p)} className="grid place-items-center w-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulário */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-espresso/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-cream rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto scrollbar-thin shadow-2xl animate-fade-up">
            <div className="sticky top-0 bg-cream/95 backdrop-blur px-6 py-4 border-b border-gold/20 flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-wine">{modal.modo === 'novo' ? 'Novo produto' : 'Editar produto'}</h2>
              <button onClick={() => setModal(null)} className="grid place-items-center w-9 h-9 rounded-full hover:bg-gold/15"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-espresso">Nome*</label>
                <input value={modal.dados.nome} onChange={e => set('nome', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso">Categoria</label>
                <select value={modal.dados.categoria} onChange={e => set('categoria', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine">
                  {Object.entries(CATEGORIAS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso">Descrição</label>
                <textarea value={modal.dados.descricao} onChange={e => set('descricao', e.target.value)} rows={2} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso">Ingredientes</label>
                <input value={modal.dados.ingredientes} onChange={e => set('ingredientes', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="Ex: molho, mozzarella, calabresa, cebola" />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso">URL da imagem</label>
                <input value={modal.dados.imagem} onChange={e => set('imagem', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="https://..." />
              </div>

              {EH_PIZZA(modal.dados.categoria) ? (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-espresso">P (R$)</label>
                    <input type="number" value={modal.dados.preco_pequena} onChange={e => set('preco_pequena', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-2 py-2 text-sm focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-espresso">M (R$)</label>
                    <input type="number" value={modal.dados.preco_media} onChange={e => set('preco_media', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-2 py-2 text-sm focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-espresso">G (R$)</label>
                    <input type="number" value={modal.dados.preco_grande} onChange={e => set('preco_grande', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-2 py-2 text-sm focus:outline-none focus:border-wine" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-espresso">Preço (R$)</label>
                  <input type="number" value={modal.dados.preco} onChange={e => set('preco', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-2 py-2 text-sm focus:outline-none focus:border-wine" />
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={modal.dados.popular} onChange={e => set('popular', e.target.checked)} className="accent-wine w-4 h-4" /> Popular
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={modal.dados.promocao} onChange={e => set('promocao', e.target.checked)} className="accent-wine w-4 h-4" /> Em promoção
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={modal.dados.ativo} onChange={e => set('ativo', e.target.checked)} className="accent-wine w-4 h-4" /> Ativo
                </label>
              </div>
              {modal.dados.promocao && (
                <div>
                  <label className="text-xs font-semibold text-espresso">Texto da promoção</label>
                  <input value={modal.dados.promocao_texto} onChange={e => set('promocao_texto', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-card px-3 py-2 text-sm focus:outline-none focus:border-wine" placeholder="Ex: 2 grandes + refri por R$ 99" />
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-cream/95 backdrop-blur border-t border-gold/20 px-6 py-4 flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border border-gold/30 py-3 rounded-full font-medium hover:bg-gold/10">Cancelar</button>
              <button onClick={salvar} disabled={salvando} className="flex-1 bg-wine text-cream font-semibold py-3 rounded-full hover:bg-accent transition-colors disabled:opacity-50">
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}