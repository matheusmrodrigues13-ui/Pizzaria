import React, { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PizzaCard from '@/components/PizzaCard';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import { useCart } from '@/lib/CartContext';

const CATEGORIAS = [
  { id: 'pizza_salgada', label: 'Pizzas Salgadas' },
  { id: 'pizza_doce', label: 'Pizzas Doces' },
  { id: 'bebida', label: 'Bebidas' },
  { id: 'sobremesa', label: 'Sobremesas' },
  { id: 'complemento', label: 'Complementos' },
];

export default function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('all');
  const [precoMax, setPrecoMax] = useState(100);
  const [filtroPopular, setFiltroPopular] = useState(false);
  const [filtroPromo, setFiltroPromo] = useState(false);
  const [customizing, setCustomizing] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const prods = await base44.entities.Produto.list();
        setProdutos(prods);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    return produtos.filter(p => {
      if (p.ativo === false) return false;
      if (categoria !== 'all' && p.categoria !== categoria) return false;
      if (filtroPopular && !p.popular) return false;
      if (filtroPromo && !p.promocao) return false;
      if (busca.trim()) {
        const q = busca.toLowerCase();
        const texto = `${p.nome} ${p.descricao || ''} ${p.ingredientes || ''}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      const precoRef = Math.min(p.preco_pequena || p.preco || 999, p.preco_media || 999, p.preco_grande || 999);
      if (precoRef > precoMax) return false;
      return true;
    });
  }, [produtos, categoria, busca, precoMax, filtroPopular, filtroPromo]);

  const complementos = produtos.filter(p => p.categoria === 'complemento' && p.ativo !== false);
  const pizzasSalgadas = produtos.filter(p => p.categoria === 'pizza_salgada' && p.ativo !== false);

  const handleAdd = (p) => {
    if (p.categoria === 'pizza_salgada' || p.categoria === 'pizza_doce') {
      setCustomizing(p);
    } else {
      addItem({ id: p.id, nome: p.nome, tipo: p.categoria, preco_unitario: p.preco || 0, quantidade: 1 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-gold text-sm tracking-[0.2em] uppercase">Nosso cardápio</span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mt-2">Sabores da La Tavola</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Personalize sua pizza: tamanho, borda, meio a meio e adicionais.</p>
      </div>

      {/* Busca + Filtros */}
      <div className="bg-card rounded-2xl border border-gold/15 shadow-sm p-4 mb-8 sticky top-20 z-30">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar: calabresa, chocolate, refrigerante..."
              className="w-full pl-11 pr-4 py-3 rounded-full bg-secondary border border-gold/20 text-sm focus:outline-none focus:border-wine"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltroPopular(v => !v)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${filtroPopular ? 'bg-wine text-cream border-wine' : 'border-gold/25 hover:border-gold'}`}
            >
              ⭐ Mais vendidos
            </button>
            <button
              onClick={() => setFiltroPromo(v => !v)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${filtroPromo ? 'bg-wine text-cream border-wine' : 'border-gold/25 hover:border-gold'}`}
            >
              🔥 Promoções
            </button>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-full border border-gold/25">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">até</span>
              <input
                type="range" min={20} max={100} step={5}
                value={precoMax}
                onChange={e => setPrecoMax(Number(e.target.value))}
                className="w-24 accent-wine"
              />
              <span className="font-mono-price text-xs text-wine">R$ {precoMax}</span>
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-thin pb-1">
          <button
            onClick={() => setCategoria('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categoria === 'all' ? 'bg-gold text-espresso' : 'bg-secondary text-espresso hover:bg-gold/20'}`}
          >
            Tudo
          </button>
          {CATEGORIAS.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoria(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${categoria === c.id ? 'bg-gold text-espresso' : 'bg-secondary text-espresso hover:bg-gold/20'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados por categoria */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-72 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Nenhum produto encontrado com esses filtros.</p>
        </div>
      ) : categoria === 'all' ? (
        CATEGORIAS.map(cat => {
          const items = filtrados.filter(p => p.categoria === cat.id);
          if (items.length === 0) return null;
          return (
            <section key={cat.id} className="mb-12">
              <h2 className="font-heading text-2xl font-bold text-espresso mb-5 border-l-4 border-wine pl-3">{cat.label}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {items.map(p => (
                  <PizzaCard key={p.id} produto={p} onCustomize={handleAdd} />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtrados.map(p => (
            <PizzaCard key={p.id} produto={p} onCustomize={handleAdd} />
          ))}
        </div>
      )}

      {customizing && (
        <PizzaCustomizer
          produto={customizing}
          complementos={complementos}
          outrasPizzas={customizing.categoria === 'pizza_salgada' ? pizzasSalgadas : produtos.filter(p => p.categoria === customizing.categoria && p.ativo !== false)}
          onClose={() => setCustomizing(null)}
          onAdd={addItem}
        />
      )}
    </div>
  );
}