import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Escalas() {
  const { items, create } = useEntity('escalas');
  const [tabAtiva, setTabAtiva] = useState('Estivadores Efetivos');
  const [modalAberto, setModalAberto] = useState(false);
  const [escalaAtual, setEscalaAtual] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: 'Estivadores Efetivos',
    status: '',
    dataInicio: '',
    dataFim: '',
  });

  const tabs = ['Estivadores Efetivos', 'Estivadores Eventuais', 'Conferentes', 'Pessoal Báscola'];
  const escalasFiltradas = items.filter(e => e.tipo === tabAtiva);

  const abrirModal = (escala = null) => {
    setEscalaAtual(escala);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setEscalaAtual(null);
    setModalAberto(false);
  };

  const handleSalvarEscala = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    create({
      tipo: formData.get('tipo'),
      navioNome: formData.get('navioNome'),
      data: formData.get('data'),
      turno: formData.get('turno'),
      chefia: formData.get('chefia'),
      funcionarios: formData.get('funcionarios').split(',').map(f => f.trim()).filter(Boolean),
      status: formData.get('status') || 'Programada',
    });
    fecharModal();
  };

  const formatarDataRelatorio = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';

  const gerarRelatorioEscalas = () => {
    const escalasFiltradasRelatorio = items.filter(escala => {
      const condTipo = !filtros.tipo || escala.tipo === filtros.tipo;
      const condStatus = !filtros.status || escala.status === filtros.status;
      const condDataInicio = !filtros.dataInicio || new Date(escala.data) >= new Date(filtros.dataInicio);
      const condDataFim = !filtros.dataFim || new Date(escala.data) <= new Date(filtros.dataFim);
      return condTipo && condStatus && condDataInicio && condDataFim;
    });

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const totalEscalas = escalasFiltradasRelatorio.length;
    const linhasTabela = escalasFiltradasRelatorio.map(escala => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escala.tipo}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escala.navioNome}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarDataRelatorio(escala.data)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escala.turno}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escala.chefia}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${escala.status}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Escalas</title>
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
            <div class="titulo">Relatório de Escalas</div>
            <div class="subtitulo">Total de escalas: ${totalEscalas}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.tipo ? `Tipo: ${filtros.tipo}<br>` : ''}
              ${filtros.status ? `Status: ${filtros.status}<br>` : ''}
              ${filtros.dataInicio ? `Data início: ${formatarDataRelatorio(filtros.dataInicio)}<br>` : ''}
              ${filtros.dataFim ? `Data fim: ${formatarDataRelatorio(filtros.dataFim)}<br>` : ''}
            </div>
          </div>
          <div class="resumo">
            <div class="card-resumo"><div class="label">Total Escalas</div><div class="valor">${totalEscalas}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Navio / Local</th>
                <th>Data</th>
                <th>Turno</th>
                <th>Chefia</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${linhasTabela}</tbody>
          </table>
          <div class="rodape"><p>Relatório gerado pelo Sistema de Gestão Porto Cais</p></div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setModalFiltroAberto(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Escalas de Trabalho" 
        subtitulo="Gestão de equipas operacionais" 
        onPrint={() => setModalFiltroAberto(true)}
          textoBotaoImprimir="Imprimir Relatório"
        onAdd={() => abrirModal()}
        textoBotao="Fazer Escala"
      />

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${tabAtiva === tab ? 'active' : ''}`}
            onClick={() => setTabAtiva(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {escalasFiltradas.length > 0 ? escalasFiltradas.map(escala => (
          <div key={escala.id} className="card p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
              <div>
                <h3 className="font-bold">{escala.navioNome}</h3>
                <span className="text-xs text-muted-foreground">Navio designado</span>
              </div>
              <StatusBadge status={escala.status} />
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="font-medium">{format(new Date(escala.data), 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-muted-foreground" />
                <span>{escala.turno}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-primary" />
                  <span className="font-semibold text-sm">Equipa ({escala.funcionarios.length})</span>
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground mb-2">Chefe: <span className="font-medium text-foreground">{escala.chefeEquipa}</span></p>
                  <ul className="list-disc pl-4 space-y-1">
                    {escala.funcionarios.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
               <button className="btn-secondary w-full justify-center">Gerir Equipa</button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            Nenhuma escala programada para {tabAtiva}.
          </div>
        )}
      </div>

      <Modal aberto={modalFiltroAberto} onFechar={() => setModalFiltroAberto(false)} titulo="Filtro do Relatório de Escalas">
        <div className="space-y-4">
          <div>
            <label className="label">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="select"
            >
              <option>Estivadores Efetivos</option>
              <option>Estivadores Eventuais</option>
              <option>Conferentes</option>
              <option>Pessoal Báscola</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Programada">Programada</option>
              <option value="Em Progresso">Em Progresso</option>
              <option value="Concluída">Concluída</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data - Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Data - Fim</label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button type="button" onClick={() => setModalFiltroAberto(false)} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={gerarRelatorioEscalas} className="btn-primary">
              Gerar Relatório
            </button>
          </div>
        </div>
      </Modal>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={escalaAtual ? 'Editar Escala' : 'Fazer Escala'}>
        <form onSubmit={handleSalvarEscala} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Escala</label>
              <select name="tipo" className="select" defaultValue={escalaAtual?.tipo || 'Estivadores Efetivos'}>
                <option>Estivadores Efetivos</option>
                <option>Estivadores Eventuais</option>
                <option>Conferentes</option>
                <option>Pessoal Báscola</option>
              </select>
            </div>
            <div>
              <label className="label">Navio / Local</label>
              <input name="navioNome" className="input" defaultValue={escalaAtual?.navioNome || ''} required />
            </div>
            <div>
              <label className="label">Data</label>
              <input name="data" type="date" className="input" defaultValue={escalaAtual?.data || ''} required />
            </div>
            <div>
              <label className="label">Turno</label>
              <input name="turno" className="input" defaultValue={escalaAtual?.turno || ''} required />
            </div>
            <div>
              <label className="label">Chefe de Equipa</label>
              <input name="chefia" className="input" defaultValue={escalaAtual?.chefia || ''} />
            </div>
            <div>
              <label className="label">Funcionários</label>
              <input name="funcionarios" className="input" defaultValue={escalaAtual?.funcionarios?.join(', ') || ''} placeholder="Separe por vírgula" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Escala</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
