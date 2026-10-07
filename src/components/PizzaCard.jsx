import React from 'react';
import { Plus } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function PizzaCard({ produto, onCustomize }) {
  const precoMin = Math.min(
    ...[produto.preco_pequena, produto.preco_media, produto.preco_grande].filter(p => p != null && p > 0)
  );

  return (
    <article
      className="group bg-card rounded-2xl overflow-hidden border border-gold/15 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {produto.imagem ? (
          <Image src={produto.imagem} alt={produto.nome} className="w-full h-full" fittingType="fill" />
        ) : (
          <div className="w-full h-full grid place-items-center text-gold/40 text-sm">Sem imagem</div>
        )}
        {produto.promocao && (
          <span className="absolute top-3 left-3 bg-accent text-cream text-xs font-bold px-3 py-1 rounded-full shadow">
            Promoção
          </span>
        )}
        {produto.popular && !produto.promocao && (
          <span className="absolute top-3 left-3 bg-gold text-espresso text-xs font-bold px-3 py-1 rounded-full shadow">
            Popular
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-heading text-xl font-semibold text-espresso mb-1">{produto.nome}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">{produto.descricao}</p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">A partir de</span>
            <span className="font-mono-price text-lg font-semibold text-wine">
              R$ {precoMin.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button
            onClick={() => onCustomize(produto)}
            className="grid place-items-center w-11 h-11 rounded-full bg-wine text-cream hover:bg-accent transition-colors shadow-md group-hover:scale-110"
            aria-label={`Personalizar ${produto.nome}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
}