import React, { useEffect, useState, useMemo } from 'react';
import { ClipboardList, ChefHat, Package, Bike, CheckCircle2, XCircle, CalendarDays, Armchair, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { base44 } from '@/api/base44Client';

const STATUS_LABELS = {
  recebido: 'Aguardando', confirmado: 'Confirmado', preparo: 'Em preparo',
  pronto: 'Pronto', saiu_entrega: 'Saiu p/ entrega', entregue: 'Entregue', cancelado: 'Cancelado',
};

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, r, m] = await Promise.all([
          base44.entities.Pedido.list(),
          base44.entities.Reserva.list(),
          base44.entities.Mesa.list(),
        ]);
        setPedidos(p);
        setReservas(r);
        setMesas(m);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const contar = (st) => pedidos.filter(p => p.status === st).length;
    const faturamento = pedidos
      .filter(p => p.status !== 'cancelado')
      .reduce((s, p) => s + (p.total || 0), 0);
    const reservasHoje = reservas.filter(r => r.data === hoje && r.status !== 'cancelada');
    const mesasOcup = mesas.filter(m => m.status === 'ocupada').length;
    const mesasDisp = mesas.filter(m => m.status === 'disponivel').length;

    // produtos mais vendidos
    const contagem = {};
    pedidos.filter(p => p.status !== 'cancelado').forEach(p => {
      (p.itens || []).forEach(it => {
        const nome = it.nome?.split(' / ')[0] || 'Item';
        contagem[nome] = (contagem[nome] || 0) + (it.quantidade || 1);
      });
    });
    const maisVendidos = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      total: pedidos.length,
      aguardando: contar('recebido'),
      preparo: contar('preparo') + contar('confirmado'),
      pronto: contar('pronto'),
      entregue: contar('entregue') + contar('saiu_entrega'),
      cancelado: contar('cancelado'),
      faturamento,
      reservasHoje: reservasHoje.length,
      mesasOcup, mesasDisp,
      maisVendidos,
    };
  }, [pedidos, reservas, mesas]);

  const chartData = useMemo(() => {
    return Object.entries(STATUS_LABELS).map(([k, label]) => ({
      name: label,
      qtd: pedidos.filter(p => p.status === k).length,
    })).filter(d => d.qtd > 0);
  }, [pedidos]);

  const pieData = useMemo(() => [
    { name: 'Disponíveis', value: mesas.filter(m => m.status === 'disponivel').length, color: '#22c55e' },
    { name: 'Reservadas', value: mesas.filter(m => m.status === 'reservada').length, color: '#f59e0b' },
    { name: 'Ocupadas', value: mesas.filter(m => m.status === 'ocupada').length, color: '#ef4444' },
    { name: 'Limpeza', value: mesas.filter(m => m.status === 'limpeza').length, color: '#3b82f6' },
  ].filter(d => d.value > 0), [mesas]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;
  }

  const cards = [
    { label: 'Total de pedidos', value: stats.total, icon: ClipboardList, color: 'text-wine' },
    { label: 'Aguardando confirmação', value: stats.aguardando, icon: ClipboardList, color: 'text-amber-500' },
    { label: 'Em preparo', value: stats.preparo, icon: ChefHat, color: 'text-orange-500' },
    { label: 'Prontos', value: stats.pronto, icon: Package, color: 'text-blue-500' },
    { label: 'Entregues', value: stats.entregue, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Cancelados', value: stats.cancelado, icon: XCircle, color: 'text-red-500' },
    { label: 'Reservas hoje', value: stats.reservasHoje, icon: CalendarDays, color: 'text-purple-500' },
    { label: 'Mesas ocupadas', value: `${stats.mesasOcup}/${mesas.length}`, icon: Armchair, color: 'text-rose-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral da pizzaria em tempo real.</p>
      </div>

      {/* Faturamento destaque */}
      <div className="bg-gradient-to-br from-wine to-espresso text-cream rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-cream/70 text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Faturamento total</p>
            <p className="font-mono-price text-4xl font-bold mt-1">R$ {stats.faturamento.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="text-right">
            <p className="text-cream/70 text-sm flex items-center gap-2 justify-end"><TrendingUp className="w-4 h-4" /> Pedidos válidos</p>
            <p className="font-mono-price text-2xl font-semibold mt-1">{stats.total - stats.cancelado}</p>
          </div>
        </div>
      </div>

      {/* Cards de stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <c.icon className={`w-6 h-6 ${c.color} mb-2`} />
            <p className="text-2xl font-bold font-mono-price text-foreground">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold mb-4">Pedidos por status</h3>
          {chartData.length === 0 ? <p className="text-muted-foreground text-sm">Sem dados.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e0d6' }} />
                <Bar dataKey="qtd" fill="hsl(var(--wine))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold mb-4">Status das mesas</h3>
          {pieData.length === 0 ? <p className="text-muted-foreground text-sm">Sem dados.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mais vendidos */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h3 className="font-heading text-lg font-semibold mb-4">Produtos mais vendidos</h3>
        {stats.maisVendidos.length === 0 ? <p className="text-muted-foreground text-sm">Nenhum pedido registrado ainda.</p> : (
          <div className="space-y-3">
            {stats.maisVendidos.map(([nome, qtd], i) => {
              const max = stats.maisVendidos[0][1];
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{nome}</span>
                    <span className="font-mono-price text-muted-foreground">{qtd}× </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${(qtd / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}