import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, Users, CheckCircle2, Armchair } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

const HORARIOS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'];

const STATUS_STYLE = {
  disponivel: { bg: 'bg-green-100 border-green-400 text-green-800', label: 'Disponível', dot: 'bg-green-500' },
  reservada: { bg: 'bg-amber-100 border-amber-400 text-amber-800', label: 'Reservada', dot: 'bg-amber-500' },
  ocupada: { bg: 'bg-red-100 border-red-400 text-red-800', label: 'Ocupada', dot: 'bg-red-500' },
  limpeza: { bg: 'bg-blue-100 border-blue-400 text-blue-800', label: 'Em limpeza', dot: 'bg-blue-500' },
};

export default function Reserva() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [feito, setFeito] = useState(null);

  const [form, setForm] = useState({
    data: '', horario: '19:00', pessoas: 2, mesa_numero: null,
    cliente_nome: '', cliente_telefone: '',
  });

  const carregar = async () => {
    try {
      const [m, r] = await Promise.all([
        base44.entities.Mesa.list(),
        base44.entities.Reserva.list(),
      ]);
      setMesas(m);
      setReservas(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    if (isAuthenticated && user?.full_name) {
      setForm(f => (f.cliente_nome ? f : { ...f, cliente_nome: user.full_name }));
    }
  }, [isAuthenticated, user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Verifica se a mesa está reservada para a data+horário escolhidos
  const mesaBloqueada = (mesaNum) => {
    return reservas.some(r =>
      r.mesa_numero === mesaNum &&
      r.data === form.data &&
      r.horario === form.horario &&
      r.status !== 'cancelada'
    );
  };

  const selecionarMesa = (mesa) => {
    if (mesa.status === 'ocupada' || mesa.status === 'limpeza') return;
    if (mesaBloqueada(mesa.numero)) return;
    if (mesa.capacidade < form.pessoas) {
      toast({ title: 'Mesa pequena demais', description: `Essa mesa comporta ${mesa.capacidade} pessoas.`, variant: 'destructive' });
      return;
    }
    set('mesa_numero', mesa.numero);
  };

  const submit = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?returnTo=${encodeURIComponent('/reserva')}`;
      return;
    }
    if (!form.data || !form.horario || !form.cliente_nome.trim() || !form.cliente_telefone.trim()) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    if (!form.mesa_numero) {
      toast({ title: 'Escolha uma mesa disponível', variant: 'destructive' });
      return;
    }
    setEnviando(true);
    try {
      // checagem dupla no banco
      const conflitos = await base44.entities.Reserva.filter({
        mesa_numero: form.mesa_numero,
        data: form.data,
        horario: form.horario,
      });
      const ativos = conflitos.filter(r => r.status !== 'cancelada');
      if (ativos.length > 0) {
        toast({ title: 'Mesa já reservada nesse horário', variant: 'destructive' });
        setEnviando(false);
        return;
      }

      const reserva = await base44.entities.Reserva.create({
        data: form.data,
        horario: form.horario,
        pessoas: Number(form.pessoas),
        mesa_numero: form.mesa_numero,
        cliente_nome: form.cliente_nome,
        cliente_telefone: form.cliente_telefone,
        status: 'pendente',
      });

      // Atualiza mesa para reservada
      const mesa = mesas.find(m => m.numero === form.mesa_numero);
      if (mesa) {
        await base44.entities.Mesa.update(mesa.id, { status: 'reservada' });
      }

      setFeito(reserva);
      await carregar();
    } catch (e) {
      toast({ title: 'Erro ao reservar', description: e.message, variant: 'destructive' });
    } finally {
      setEnviando(false);
    }
  };

  if (feito) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <CheckCircle2 className="w-20 h-20 text-gold mx-auto mb-4" />
        <h1 className="font-heading text-3xl font-bold text-wine">Reserva solicitada!</h1>
        <p className="text-muted-foreground mt-2">Mesa {feito.mesa_numero} · {new Date(feito.data + 'T00:00').toLocaleDateString('pt-BR')} às {feito.horario}</p>
        <div className="bg-card rounded-2xl border border-gold/15 p-6 mt-6 text-left space-y-2 text-sm">
          <p><strong>Cliente:</strong> {feito.cliente_nome}</p>
          <p><strong>Pessoas:</strong> {feito.pessoas}</p>
          <p><strong>Telefone:</strong> {feito.cliente_telefone}</p>
          <p><strong>Status:</strong> Pendente de confirmação</p>
        </div>
        <button onClick={() => { setFeito(null); setForm({ data: '', horario: '19:00', pessoas: 2, mesa_numero: null, cliente_nome: '', cliente_telefone: '' }); }}
          className="mt-6 bg-wine text-cream font-semibold px-6 py-3 rounded-full hover:bg-accent transition-colors">
          Nova reserva
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <span className="text-gold text-sm tracking-[0.2em] uppercase">Reservas</span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-espresso mt-2">Reserve sua mesa</h1>
        <p className="text-muted-foreground mt-3">Escolha data, horário e a mesa que preferir.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="bg-card rounded-2xl border border-gold/15 shadow-sm p-6 space-y-5">
          <h2 className="font-heading text-xl font-bold text-espresso">Dados da reserva</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-espresso flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Data</label>
              <input type="date" value={form.data} min={new Date().toISOString().split('T')[0]} onChange={e => set('data', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" />
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Horário</label>
              <select value={form.horario} onChange={e => set('horario', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine">
                {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-espresso flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Número de pessoas</label>
            <input type="number" min={1} max={12} value={form.pessoas} onChange={e => set('pessoas', Number(e.target.value))} className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-espresso">Nome</label>
              <input value={form.cliente_nome} onChange={e => set('cliente_nome', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" placeholder="Seu nome" />
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso">Telefone</label>
              <input value={form.cliente_telefone} onChange={e => set('cliente_telefone', e.target.value)} className="w-full mt-1 rounded-lg border border-gold/30 bg-cream px-3 py-2.5 text-sm focus:outline-none focus:border-wine" placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg">
            <p className="font-semibold text-espresso mb-1">Legenda das mesas:</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(STATUS_STYLE).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full ${v.dot}`} />{v.label}</span>
              ))}
            </div>
          </div>

          <button onClick={submit} disabled={enviando || !form.data}
            className="w-full bg-wine text-cream font-semibold py-3.5 rounded-full hover:bg-accent transition-colors disabled:opacity-50 shadow-md">
            {enviando ? 'Reservando...' : (isAuthenticated ? 'Confirmar reserva' : 'Entrar para reservar')}
          </button>
          {!isAuthenticated && (
            <p className="text-xs text-center text-muted-foreground">Você precisa entrar na sua conta para reservar uma mesa.</p>
          )}
        </div>

        {/* Mapa de mesas */}
        <div className="bg-card rounded-2xl border border-gold/15 shadow-sm p-6">
          <h2 className="font-heading text-xl font-bold text-espresso mb-1">Escolha a mesa</h2>
          <p className="text-xs text-muted-foreground mb-5">Capacidade compatível com {form.pessoas} pessoa(s).</p>
          {loading ? (
            <div className="grid grid-cols-3 gap-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {mesas.map(m => {
                const bloqueada = form.data && mesaBloqueada(m.numero);
                const sel = form.mesa_numero === m.numero;
                const indisponivel = m.status === 'ocupada' || m.status === 'limpeza' || bloqueada;
                const capacidadeOk = m.capacidade >= form.pessoas;
                const style = STATUS_STYLE[m.status];
                return (
                  <button
                    key={m.id}
                    onClick={() => selecionarMesa(m)}
                    disabled={indisponivel || !capacidadeOk || !form.data}
                    className={`relative rounded-xl border-2 p-4 text-center transition-all ${sel ? 'border-wine ring-2 ring-wine/30 scale-105' : 'border-current'} ${style.bg} ${indisponivel || !capacidadeOk ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    <Armchair className="w-6 h-6 mx-auto mb-1" />
                    <p className="font-semibold text-sm">Mesa {m.numero}</p>
                    <p className="text-[11px] opacity-80">{m.capacidade} lug.</p>
                    {bloqueada && form.data && <p className="text-[10px] mt-1 font-semibold">Reservada</p>}
                  </button>
                );
              })}
            </div>
          )}
          {form.mesa_numero && (
            <p className="mt-4 text-sm text-center bg-wine/10 text-wine font-medium py-2 rounded-lg">
              ✓ Mesa {form.mesa_numero} selecionada
            </p>
          )}
        </div>
      </div>
    </div>
  );
}