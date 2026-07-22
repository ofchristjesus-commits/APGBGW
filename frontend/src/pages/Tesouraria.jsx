import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import StatsCard from '../components/shared/StatsCard';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { formatarMoeda } from '../lib/portUtils';
import { Building2, Banknote, AlertCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function Tesouraria() {
  const { items: faturas } = useEntity('faturas');
  const [tabAtiva, setTabAtiva] = useState('Tesouraria');
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);

  // Filtros para relatório
  const [filtros, setFiltros] = useState({
    status: '',
    dataEmissaoInicio: '',
    dataEmissaoFim: '',
  });

  const tabs = ['Tesouraria', 'Banco'];

  // Tesouraria Stats (≤ 50.000)
  const faturasTesouraria = faturas.filter(f => f.formaPagamento === 'Tesouraria');
  const totalTesouraria = faturasTesouraria.reduce((acc, f) => acc + f.valorTotal, 0);
  const pagoTesouraria = faturasTesouraria.reduce((acc, f) => acc + (f.status === 'Paga' ? f.valorTotal : 0), 0);

  // Banco Stats (> 50.000)
  const faturasBanco = faturas.filter(f => f.formaPagamento === 'Banco');
  const totalBanco = faturasBanco.reduce((acc, f) => acc + f.valorTotal, 0);
  const pagoBanco = faturasBanco.reduce((acc, f) => acc + (f.status === 'Paga' ? f.valorTotal : 0), 0);

  const listaAtual = tabAtiva === 'Tesouraria' ? faturasTesouraria : faturasBanco;

  const abrirModalFiltro = () => {
    setModalFiltroAberto(true);
  };

  const fecharModalFiltro = () => {
    setModalFiltroAberto(false);
  };

  const aplicarFiltros = () => {
    const faturasFiltr = (tabAtiva === 'Tesouraria' ? faturasTesouraria : faturasBanco).filter(f => {
      const cumpreStatus = !filtros.status || f.status === filtros.status;
      const cumpreDataInicio = !filtros.dataEmissaoInicio || new Date(f.dataEmissao) >= new Date(filtros.dataEmissaoInicio);
      const cumpreDataFim = !filtros.dataEmissaoFim || new Date(f.dataEmissao) <= new Date(filtros.dataEmissaoFim);
      return cumpreStatus && cumpreDataInicio && cumpreDataFim;
    });

    imprimirRelatarioTesouraria(faturasFiltr, tabAtiva);
    fecharModalFiltro();
  };

  const imprimirRelatarioTesouraria = (faturas, tipo) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';
    const totalFaturas = faturas.reduce((acc, f) => acc + f.valorTotal, 0);
    const totalPago = faturas.filter(f => f.status === 'Paga').reduce((acc, f) => acc + f.valorTotal, 0);
    const totalPendente = totalFaturas - totalPago;

    let linhasTabela = faturas.map(f => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.numFatura}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.cliente}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarData(f.dataEmissao)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatarMoeda(f.valorTotal)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.status}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Tesouraria</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            .cabecalho { margin-bottom: 24px; }
            .titulo { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .subtitulo { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
            .filtros { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
            .resumo { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
            .card-resumo { flex: 1; min-width: 150px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .label { font-size: 12px; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
            .valor { font-size: 20px; font-weight: 700; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 700; font-size: 13px; border-bottom: 2px solid #d1d5db; }
            td { padding: 8px; }
            .rodape { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="cabecalho">
            <div class="titulo">Relatório de ${tipo}</div>
            <div class="subtitulo">Data de emissão: ${formatarData(new Date().toISOString())}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.status ? `Status: ${filtros.status}<br>` : ''}
              ${filtros.dataEmissaoInicio ? `Período: ${formatarData(filtros.dataEmissaoInicio)}` : ''} ${filtros.dataEmissaoFim ? `a ${formatarData(filtros.dataEmissaoFim)}` : ''}
            </div>
          </div>

          <div class="resumo">
            <div class="card-resumo">
              <div class="label">Total de Faturas</div>
              <div class="valor">${faturas.length}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Valor Total</div>
              <div class="valor">${formatarMoeda(totalFaturas)}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Valor Pago</div>
              <div class="valor">${formatarMoeda(totalPago)}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Valor Pendente</div>
              <div class="valor">${formatarMoeda(totalPendente)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nº Fatura</th>
                <th>Cliente</th>
                <th>Data Emissão</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>

          <div class="rodape">
            <p>Relatório gerado pelo Sistema de Gestão Porto Cais</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Tesouraria & Finanças" 
        subtitulo="Gestão de fluxo de caixa e encaminhamento bancário" 
        onPrint={abrirModalFiltro}
        textoBotaoImprimir="Imprimir Relatório"
      />

      <div className="bg-sky-50 border border-sky-200 text-sky-800 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm">Regra de Encaminhamento Financeiro</h4>
          <p className="text-sm mt-1 opacity-90">
            Faturas com valor <strong>≤ 50.000 XOF</strong> são pagas na <strong>Tesouraria Local</strong>.<br/>
            Faturas com valor <strong>&gt; 50.000 XOF</strong> são encaminhadas diretamente para o <strong>Banco</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard titulo="Total Caixa (Tesouraria)" valor={formatarMoeda(totalTesouraria)} icone={Building2} cor="amber" subtitulo="Valor total faturado" />
        <StatsCard titulo="Caixa Realizado" valor={formatarMoeda(pagoTesouraria)} icone={TrendingUp} cor="green" subtitulo="Valor já recebido no caixa" />
        <StatsCard titulo="Total Banco" valor={formatarMoeda(totalBanco)} icone={Banknote} cor="blue" subtitulo="Valor total faturado" />
        <StatsCard titulo="Banco Realizado" valor={formatarMoeda(pagoBanco)} icone={TrendingUp} cor="green" subtitulo="Valor liquidado em conta" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="border-b border-border bg-muted/30 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {tabAtiva === 'Tesouraria' ? <Building2 className="text-amber-500" /> : <Banknote className="text-blue-500" />}
            Extrato - {tabAtiva}
          </h3>
          <div className="flex bg-background border border-border rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setTabAtiva(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  tabAtiva === tab ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container border-0 rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Fatura</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Data</th>
                <th className="text-right">Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {listaAtual.map(f => (
                <tr key={f.id}>
                  <td className="font-medium text-primary">{f.numFatura}</td>
                  <td className="font-medium">{f.cliente}</td>
                  <td>{f.tipoServico}</td>
                  <td>{format(new Date(f.dataEmissao), 'dd/MM/yyyy')}</td>
                  <td className="text-right font-mono font-medium">{formatarMoeda(f.valorTotal)}</td>
                  <td><StatusBadge status={f.status} /></td>
                </tr>
              ))}
              {listaAtual.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted-foreground">
                    Nenhuma fatura encontrada para {tabAtiva}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Filtro Relatório Personalizado */}
      <Modal
        aberto={modalFiltroAberto}
        onFechar={fecharModalFiltro}
        titulo="Relatório Personalizado - Filtros"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Status da Fatura</label>
            <select 
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Emitida">Emitida</option>
              <option value="Vencida">Vencida</option>
              <option value="Paga">Paga</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data de Emissão - Início</label>
              <input 
                type="date"
                value={filtros.dataEmissaoInicio}
                onChange={(e) => setFiltros({...filtros, dataEmissaoInicio: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="label">Data de Emissão - Fim</label>
              <input 
                type="date"
                value={filtros.dataEmissaoFim}
                onChange={(e) => setFiltros({...filtros, dataEmissaoFim: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button type="button" onClick={fecharModalFiltro} className="btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={aplicarFiltros} className="btn-primary">
              Gerar Relatório
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
