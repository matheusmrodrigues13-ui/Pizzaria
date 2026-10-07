import React from 'react';
import { useConfig } from '@/hooks/useConfig';
import ContatoForm from '@/components/contato/ContatoForm';
import ContatoInfo from '@/components/contato/ContatoInfo';

export default function Contato() {
  const { config, loading } = useConfig();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <span className="text-gold text-sm tracking-[0.2em] uppercase">Atendimento</span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mt-2">Contato</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Dúvidas, sugestões ou pedidos especiais? Fale com a gente — respondemos rapidinho.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <ContatoForm config={config} />
        <ContatoInfo config={config} loading={loading} />
      </div>
    </div>
  );
}