import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { gerarNumero, formatarMoeda } from '../lib/portUtils';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_FLOW = ['Solicitada', 'Em Análise', 'Aprovada', 'Em Compra', 'Entregue'];

export default function Compras() {
  const { items, update } = useEntity('compras');
  const { create: criarNotificacao } = useEntity('notificacoes');
  const [pesquisa, setPesquisa] = useState('');
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);

  // Filtros para relatório
  const [filtros, setFiltros] = useState({
    status: '',
    departamento: '',
    urgencia: '',
    dataSolicitacaoInicio: '',
    dataSolicitacaoFim: '',
  });

  const filtrados = items.filter(c => 
    c.numRequisicao.toLowerCase().includes(pesquisa.toLowerCase()) || 
    c.descricao.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.departamento.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const progredirStatus = (compra) => {
    const currentIndex = STATUS_FLOW.indexOf(compra.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1];
      const updates = { status: nextStatus };
      
      const now = new Date().toISOString().split('T')[0];
      if (nextStatus === 'Aprovada') updates.dataAprovacao = now;
      if (nextStatus === 'Entregue') updates.dataEntrega = now;

      update(compra.id, updates);
      
      criarNotificacao({
        titulo: `Requisição ${compra.numRequisicao} - ${nextStatus}`,
        mensagem: `A requisição de compra para ${compra.departamento} mudou para o estado: ${nextStatus}.`,
        tipo: 'Informação',
        destinatario: 'Direção Geral',
        lida: false,
        referencia: compra.numRequisicao,
        modulo: 'Compras',
        dataCriacao: new Date().toISOString()
      });
    }
  };

  const abrirModalFiltro = () => {
    setModalFiltroAberto(true);
  };

  const fecharModalFiltro = () => {
    setModalFiltroAberto(false);
  };

  const aplicarFiltros = () => {
    const comprasFiltr = items.filter(c => {
      const cumpreStatus = !filtros.status || c.status === filtros.status;
      const cumpreDepartamento = !filtros.departamento || c.departamento.toLowerCase().includes(filtros.departamento.toLowerCase());
      const cumpreUrgencia = !filtros.urgencia || c.urgencia === filtros.urgencia;
      const cumpreDataInicio = !filtros.dataSolicitacaoInicio || new Date(c.dataSolicitacao) >= new Date(filtros.dataSolicitacaoInicio);
      const cumpreDataFim = !filtros.dataSolicitacaoFim || new Date(c.dataSolicitacao) <= new Date(filtros.dataSolicitacaoFim);
      return cumpreStatus && cumpreDepartamento && cumpreUrgencia && cumpreDataInicio && cumpreDataFim;
    });

    imprimirRelatarioCompras(comprasFiltr);
    fecharModalFiltro();
  };

  const imprimirRelatarioCompras = (compras) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';
    const totalCompras = compras.reduce((acc, c) => acc + c.valorEstimado, 0);
    const departamentosUnicos = [...new Set(compras.map(c => c.departamento))];

    let linhasTabela = compras.map(c => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${c.numRequisicao}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${c.departamento}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${c.descricao}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${c.fornecedor}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatarMoeda(c.valorEstimado)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarData(c.dataSolicitacao)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${c.status}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Compras</title>
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
            <div class="titulo">Relatório de Compras & Requisições</div>
            <div class="subtitulo">Data de emissão: ${formatarData(new Date().toISOString())}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.status ? `Status: ${filtros.status}<br>` : ''}
              ${filtros.departamento ? `Departamento: ${filtros.departamento}<br>` : ''}
              ${filtros.urgencia ? `Urgência: ${filtros.urgencia}<br>` : ''}
              ${filtros.dataSolicitacaoInicio ? `Período: ${formatarData(filtros.dataSolicitacaoInicio)}` : ''} ${filtros.dataSolicitacaoFim ? `a ${formatarData(filtros.dataSolicitacaoFim)}` : ''}
            </div>
          </div>

          <div class="resumo">
            <div class="card-resumo">
              <div class="label">Total de Requisições</div>
              <div class="valor">${compras.length}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Valor Total Estimado</div>
              <div class="valor">${formatarMoeda(totalCompras)}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Departamentos</div>
              <div class="valor">${departamentosUnicos.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nº Requisição</th>
                <th>Departamento</th>
                <th>Descrição</th>
                <th>Fornecedor</th>
                <th>Valor Estimado</th>
                <th>Data Solicitação</th>
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
        titulo="Compras & Requisições" 
        subtitulo="Gestão de aquisições de material e serviços" 
        onPrint={abrirModalFiltro}
        textoBotaoImprimir="Imprimir Relatório"
        textoBotao="Nova Requisição"
      />

      <div className="card p-4">
        <div className="max-w-md mb-4">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar requisição, departamento ou descrição..." />
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Req.</th>
                <th>Departamento / Urgência</th>
                <th>Descrição / Fornecedor</th>
                <th className="text-right">Valor Est.</th>
                <th>Datas (Sol. / Apr. / Ent.)</th>
                <th>Status Atual</th>
                <th className="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => {
                const nextStatusIndex = STATUS_FLOW.indexOf(c.status) + 1;
                const canProgress = nextStatusIndex < STATUS_FLOW.length;
                
                return (
                  <tr key={c.id}>
                    <td className="font-medium text-primary whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingCart size={16} />
                        {c.numRequisicao}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{c.departamento}</div>
                      <StatusBadge status={c.urgencia} />
                    </td>
                    <td>
                      <div className="font-medium text-sm max-w-xs truncate" title={c.descricao}>{c.descricao}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">{c.fornecedor || 'Fornecedor não definido'}</div>
                    </td>
                    <td className="text-right font-mono font-medium">{formatarMoeda(c.valorEstimado)}</td>
                    <td className="text-xs text-muted-foreground space-y-0.5">
                      <div>S: {c.dataSolicitacao ? format(new Date(c.dataSolicitacao), 'dd/MM/yyyy') : '-'}</div>
                      <div className="text-blue-600">A: {c.dataAprovacao ? format(new Date(c.dataAprovacao), 'dd/MM/yyyy') : '-'}</div>
                      <div className="text-green-600">E: {c.dataEntrega ? format(new Date(c.dataEntrega), 'dd/MM/yyyy') : '-'}</div>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-right">
                      {canProgress && (
                        <button 
                          onClick={() => progredirStatus(c)}
                          className="btn-primary py-1.5 px-3 text-xs"
                        >
                          Avançar <ArrowRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
            <label className="label">Status</label>
            <select 
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Solicitada">Solicitada</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Em Compra">Em Compra</option>
              <option value="Entregue">Entregue</option>
            </select>
          </div>

          <div>
            <label className="label">Departamento</label>
            <input 
              type="text"
              value={filtros.departamento}
              onChange={(e) => setFiltros({...filtros, departamento: e.target.value})}
              placeholder="Digite o departamento..."
              className="input"
            />
          </div>

          <div>
            <label className="label">Urgência</label>
            <select 
              value={filtros.urgencia}
              onChange={(e) => setFiltros({...filtros, urgencia: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Baixa">Baixa</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data Solicitação - Início</label>
              <input 
                type="date"
                value={filtros.dataSolicitacaoInicio}
                onChange={(e) => setFiltros({...filtros, dataSolicitacaoInicio: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="label">Data Solicitação - Fim</label>
              <input 
                type="date"
                value={filtros.dataSolicitacaoFim}
                onChange={(e) => setFiltros({...filtros, dataSolicitacaoFim: e.target.value})}
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
