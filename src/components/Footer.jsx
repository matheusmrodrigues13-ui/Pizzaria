import React from 'react';
import { Link } from 'react-router-dom';
import { Pizza, MapPin, Phone, Clock, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/80 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-wine text-cream">
              <Pizza className="w-5 h-5" />
            </span>
            <span className="font-heading text-2xl font-bold text-cream">La Tavola</span>
          </div>
          <p className="text-sm leading-relaxed text-cream/60">
            Forno a lenha, massa de fermentação natural e ingredientes selecionados.
            A mesa da sua família, desde 1987.
          </p>
        </div>

        <div>
          <h4 className="font-heading text-lg text-gold mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/cardapio" className="hover:text-gold transition-colors">Cardápio</Link></li>
            <li><Link to="/promocoes" className="hover:text-gold transition-colors">Promoções</Link></li>
            <li><Link to="/reserva" className="hover:text-gold transition-colors">Reservar Mesa</Link></li>
            <li><Link to="/acompanhamento" className="hover:text-gold transition-colors">Acompanhar Pedido</Link></li>
            <li><Link to="/perfil" className="hover:text-gold transition-colors">Meu Perfil</Link></li>
            <li><Link to="/contato" className="hover:text-gold transition-colors">Contato</Link></li>
            <li><Link to="/admin" className="hover:text-gold transition-colors">Área do Administrador</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-lg text-gold mb-4">Contato</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" /><span>Rua das Oliveiras, 142 — Bairro Bela Vista</span></li>
            <li className="flex gap-3"><Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" /><span>(11) 4002-8922</span></li>
            <li className="flex gap-3"><Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" /><span>Ter–Dom · 18h às 23h30</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading text-lg text-gold mb-4">Siga-nos</h4>
          <div className="flex gap-3">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="grid place-items-center w-11 h-11 rounded-full bg-cream/10 hover:bg-gold hover:text-espresso transition-colors" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://wa.me/551140028922" target="_blank" rel="noreferrer" className="grid place-items-center w-11 h-11 rounded-full bg-cream/10 hover:bg-gold hover:text-espresso transition-colors" aria-label="WhatsApp">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-cream/40 mt-4">@latavola.pizzaria · (11) 98877-6655</p>
        </div>
      </div>
      <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Pizzaria La Tavola · Feito com massa de fermentação natural.
      </div>
    </footer>
  );
}