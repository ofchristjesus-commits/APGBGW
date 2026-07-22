import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import StatsCard from '../components/shared/StatsCard';
import Modal from '../components/shared/Modal';
import ReportPrintModal from '../components/shared/ReportPrintModal';
import { useEntity } from '../hooks/useEntity';
import { formatarMoeda } from '../lib/portUtils';
import { 
  LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, 
  PieChart, Pie, Cell, CartesianGrid, BarChart, Bar
} from 'recharts';
import { Ship, Anchor, Package, Scale, Receipt, Wallet, Container, Users, Filter } from 'lucide-react';

export default function Estatisticas() {
  const { items: navios } = useEntity('navios');
  const { items: atracagens } = useEntity('atracagens');
  const { items: manifestos } = useEntity('manifestos');
  const { items: autorizacoes } = useEntity('autorizacoesCredito');
  const { items: isencoes } = useEntity('isencoes');

  const { items: pesagens } = useEntity('pesagens');
  const { items: faturas } = useEntity('faturas');
  const { items: containers } = useEntity('containers');
  const { items: funcionarios } = useEntity('funcionarios');
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtro, setFiltro] = useState({
    entidades: ['Atracagens', 'Pesagens', 'Faturas', 'Manifestos', 'Créditos', 'Isenções'],
    inicio: '',
    fim: '',
    status: '',
    termo: '',
  });
  const [resultadoFiltro, setResultadoFiltro] = useState([]);
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const [modalImpressaoAberta, setModalImpressaoAberta] = useState(false);
  const [intervaloRelatorio, setIntervaloRelatorio] = useState({ dataInicio: '', dataFim: '' });
  const [mostrarRelatorioImpressao, setMostrarRelatorioImpressao] = useState(false);

  // Stats
  const statsData = [
    { titulo: 'Navios Registados', valor: navios.length, icone: Ship, cor: 'blue' },
    { titulo: 'Total Atracagens', valor: atracagens.length, icone: Anchor, cor: 'sky' },

    { titulo: 'Tickets de Pesagem', valor: pesagens.length, icone: Scale, cor: 'amber' },
    { titulo: 'Faturas Emitidas', valor: faturas.length, icone: Receipt, cor: 'gray' },
    { titulo: 'Total Faturado', valor: formatarMoeda(faturas.reduce((a, b) => a + b.valorTotal, 0)), icone: Wallet, cor: 'green' },
    { titulo: 'Contentores', valor: containers.length, icone: Container, cor: 'emerald' },
    { titulo: 'Funcionários', valor: funcionarios.length, icone: Users, cor: 'violet' },
  ];

  // Chart: Navios por Tipo (Pie)
  const naviosTipo = navios.reduce((acc, n) => { acc[n.tipo] = (acc[n.tipo] || 0) + 1; return acc; }, {});
  const dataPieNavios = Object.keys(naviosTipo).map(key => ({ name: key, value: naviosTipo[key] }));


  // Chart: Faturação por Tipo (Bar)
  const fatTipo = faturas.reduce((acc, f) => { acc[f.tipoServico] = (acc[f.tipoServico] || 0) + f.valorTotal; return acc; }, {});
  const dataBarFaturas = Object.keys(fatTipo).map(key => ({ name: key, total: fatTipo[key] }));

  // Chart: Containers por Tipo (Bar)
  const contTipo = containers.reduce((acc, c) => { acc[c.tipo] = (acc[c.tipo] || 0) + 1; return acc; }, {});
  const dataBarCont = Object.keys(contTipo).map(key => ({ name: key, total: contTipo[key] }));

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  const entidadesDados = [
    { nome: 'Atracagens', items: atracagens, dateKeys: ['dataPrevista', 'dataAtracagem', 'dataDesatracagem'], statusKey: 'status' },
    { nome: 'Pesagens', items: pesagens, dateKeys: ['dataEntrada', 'dataSaida'], statusKey: 'status' },
    { nome: 'Faturas', items: faturas, dateKeys: ['dataEmissao', 'dataPagamento'], statusKey: 'status' },
    { nome: 'Manifestos', items: manifestos, dateKeys: ['dataHoraEmbarque', 'dataHoraDesembarque'], statusKey: 'status' },
    { nome: 'Créditos', items: autorizacoes, dateKeys: ['data'], statusKey: 'status' },
    { nome: 'Isenções', items: isencoes, dateKeys: ['data'], statusKey: 'status' },
  ];

  const formatarDataFiltro = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  const filtrarPorData = (item, dateKeys) => {
    const inicio = formatarDataFiltro(filtro.inicio);
    const fim = formatarDataFiltro(filtro.fim);
    if (!inicio && !fim) return true;
    return dateKeys.some(key => {
      const valor = item[key];
      if (!valor) return false;
      const data = new Date(valor);
      if (isNaN(data.getTime())) return false;
      if (inicio && data < inicio) return false;
      if (fim && data > fim) return false;
      return true;
    });
  };

  const filtrarPorStatus = (item, statusKey) => {
    if (!filtro.status) return true;
    const valor = item[statusKey] || item.tipoServico || item.tipo || item.modalidade || item.tipoDocumento || '';
    return String(valor).toLowerCase().includes(filtro.status.toLowerCase());
  };

  const filtrarPorTermo = (item) => {
    if (!filtro.termo) return true;
    const termo = filtro.termo.toLowerCase();
    return Object.values(item).some(value =>
      typeof value === 'string' && value.toLowerCase().includes(termo)
    );
  };

  const aplicarFiltro = () => {
    const resultado = entidadesDados
      .filter(entidade => filtro.entidades.includes(entidade.nome))
      .map(entidade => ({
        nome: entidade.nome,
        items: entidade.items.filter(item => filtrarPorData(item, entidade.dateKeys) && filtrarPorStatus(item, entidade.statusKey) && filtrarPorTermo(item)),
      }))
      .filter(entidade => entidade.items.length > 0);

    setResultadoFiltro(resultado);
    setRelatorioAberto(true);
    setFiltroAberto(false);
  };

  const toggleEntidade = (nome) => {
    setFiltro((prev) => ({
      ...prev,
      entidades: prev.entidades.includes(nome)
        ? prev.entidades.filter((ent) => ent !== nome)
        : [...prev.entidades, nome],
    }));
  };

  const limparFiltro = () => {
    setFiltro({
      entidades: ['Atracagens', 'Pesagens', 'Faturas', 'Manifestos', 'Créditos', 'Isenções'],
      inicio: '',
      fim: '',
      status: '',
      termo: '',
    });
    setResultadoFiltro([]);
    setFiltroAberto(false);
  };

  const resultadoTotal = resultadoFiltro.reduce((acc, entidade) => acc + entidade.items.length, 0);

  const dadosRelatorioFiltro = resultadoFiltro.map((entidade) => ({
    nome: entidade.nome,
    items: entidade.items,
  }));

  const handleFecharRelatorio = () => {
    setRelatorioAberto(false);
  };

  const handleImprimirRelatorio = () => {
    setMostrarRelatorioImpressao(true);
    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  const handleConfirmarImpressao = ({ dataInicio, dataFim }) => {
    setIntervaloRelatorio({ dataInicio, dataFim });
    setMostrarRelatorioImpressao(true);
    setModalImpressaoAberta(false);

    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  const dadosRelatorio = mostrarRelatorioImpressao
    ? entidadesDados
        .filter(entidade => filtro.entidades.includes(entidade.nome))
        .map(entidade => ({
          nome: entidade.nome,
          items: entidade.items.filter(item => {
            const inicio = formatarDataFiltro(intervaloRelatorio.dataInicio);
            const fim = formatarDataFiltro(intervaloRelatorio.dataFim);
            if (!inicio && !fim) return true;
            return entidade.dateKeys.some(key => {
              const valor = item[key];
              if (!valor) return false;
              const data = new Date(valor);
              if (isNaN(data.getTime())) return false;
              if (inicio && data < inicio) return false;
              if (fim && data > fim) return false;
              return true;
            });
          }),
        }))
        .filter(entidade => entidade.items.length > 0)
    : [];

  const totalRelatorio = dadosRelatorio.reduce((acc, entidade) => acc + entidade.items.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Estatísticas & Relatórios" 
        subtitulo="Métricas operacionais e indicadores de performance" 
        onPrint={() => setModalImpressaoAberta(true)}
          textoBotaoImprimir="Imprimir Relatório"
      >
        <button
          onClick={() => setFiltroAberto(true)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Filter size={18} />
          Filtro Estatístico Avançado
        </button>
      </PageHeader>

      <div className="print-content flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          {statsData.map((s, i) => (
            <StatsCard key={i} titulo={s.titulo} valor={s.valor} icone={s.icone} cor={s.cor} />
          ))}
        </div>
      </div>

      {resultadoFiltro.length > 0 && (
        <Modal aberto={relatorioAberto} onFechar={handleFecharRelatorio} titulo="Relatório de Filtro Estatístico" largura="900px">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-lg">Relatório de Filtro Estatístico</h3>
                <p className="text-sm text-muted-foreground">{resultadoTotal} registos encontrados em {resultadoFiltro.length} categorias.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button onClick={handleImprimirRelatorio} className="btn-primary">Imprimir / Salvar PDF</button>
                <button onClick={() => { setResultadoFiltro([]); setRelatorioAberto(false); }} className="btn-secondary">Fechar Relatório</button>
              </div>
            </div>

            <div className="space-y-6">
              {resultadoFiltro.map(entidade => (
                <div key={entidade.nome} className="rounded-2xl bg-slate-950 p-4 border border-slate-800">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold">{entidade.nome}</h4>
                      <p className="text-sm text-slate-400">{entidade.items.length} registos</p>
                    </div>
                    <span className="badge bg-slate-800 text-slate-200">{entidade.items.length}</span>
                  </div>
                  <div className="grid gap-3">
                    {entidade.items.map((item, index) => (
                      <div key={index} className="rounded-xl bg-slate-900 p-4 border border-slate-800">
                        <div className="font-medium text-sm text-slate-100">{item.numViagem || item.numFatura || item.numContainer || item.titulo || item.nome || item.id}</div>
                        <div className="mt-2 text-xs text-slate-400 space-y-1">
                          {Object.entries(item).slice(0, 5).map(([key, value]) => (
                            <div key={key}>{key}: {String(value)}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <div className="print-report-only hidden rounded-3xl border border-slate-200 bg-white p-6 text-slate-900">
        <h2 className="text-xl font-semibold">Relatório Estatístico</h2>
        <p className="text-sm text-slate-600 mt-1">
          Período: {intervaloRelatorio.dataInicio ? new Date(intervaloRelatorio.dataInicio).toLocaleDateString('pt-PT') : '—'} até {intervaloRelatorio.dataFim ? new Date(intervaloRelatorio.dataFim).toLocaleDateString('pt-PT') : '—'}
        </p>
        <p className="text-sm text-slate-600 mt-2">{totalRelatorio} conteúdos encontrados.</p>

        {dadosRelatorio.length === 0 ? (
          <p className="text-sm text-slate-600 mt-4">Não há conteúdos para o período selecionado.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {dadosRelatorio.map(entidade => (
              <div key={entidade.nome} className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold">{entidade.nome} ({entidade.items.length})</h3>
                <ul className="mt-2 space-y-2">
                  {entidade.items.map((item, index) => (
                    <li key={index} className="text-sm text-slate-700">
                      • {item.numViagem || item.numFatura || item.numContainer || item.titulo || item.nome || item.id}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-content">
        {/* Gráfico de Faturação */}
        <div className="card p-5">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold">Faturação por Tipo de Serviço (XOF)</h3>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataBarFaturas} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="faturacaoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.08} />
                  </linearGradient>
                  <filter id="shadowBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0f172a" floodOpacity="0.18" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(val) => formatarMoeda(val)} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.2)' }} labelStyle={{ color: '#cbd5e1' }} cursor={{ stroke: '#1e3a8a', strokeWidth: 2, opacity: 0.35 }} />
                <Area type="monotone" dataKey="total" stroke="none" fill="url(#faturacaoGradient)" fillOpacity={1} />
                <Line type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={4} dot={{ fill: '#2563eb', stroke: '#1e3a8a', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#60a5fa' }} strokeOpacity={0.98} filter="url(#shadowBlur)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Navios */}
        <div className="card p-5">
          <h3 className="font-semibold mb-6">Distribuição de Navios por Tipo</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataPieNavios} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="value" label>
                  {dataPieNavios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Gráfico de Containers */}
        <div className="card p-5">
          <h3 className="font-semibold mb-6">Contentores no Parque por Tipo</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBarCont} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" scale="band" />
                <Tooltip />
                <Bar dataKey="total" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ReportPrintModal
        aberto={modalImpressaoAberta}
        onFechar={() => setModalImpressaoAberta(false)}
        onConfirmar={handleConfirmarImpressao}
        titulo="Filtrar relatório por período"
      />

      <Modal aberto={filtroAberto} onFechar={() => setFiltroAberto(false)} titulo="Filtro Estatístico Avançado" largura="600px">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {entidadesDados.map((entidade) => (
              <label key={entidade.nome} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filtro.entidades.includes(entidade.nome)}
                  onChange={() => toggleEntidade(entidade.nome)}
                  className="checkbox"
                />
                {entidade.nome}
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Data Início</label>
              <input
                type="date"
                value={filtro.inicio}
                onChange={(e) => setFiltro((prev) => ({ ...prev, inicio: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Data Fim</label>
              <input
                type="date"
                value={filtro.fim}
                onChange={(e) => setFiltro((prev) => ({ ...prev, fim: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Status / Tipo</label>
              <input
                type="text"
                placeholder="Ex: Pago, Atracado, Liberado"
                value={filtro.status}
                onChange={(e) => setFiltro((prev) => ({ ...prev, status: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Buscar termo</label>
              <input
                type="text"
                placeholder="Ex: Lomé, Container, BL, Fatura"
                value={filtro.termo}
                onChange={(e) => setFiltro((prev) => ({ ...prev, termo: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={limparFiltro} className="btn-secondary w-full sm:w-auto">Limpar Filtro</button>
            <button type="button" onClick={aplicarFiltro} className="btn-primary w-full sm:w-auto">Aplicar Filtro</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
