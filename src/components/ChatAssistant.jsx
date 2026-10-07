import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// Assistente de navegação com respostas pré-programadas (não é IA avançada)
const RESPOSTAS = [
  {
    keys: ['reserv', 'mesa'],
    resposta: 'Você pode fazer sua reserva acessendo a área "Reservar Mesa" no menu. Escolha data, horário e a mesa disponível que preferir! 🍽️'
  },
  {
    keys: ['doce', 'doces', 'chocolate', 'prestígio', 'prestigio', 'banana', 'romeu', 'nutella'],
    resposta: 'Nossas pizzas doces: Chocolate, Chocolate com Morango, Banana com Canela, Prestígio, Nutella com Morango e Romeu e Julieta. 🍫'
  },
  {
    keys: ['salgada', 'salgadas', 'calabresa', 'margherita', 'frango', 'queijos', 'pepperoni'],
    resposta: 'Temos Calabresa, Margherita, Portuguesa, Frango com Catupiry, Quatro Queijos, Bacon, Pepperoni e muitas outras! Confira no Cardápio. 🍕'
  },
  {
    keys: ['duas pessoa', '2 pessoa', 'dois', 'casal', 'tamanho', 'qual pizza'],
    resposta: 'Para duas pessoas, uma pizza média costuma ser uma boa opção! Sugerimos Calabresa, Margherita, Frango com Catupiry ou Quatro Queijos. 😊'
  },
  {
    keys: ['bebida', 'refrigerante', 'coca', 'guaraná', 'guarana', 'suco', 'água', 'agua'],
    resposta: 'Temos Coca-Cola, Coca Zero, Guaraná, Fanta, Sprite, água e sucos. Veja tudo na seção Bebidas do cardápio! 🥤'
  },
  {
    keys: ['sobremesa', 'sobremesas', 'pudim', 'brownie', 'sorvete'],
    resposta: 'Sobremesas: Pudim, Brownie, Sorvete, Petit Gateau, Mousse e pizza doce. 🍨'
  },
  {
    keys: ['entrega', 'delivery', 'receber', 'endereço', 'endereco', 'tempo'],
    resposta: 'Fazemos entrega! Escolha "Receber em casa" no carrinho e informe seu endereço. O tempo médio é de 40 a 60 minutos. 🛵'
  },
  {
    keys: ['pagamento', 'pagar', 'pix', 'cartão', 'cartao', 'dinheiro'],
    resposta: 'Aceitamos Dinheiro, Pix, Cartão de crédito e Cartão de débito (pagamento simulado). 💳'
  },
  {
    keys: ['acompanhar', 'status', 'pedido', 'rastrear', 'onde'],
    resposta: 'Para acompanhar seu pedido, acesse "Meu Pedido" no menu e digite o número do seu pedido. 📦'
  },
  {
    keys: ['horário', 'horario', 'aberto', 'funcionamento', 'hora'],
    resposta: 'Funcionamos de Terça a Domingo, das 18h às 23h30. 🕒'
  },
  {
    keys: ['preço', 'preco', 'valor', 'quanto', 'custa'],
    resposta: 'Os preços variam por tamanho: Pequena a partir de R$ 35, Média R$ 45 e Grande R$ 55. Confira os valores exatos no cardápio! 💰'
  },
];

const FALLBACK = 'Posso te ajudar com o cardápio, reservas, entrega e acompanhamento de pedidos. Tente perguntar sobre pizzas, bebidas, sobremesas ou reservas! 😊';

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Olá! Bem-vindo à La Tavola 🍕. Como posso ajudar você a navegar hoje?' }
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const responder = (texto) => {
    const lower = texto.toLowerCase();
    const match = RESPOSTAS.find(r => r.keys.some(k => lower.includes(k)));
    return match ? match.resposta : FALLBACK;
  };

  const enviar = () => {
    if (!input.trim()) return;
    const pergunta = input;
    setMessages(m => [...m, { from: 'user', text: pergunta }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => [...m, { from: 'bot', text: responder(pergunta) }]);
    }, 400);
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-40 grid place-items-center w-14 h-14 rounded-full bg-wine text-cream shadow-xl hover:bg-accent transition-colors"
        aria-label="Assistente virtual"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-80 h-96 bg-cream rounded-2xl shadow-2xl border border-gold/25 flex flex-col overflow-hidden animate-fade-up">
          <div className="bg-wine text-cream px-4 py-3 flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded-full bg-cream/15">🍕</span>
            <div>
              <p className="font-heading font-semibold leading-none">Assistente La Tavola</p>
              <p className="text-[11px] text-cream/70">Ajuda rápida para navegar</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2 bg-cream">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.from === 'user' ? 'bg-wine text-cream rounded-br-sm' : 'bg-secondary text-espresso rounded-bl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t border-gold/20 flex gap-2 bg-cream">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviar()}
              placeholder="Digite sua dúvida..."
              className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <button onClick={enviar} className="grid place-items-center w-10 h-10 rounded-full bg-wine text-cream hover:bg-accent transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}