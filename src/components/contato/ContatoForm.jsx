import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { whatsappLink } from '@/hooks/useConfig';

export default function ContatoForm({ config }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
  const [erro, setErro] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const enviar = (e) => {
    e.preventDefault();
    setErro('');
    if (!form.nome.trim() || !form.mensagem.trim()) {
      setErro('Preencha seu nome e a mensagem.');
      return;
    }
    const texto = [
      '*Contato pelo site La Tavola*',
      '',
      `*Nome:* ${form.nome}`,
      form.email ? `*E-mail:* ${form.email}` : null,
      form.telefone ? `*Telefone:* ${form.telefone}` : null,
      form.assunto ? `*Assunto:* ${form.assunto}` : null,
      '',
      form.mensagem,
    ].filter(Boolean).join('\n');

    const link = whatsappLink(config?.whatsapp, texto);
    if (!link) {
      setErro('O WhatsApp da pizzaria ainda não foi configurado.');
      return;
    }
    window.open(link, '_blank', 'noopener');
  };

  return (
    <form onSubmit={enviar} className="bg-card rounded-2xl border border-gold/15 shadow-sm p-6 space-y-4">
      <h2 className="font-heading text-xl font-bold text-espresso">Envie sua mensagem</h2>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-espresso">Nome*</label>
          <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Seu nome"
            className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" />
        </div>
        <div>
          <label className="text-xs font-semibold text-espresso">Telefone</label>
          <input value={form.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 99999-9999"
            className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-espresso">E-mail</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="voce@email.com"
            className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" />
        </div>
        <div>
          <label className="text-xs font-semibold text-espresso">Assunto</label>
          <input value={form.assunto} onChange={e => set('assunto', e.target.value)} placeholder="Ex.: Reserva para 6 pessoas"
            className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-espresso">Mensagem*</label>
        <textarea rows={5} value={form.mensagem} onChange={e => set('mensagem', e.target.value)} placeholder="Como podemos ajudar?"
          className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine resize-none" />
      </div>

      {erro && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" /> {erro}
        </p>
      )}

      <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-wine text-cream font-semibold py-3.5 rounded-full hover:bg-accent transition-colors shadow-md">
        <Send className="w-4 h-4" /> Enviar pelo WhatsApp
      </button>
      <p className="text-xs text-center text-muted-foreground">
        Ao enviar, o WhatsApp abre com sua mensagem já preenchida — é só confirmar.
      </p>
    </form>
  );
}