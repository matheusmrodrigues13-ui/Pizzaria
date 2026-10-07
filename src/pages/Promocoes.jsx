import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag, Percent } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PizzaCard from '@/components/PizzaCard';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import { useCart } from '@/lib/CartContext';

const CATEGORIA_LABEL = {
  bebida: 'Bebida',
  sobremesa: 'Sobremesa',
  complemento: 'Complemento',
};

export default function Promocoes() {
  const [produtos, setProdutos] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customizing, setCustomizing] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const [prods, pr] = await Promise.all([
          base44.entities.Produto.list(),
          base44.entities.Promocao.list(),
        ]);
        setProdutos(prods);
        setPromos(pr);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const promocoesAtivas = promos.filter(p => p.ativa);
  const emPromocao = produtos.filter(p => p.promocao && p.ativo !== false);
  const pizzasPromo = emPromocao.filter(p => p.categoria === 'pizza_salgada' || p.categoria === 'pizza_doce');
  const outrosPromo = emPromocao.filter(p => p.categoria !== 'pizza_salgada' && p.categoria !== 'pizza_doce');

  const pizzasSalgadas = produtos.filter(p => p.categoria === 'pizza_salgada' && p.ativo !== false);
  const complementos = produtos.filter(p => p.categoria === 'complemento' && p.ativo !== false);
  const vazio = !loading && promocoesAtivas.length === 0 && emPromocao.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 text-gold text-sm tracking-[0.2em] uppercase">
          <Tag className="w-4 h-4" /> Economize
        </span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mt-2">Promoções</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          As ofertas da casa e os combos do momento, para você aproveitar o melhor da La Tavola gastando menos.
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-56 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
      ) : vazio ? (
        <div className="text-center py-20 border border-dashed border-gold/30 rounded-2xl max-w-2xl mx-auto">
          <Percent className="w-12 h-12 text-gold/50 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-espresso">Nenhuma promoção no momento</h2>
          <p className="text-muted-foreground mt-2 text-sm">Volte em breve — novas ofertas aparecem aqui.</p>
          <Link to="/cardapio" className="inline-flex items-center gap-1 mt-5 text-wine font-medium hover:gap-2 transition-all">
            Ver o cardápio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {promocoesAtivas.length > 0 && (
            <section>
              <h2 className="font-heading text-3xl font-bold text-espresso mb-8">Ofertas da casa</h2>
              <div className="grid md:grid-cols-3 gap-5">
                {promocoesAtivas.map((p, i) => (
                  <div key={p.id} className="relative bg-wine text-cream rounded-2xl p-8 overflow-hidden shadow-xl animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gold/15" />
                    <span className="relative inline-block bg-gold text-espresso text-xs font-bold px-3 py-1 rounded-full mb-4">Oferta</span>
                    <h3 className="relative font-heading text-2xl font-bold mb-2">{p.titulo}</h3>
                    <p className="relative text-cream/80 text-sm">{p.descricao}</p>
                    <Link to="/cardapio" className="relative inline-flex items-center gap-1 mt-4 text-gold font-medium hover:gap-2 transition-all">
                      Aproveitar <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pizzasPromo.length > 0 && (
            <section>
              <h2 className="font-heading text-3xl font-bold text-espresso mb-8">Pizzas em promoção</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {pizzasPromo.map(p => (
                  <PizzaCard key={p.id} produto={p} onCustomize={setCustomizing} />
                ))}
              </div>
            </section>
          )}

          {outrosPromo.length > 0 && (
            <section>
              <h2 className="font-heading text-3xl font-bold text-espresso mb-8">Combos e itens em oferta</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {outrosPromo.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addItem({ id: p.id, nome: p.nome, tipo: p.categoria, preco_unitario: p.preco || 0, quantidade: 1 })}
                    className="bg-card rounded-xl p-5 border border-gold/15 text-left hover:shadow-md hover:-translate-y-0.5 transition-all flex justify-between items-center gap-3"
                  >
                    <div>
                      <span className="inline-block text-[10px] uppercase tracking-wide text-accent font-bold">{CATEGORIA_LABEL[p.categoria] || 'Oferta'}</span>
                      <p className="font-semibold text-espresso">{p.nome}</p>
                      {p.promocao_texto && <p className="text-xs text-accent">{p.promocao_texto}</p>}
                      <p className="font-mono-price text-wine text-sm">R$ {(p.preco || 0).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <span className="text-gold text-xl">+</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {customizing && (
        <PizzaCustomizer
          produto={customizing}
          complementos={complementos}
          outrasPizzas={pizzasSalgadas}
          onClose={() => setCustomizing(null)}
          onAdd={addItem}
        />
      )}
    </div>
  );
}