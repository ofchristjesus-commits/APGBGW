import { Ship, Anchor, Package, Scale, Receipt, Container, Users, Wallet } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import StatsCard from '../components/shared/StatsCard';
import StatusBadge from '../components/shared/StatusBadge';
import { useEntity } from '../hooks/useEntity';
import { formatarMoeda } from '../lib/portUtils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, Area } from 'recharts';

export default function Dashboard() {
  const { items: navios } = useEntity('navios');
  const { items: atracagens } = useEntity('atracagens');
  const { items: pesagens } = useEntity('pesagens');
  const { items: faturas } = useEntity('faturas');
  const { items: containers } = useEntity('containers');
  const { items: funcionarios } = useEntity('funcionarios');
  const { items: notificacoes } = useEntity('notificacoes');

  // Stats Data
  const naviosNoPorto = navios.filter(n => n.status === 'Atracado' || n.status === 'Em Operação').length;
  const atracagensAtivas = atracagens.filter(a => ['Notificado', 'Aprovado', 'Atracado', 'Em Operação'].includes(a.status)).length;
  const pesagensPendentes = pesagens.filter(p => p.status === 'Primeira Pesagem').length;
  const faturasEmitidas = faturas.length;
  const totalFaturado = faturas.reduce((acc, f) => acc + (f.status === 'Paga' ? f.valorTotal : 0), 0);
  const contNoParque = containers.filter(c => c.status === 'No Parque').length;
  const totalFunc = funcionarios.filter(f => f.status === 'Ativo').length;



  const dateFrom = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
  };

  const statusByDay = atracagens.reduce((acc, a) => {
    const day = dateFrom(a.dataPrevista || a.dataAtracagem || a.dataDesatracagem);
    if (!day) return acc;
    const status = a.status;
    if (!acc[day]) acc[day] = { day, EmEspera: 0, Atracado: 0, EmDescarga: 0, Saindo: 0, ships: [] };
    if (['Esperado', 'Notificado', 'Aprovado'].includes(status)) acc[day].EmEspera += 1;
    else if (status === 'Atracado') acc[day].Atracado += 1;
    else if (status === 'Em Operação') acc[day].EmDescarga += 1;
    else if (['Desatracado', 'Partiu'].includes(status)) acc[day].Saindo += 1;
    // collect ship details for tooltip
    acc[day].ships.push({
      id: a.id,
      navioNome: a.navioNome,
      cais: a.cais,
      status: a.status,
      portoOrigem: a.portoOrigem,
      portoDestino: a.portoDestino,
      numViagem: a.numViagem,
      dataAtracagem: a.dataAtracagem,
    });
    return acc;
  }, {});

  const dataMovimentoNavios = Object.values(statusByDay).sort((a, b) => a.day.localeCompare(b.day));

  // Custom tooltip to show ship details for the selected day
  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    const point = payload[0].payload || {};
    const ships = point.ships || [];
    return (
      <div className="p-3 rounded-lg bg-[#0f172a] text-white border border-gray-700 shadow-lg" style={{ minWidth: 220 }}>
        <div className="text-sm text-slate-300 mb-2">{`Dia: ${label}`}</div>
        <div className="flex gap-3 text-xs text-slate-200 mb-3">
          <div>Em Espera: <strong className="ml-1">{point.EmEspera || 0}</strong></div>
          <div>Atracado: <strong className="ml-1">{point.Atracado || 0}</strong></div>
          <div>Em Descarga: <strong className="ml-1">{point.EmDescarga || 0}</strong></div>
          <div>Saindo: <strong className="ml-1">{point.Saindo || 0}</strong></div>
        </div>
        <div className="text-xs text-slate-300 font-semibold mb-2">Navios</div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {ships.length === 0 && <div className="text-xs text-slate-400">Nenhum navio registado neste dia.</div>}
          {ships.map(s => (
            <div key={s.id} className="text-xs bg-[#0b1220] p-2 rounded">
              <div className="font-medium">{s.navioNome}</div>
              <div className="text-[11px] text-slate-300">{s.cais} • {s.status}</div>
              <div className="text-[11px] text-slate-400">{s.portoOrigem} → {s.portoDestino}</div>
              {s.numViagem && <div className="text-[11px] text-slate-400">Viagem: {s.numViagem}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const pesagensPorTipo = pesagens.reduce((acc, p) => {
    acc[p.tipo] = (acc[p.tipo] || 0) + 1;
    return acc;
  }, {});
  const dataBarPesagens = Object.keys(pesagensPorTipo).map(key => ({ name: key, total: pesagensPorTipo[key] }));

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Dashboard" 
        subtitulo="Visão geral das operações portuárias" 
      />

      {/* 8 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard titulo="Navios no Porto" valor={naviosNoPorto} icone={Ship} cor="blue" />
        <StatsCard titulo="Atracagens Ativas" valor={atracagensAtivas} icone={Anchor} cor="sky" />
        <StatsCard titulo="Pesagens Pendentes" valor={pesagensPendentes} icone={Scale} cor="amber" />
        <StatsCard titulo="Containers no Parque" valor={contNoParque} icone={Container} cor="emerald" />
        <StatsCard titulo="Faturas Emitidas" valor={faturasEmitidas} icone={Receipt} cor="gray" />
        <StatsCard titulo="Total Faturado (Pago)" valor={formatarMoeda(totalFaturado)} icone={Wallet} cor="green" />
        <StatsCard titulo="Funcionários Ativos" valor={totalFunc} icone={Users} cor="violet" />
      </div>

      {/* 2 Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Movimentação de Navios</h3>
              <p className="text-sm text-muted-foreground">Status por dia: em espera, atracados, em descarga e saindo.</p>
            </div>
            <div className="text-xs text-slate-400">Legend</div>
          </div>
          <div className="h-64 rounded-3xl p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataMovimentoNavios} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="navioGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e3a8a" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
                <Line type="monotone" dataKey="EmEspera" name="Em Espera" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Atracado" name="Atracado" stroke="#1e40af" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="EmDescarga" name="Em Descarga" stroke="#4338ca" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Saindo" name="Saindo" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Pesagens por Tipo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBarPesagens} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {dataBarPesagens.map((entry, index) => {
                    const lowerName = entry.name.toLowerCase();
                    const fill = lowerName.includes("20'")
                      ? 'rgba(30, 58, 138, 0.75)'
                      : lowerName.includes("40'")
                      ? 'rgba(59, 130, 246, 0.75)'
                      : '#1e3a8a';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabelas Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atracagens Recentes */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Atracagens Ativas / Recentes</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Navio</th>
                  <th>Cais</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {atracagens.slice(0, 5).map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{a.navioNome}</td>
                    <td>{a.cais}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
                {atracagens.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted-foreground">Nenhuma atracagem registada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notificações Recentes */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Últimas Notificações</h3>
          </div>
          <div className="space-y-3">
            {notificacoes.slice(0, 4).map(n => (
              <div key={n.id} className={`p-3 rounded-lg flex items-start gap-3 border ${n.lida ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}>
                <div className="mt-0.5">{n.tipo === 'Urgente' ? '🚨' : n.tipo === 'Alerta' ? '⚠️' : 'ℹ️'}</div>
                <div>
                  <p className={`text-sm ${n.lida ? 'font-medium' : 'font-semibold text-primary'}`}>{n.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{n.mensagem}</p>
                </div>
              </div>
            ))}
            {notificacoes.length === 0 && (
              <p className="text-center py-4 text-muted-foreground">Nenhuma notificação.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
