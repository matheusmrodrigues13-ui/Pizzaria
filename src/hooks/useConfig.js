import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await base44.entities.Configuracao.list('-updated_date', 1);
        if (ativo) setConfig(lista[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, []);

  return { config, loading };
}

export function whatsappLink(numero, texto) {
  const digits = (numero || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}