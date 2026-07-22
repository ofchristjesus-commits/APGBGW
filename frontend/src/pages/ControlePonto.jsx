import { useEffect, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { Clock, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ControlePonto() {
  const { items: funcionarios } = useEntity('funcionarios');
  const { items: pontos, create, update } = useEntity('pontos');
  const hoje = new Date().toISOString().split('T')[0];
  const [modalAberto, setModalAberto] = useState(false);
  const [registroAtual, setRegistroAtual] = useState(null);
  const [entrada, setEntrada] = useState('');
  const [saida, setSaida] = useState('');

  useEffect(() => {
    funcionarios.forEach(func => {
      const existe = pontos.some(p => p.funcionarioId === func.id && p.data === hoje);
      if (!existe) {
        create({
          funcionarioId: func.id,
          funcionarioNome: func.nome,
          matricula: func.matricula,
          departamento: func.departamento,
          data: hoje,
          horaEntrada: '',
          horaSaida: '',
          status: 'Pendente'
        });
      }
    });
  }, [funcionarios, pontos, create]);

  // Exibir apenas os registos do dia atual na UI; registos antigos permanecem na base de dados
  const pontosHoje = pontos.filter(p => p.data === hoje);

  const registrarHora = (registro, tipo) => {
    const agora = new Date();
    const valor = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    if (tipo === 'entrada') {
      update(registro.id, { horaEntrada: valor, status: registro.horaSaida ? 'Completado' : 'Iniciado' });
    } else {
      update(registro.id, { horaSaida: valor, status: registro.horaEntrada ? 'Completado' : 'Saída Registrada' });
    }
  };

  const abrirModal = (registro) => {
    setRegistroAtual(registro);
    setEntrada(registro.horaEntrada || '');
    setSaida(registro.horaSaida || '');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setRegistroAtual(null);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const status = entrada && saida ? 'Completado' : entrada ? 'Iniciado' : 'Pendente';
    update(registroAtual.id, { horaEntrada: entrada, horaSaida: saida, status });
    fecharModal();
  };

  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtros, setFiltros] = useState({
    funcionario: '',
    departamento: '',
    status: '',
    dataInicio: '',
    dataFim: '',
  });

  const abrirModalFiltro = () => setModalFiltroAberto(true);
  const fecharModalFiltro = () => setModalFiltroAberto(false);

  const aplicarFiltros = () => {
    const registrosFiltrados = pontos.filter(registro => {
      const condFuncionario = !filtros.funcionario || registro.funcionarioNome.toLowerCase().includes(filtros.funcionario.toLowerCase());
      const condDepartamento = !filtros.departamento || registro.departamento.toLowerCase().includes(filtros.departamento.toLowerCase());
      const condStatus = !filtros.status || registro.status === filtros.status;
      const condDataInicio = !filtros.dataInicio || new Date(registro.data) >= new Date(filtros.dataInicio);
      const condDataFim = !filtros.dataFim || new Date(registro.data) <= new Date(filtros.dataFim);
      return condFuncionario && condDepartamento && condStatus && condDataInicio && condDataFim;
    });

    imprimirRelatorioPonto(registrosFiltrados);
    fecharModalFiltro();
  };

  const imprimirRelatorioPonto = (registros) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';
    const totalRegistros = registros.length;
    const completos = registros.filter(r => r.status === 'Completado').length;
    const inicio = filtros.dataInicio ? formatarData(filtros.dataInicio) : '—';
    const fim = filtros.dataFim ? formatarData(filtros.dataFim) : '—';

    const linhasTabela = registros.map(registro => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${registro.funcionarioNome}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${registro.matricula}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${registro.departamento}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarData(registro.data)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${registro.horaEntrada || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${registro.horaSaida || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${registro.status}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Controlo de Ponto</title>
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
            <div class="titulo">Relatório de Controlo de Ponto</div>
            <div class="subtitulo">Período: ${inicio} a ${fim}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.funcionario ? `Funcionário: ${filtros.funcionario}<br>` : ''}
              ${filtros.departamento ? `Departamento: ${filtros.departamento}<br>` : ''}
              ${filtros.status ? `Status: ${filtros.status}<br>` : ''}
            </div>
          </div>
          <div class="resumo">
            <div class="card-resumo"><div class="label">Total Registos</div><div class="valor">${totalRegistros}</div></div>
            <div class="card-resumo"><div class="label">Registos Completos</div><div class="valor">${completos}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Matricula</th>
                <th>Departamento</th>
                <th>Data</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
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
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Controlo de Ponto"
        subtitulo="Registo diário de entrada e saída dos colaboradores"
        onPrint={abrirModalFiltro}
        textoBotaoImprimir="Imprimir Relatório"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Clock size={24} />
            <div>
              <p className="text-sm uppercase tracking-[0.18em]">Registos Hoje</p>
              <p className="text-2xl font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">A cada dia é criado um ficheiro de ponto para cada funcionário.</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground mb-3">Total de registos de ponto (hoje)</p>
          <p className="text-3xl font-semibold">{pontosHoje.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted-foreground mb-3">Registos completos (hoje)</p>
          <p className="text-3xl font-semibold">{pontosHoje.filter(p => p.status === 'Completado').length}</p>
        </div>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Matricula</th>
              <th>Departamento</th>
              <th>Data</th>
              <th>Entrada</th>
              <th>Saída</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pontosHoje.map(registro => (
              <tr key={registro.id}>
                <td>{registro.funcionarioNome}</td>
                <td>{registro.matricula}</td>
                <td>{registro.departamento}</td>
                <td>{registro.data}</td>
                <td>{registro.horaEntrada || '-'}</td>
                <td>{registro.horaSaida || '-'}</td>
                <td>{registro.status}</td>
                <td className="space-x-2">
                  <button onClick={() => registrarHora(registro, 'entrada')} className="btn-secondary btn-sm">Entrada</button>
                  <button onClick={() => registrarHora(registro, 'saida')} className="btn-secondary btn-sm">Saída</button>
                  <button onClick={() => abrirModal(registro)} className="btn-primary btn-sm inline-flex items-center gap-2">
                    <Edit2 size={14} /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal aberto={modalFiltroAberto} onFechar={fecharModalFiltro} titulo="Filtro do Relatório de Ponto">
        <div className="space-y-4">
          <div>
            <label className="label">Funcionário</label>
            <input
              type="text"
              value={filtros.funcionario}
              onChange={(e) => setFiltros({ ...filtros, funcionario: e.target.value })}
              className="input"
              placeholder="Nome do funcionário"
            />
          </div>
          <div>
            <label className="label">Departamento</label>
            <input
              type="text"
              value={filtros.departamento}
              onChange={(e) => setFiltros({ ...filtros, departamento: e.target.value })}
              className="input"
              placeholder="Departamento"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Iniciado">Iniciado</option>
              <option value="Completado">Completado</option>
              <option value="Saída Registrada">Saída Registrada</option>
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
            <button type="button" onClick={fecharModalFiltro} className="btn-secondary">Cancelar</button>
            <button type="button" onClick={aplicarFiltros} className="btn-primary">Gerar Relatório</button>
          </div>
        </div>
      </Modal>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={`Editar Ponto — ${registroAtual?.funcionarioNome || ''}`}>
        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="label">Hora de Entrada</label>
            <input value={entrada} onChange={(e) => setEntrada(e.target.value)} className="input" placeholder="HH:MM" />
          </div>
          <div>
            <label className="label">Hora de Saída</label>
            <input value={saida} onChange={(e) => setSaida(e.target.value)} className="input" placeholder="HH:MM" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
