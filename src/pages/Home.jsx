import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Phone, Flame, Award, Leaf } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import PizzaCard from '@/components/PizzaCard';
import PizzaCustomizer from '@/components/PizzaCustomizer';
import { useCart } from '@/lib/CartContext';

const HERO_IMG = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80';

export default function Home() {
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

  const populares = produtos.filter(p => p.popular && p.ativo !== false).slice(0, 4);
  const bebidas = produtos.filter(p => p.categoria === 'bebida' && p.ativo !== false).slice(0, 4);
  const sobremesas = produtos.filter(p => p.categoria === 'sobremesa' && p.ativo !== false).slice(0, 4);
  const promocoesAtivas = promos.filter(p => p.ativa);

  const complementos = produtos.filter(p => p.categoria === 'complemento' && p.ativo !== false);
  const pizzasSalgadas = produtos.filter(p => p.categoria === 'pizza_salgada' && p.ativo !== false);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[88vh] min-h-[560px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Pizza La Tavola" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/55 to-espresso/80" />
        </div>
        <div className="relative z-10 max-w-3xl px-6 text-cream animate-fade-up">
          <span className="inline-flex items-center gap-2 text-gold text-sm tracking-[0.3em] uppercase mb-4">
            <Flame className="w-4 h-4" /> Forno a lenha desde 1987
          </span>
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold leading-tight text-balance">
            La Tavola
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-cream/85 max-w-xl mx-auto">
            A mesa da sua família. Massa de fermentação natural, ingredientes
            selecionados e o sabor da verdadeira tradição italiana.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/cardapio" className="bg-wine text-cream font-semibold px-7 py-3.5 rounded-full hover:bg-accent transition-all hover:scale-105 shadow-lg">
              Ver Cardápio
            </Link>
            <Link to="/cardapio" className="bg-gold text-espresso font-semibold px-7 py-3.5 rounded-full hover:bg-gold/90 transition-all hover:scale-105 shadow-lg">
              Fazer Pedido
            </Link>
            <Link to="/reserva" className="border-2 border-cream/40 text-cream font-semibold px-7 py-3.5 rounded-full hover:bg-cream/10 transition-all">
              Reservar Mesa
            </Link>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="max-w-6xl mx-auto -mt-12 relative z-20 px-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Flame, title: 'Forno a lenha', desc: 'Crosta perfeita, defumada e crocante.' },
            { icon: Leaf, title: 'Ingredientes frescos', desc: 'Manjericão, mozzarella e tomate San Marzano.' },
            { icon: Award, title: 'Tradição italiana', desc: 'Receitas de família há três gerações.' },
          ].map((f, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-lg border border-gold/15 flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="grid place-items-center w-12 h-12 rounded-full bg-wine/10 text-wine shrink-0">
                <f.icon className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-espresso">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POPULARES */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-gold text-sm tracking-[0.2em] uppercase">As queridinhas</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-espresso">Pizzas populares</h2>
          </div>
          <Link to="/cardapio" className="hidden sm:flex items-center gap-1 text-wine font-medium hover:gap-2 transition-all">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="h-72 rounded-2xl bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {populares.map(p => (
              <PizzaCard key={p.id} produto={p} onCustomize={setCustomizing} />
            ))}
          </div>
        )}
      </section>

      {/* PROMOÇÕES */}
      {promocoesAtivas.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-espresso mb-8">Promoções da casa</h2>
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

      {/* BEBIDAS + SOBREMESAS */}
      <section className="max-w-7xl mx-auto px-6 pb-20 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="font-heading text-3xl font-bold text-espresso mb-6">Bebidas</h2>
          <div className="grid grid-cols-2 gap-4">
            {bebidas.map(b => (
              <button key={b.id} onClick={() => addItem({ id: b.id, nome: b.nome, tipo: 'bebida', preco_unitario: b.preco || 0, quantidade: 1 })}
                className="bg-card rounded-xl p-4 border border-gold/15 text-left hover:shadow-md hover:-translate-y-0.5 transition-all flex justify-between items-center">
                <div>
                  <p className="font-semibold text-espresso">{b.nome}</p>
                  <p className="font-mono-price text-wine text-sm">R$ {(b.preco || 0).toFixed(2).replace('.', ',')}</p>
                </div>
                <span className="text-gold text-xl">+</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-heading text-3xl font-bold text-espresso mb-6">Sobremesas</h2>
          <div className="grid grid-cols-2 gap-4">
            {sobremesas.map(s => (
              <button key={s.id} onClick={() => addItem({ id: s.id, nome: s.nome, tipo: 'sobremesa', preco_unitario: s.preco || 0, quantidade: 1 })}
                className="bg-card rounded-xl p-4 border border-gold/15 text-left hover:shadow-md hover:-translate-y-0.5 transition-all flex justify-between items-center">
                <div>
                  <p className="font-semibold text-espresso">{s.nome}</p>
                  <p className="font-mono-price text-wine text-sm">R$ {(s.preco || 0).toFixed(2).replace('.', ',')}</p>
                </div>
                <span className="text-gold text-xl">+</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE + INFO */}
      <section className="bg-secondary/40 grain-bg">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <span className="text-gold text-sm tracking-[0.2em] uppercase">Nossa história</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-espresso mt-2 mb-6">A mesa onde todos se reúnem</h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Há mais de três décadas, a La Tavola serve pizzas feitas com massa
            de fermentação natural e ingredientes cuidadosamente selecionados.
            Cada pizza é uma homenagem à tradição italiana e ao aconchego de
            reunir a família em volta de uma boa mesa.
          </p>
        </div>
      </section>

      {/* FUNCIONAMENTO */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid sm:grid-cols-3 gap-6 text-center">
        <div className="p-6">
          <Clock className="w-8 h-8 text-wine mx-auto mb-3" />
          <h3 className="font-heading text-lg font-semibold text-espresso">Horário</h3>
          <p className="text-sm text-muted-foreground mt-1">Terça a Domingo<br />18h às 23h30</p>
        </div>
        <div className="p-6">
          <MapPin className="w-8 h-8 text-wine mx-auto mb-3" />
          <h3 className="font-heading text-lg font-semibold text-espresso">Endereço</h3>
          <p className="text-sm text-muted-foreground mt-1">Rua das Oliveiras, 142<br />Bairro Bela Vista</p>
        </div>
        <div className="p-6">
          <Phone className="w-8 h-8 text-wine mx-auto mb-3" />
          <h3 className="font-heading text-lg font-semibold text-espresso">Contato</h3>
          <p className="text-sm text-muted-foreground mt-1">(11) 4002-8922<br />(11) 98877-6655</p>
        </div>
      </section>

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