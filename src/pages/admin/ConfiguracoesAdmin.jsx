import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

const CAMPOS = [
  { key: 'endereco', label: 'Endereço completo', placeholder: 'Rua, número — bairro, cidade', full: true },
  { key: 'telefone', label: 'Telefone', placeholder: '(11) 4002-8922' },
  { key: 'whatsapp', label: 'WhatsApp (DDI + DDD + número)', placeholder: '5511988776655' },
  { key: 'horario', label: 'Horário de funcionamento', placeholder: 'Ter–Dom · 18h às 23h30', full: true },
  { key: 'instagram', label: 'Instagram (URL ou @perfil)', placeholder: '@latavola.pizzaria' },
  { key: 'facebook', label: 'Facebook (URL)', placeholder: 'https://facebook.com/...' },
];

export default function ConfiguracoesAdmin() {
  const { toast } = useToast();
  const [id, setId] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const lista = await base44.entities.Configuracao.list('-updated_date', 1);
        if (lista[0]) {
          setId(lista[0].id);
          setForm(lista[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const salvar = async () => {
    setSalvando(true);
    try {
      const dados = {};
      CAMPOS.forEach(c => { dados[c.key] = form[c.key] || ''; });
      if (id) {
        await base44.entities.Configuracao.update(id, dados);
      } else {
        const criada = await base44.entities.Configuracao.create(dados);
        setId(criada.id);
      }
      toast({ title: 'Configurações salvas' });
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Esses dados aparecem na página de Contato e nos links do site.
        </p>
      </div>

      {loading ? (
        <div className="h-72 rounded-2xl bg-secondary animate-pulse" />
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {CAMPOS.map(c => (
              <div key={c.key} className={c.full ? 'sm:col-span-2' : ''}>
                <label className="text-xs font-semibold text-espresso">{c.label}</label>
                <input
                  value={form[c.key] || ''}
                  onChange={e => set(c.key, e.target.value)}
                  placeholder={c.placeholder}
                  className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-wine"
                />
              </div>
            ))}
          </div>

          <button
            onClick={salvar}
            disabled={salvando}
            className="inline-flex items-center gap-2 bg-wine text-cream font-semibold px-6 py-3 rounded-full hover:bg-accent transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}
    </div>
  );
}