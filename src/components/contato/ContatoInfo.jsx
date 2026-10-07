import React from 'react';
import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle, MapPinned } from 'lucide-react';
import { whatsappLink } from '@/hooks/useConfig';

export default function ContatoInfo({ config, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 rounded-2xl bg-secondary animate-pulse" />
        <div className="h-72 rounded-2xl bg-secondary animate-pulse" />
      </div>
    );
  }

  const wa = whatsappLink(config?.whatsapp, 'Olá! Gostaria de falar com a La Tavola.');
  const instagram = config?.instagram
    ? (config.instagram.startsWith('http') ? config.instagram : `https://instagram.com/${config.instagram.replace('@', '')}`)
    : null;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-gold/15 shadow-sm p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-espresso">Fale com a gente</h2>

        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="font-medium text-espresso">{config?.endereco || 'Endereço ainda não cadastrado.'}</p>
            </div>
          </li>
          <li className="flex gap-3">
            <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Telefone</p>
              <p className="font-medium text-espresso">{config?.telefone || 'Telefone ainda não cadastrado.'}</p>
            </div>
          </li>
          <li className="flex gap-3">
            <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Horário</p>
              <p className="font-medium text-espresso">{config?.horario || 'Horário ainda não cadastrado.'}</p>
            </div>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-gold/15">
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-wine text-cream text-sm font-medium hover:bg-accent transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          )}
          {instagram && (
            <a href={instagram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gold/40 text-espresso text-sm font-medium hover:bg-gold/10 transition-colors">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
          )}
          {config?.facebook && (
            <a href={config.facebook} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gold/40 text-espresso text-sm font-medium hover:bg-gold/10 transition-colors">
              <Facebook className="w-4 h-4" /> Facebook
            </a>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-gold/15 shadow-sm overflow-hidden">
        {config?.endereco ? (
          <iframe
            title="Mapa da pizzaria"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(config.endereco)}&output=embed`}
            className="w-full h-72 border-0"
            loading="lazy"
          />
        ) : (
          <div className="h-72 grid place-items-center text-center px-6">
            <div>
              <MapPinned className="w-10 h-10 text-gold/50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                O mapa aparece aqui assim que a pizzaria cadastrar o endereço no painel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}