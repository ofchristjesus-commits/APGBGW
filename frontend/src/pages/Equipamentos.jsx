import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import { useEntity } from '../hooks/useEntity';
import Modal from '../components/shared/Modal';
import { Wrench, Settings, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';

export default function Equipamentos() {
  const { items, create } = useEntity('equipamentos');
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [equipAtual, setEquipAtual] = useState(null);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    dataInicio: '',
    dataFim: '',
  });

  const filtrados = items.filter(eq => 
    eq.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
    eq.codigo.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const formatarDataRelatorio = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';

  const gerarRelatorioEquipamentos = () => {
    const equipamentosFiltrados = items.filter(eq => {
      const condStatus = !filtros.status || eq.status === filtros.status;
      const condTipo = !filtros.tipo || eq.tipo.toLowerCase().includes(filtros.tipo.toLowerCase());
      const condDataInicio = !filtros.dataInicio || (eq.proximaManutencao && new Date(eq.proximaManutencao) >= new Date(filtros.dataInicio));
      const condDataFim = !filtros.dataFim || (eq.proximaManutencao && new Date(eq.proximaManutencao) <= new Date(filtros.dataFim));
      return condStatus && condTipo && condDataInicio && condDataFim;
    });

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const totalEquipamentos = equipamentosFiltrados.length;
    const linhasTabela = equipamentosFiltrados.map(eq => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${eq.nome}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${eq.codigo}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${eq.tipo}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${eq.capacidade}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarDataRelatorio(eq.proximaManutencao)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${eq.status}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Equipamentos</title>
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
            <div class="titulo">Relatório de Equipamentos</div>
            <div class="subtitulo">Total de equipamentos: ${totalEquipamentos}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.status ? `Status: ${filtros.status}<br>` : ''}
              ${filtros.tipo ? `Tipo: ${filtros.tipo}<br>` : ''}
              ${filtros.dataInicio ? `Manutenção a partir de: ${formatarDataRelatorio(filtros.dataInicio)}<br>` : ''}
              ${filtros.dataFim ? `Manutenção até: ${formatarDataRelatorio(filtros.dataFim)}<br>` : ''}
            </div>
          </div>
          <div class="resumo">
            <div class="card-resumo"><div class="label">Total Equipamentos</div><div class="valor">${totalEquipamentos}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>Tipo</th>
                <th>Capacidade</th>
                <th>Próx. Manutenção</th>
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
        titulo="Equipamentos" 
        subtitulo="Gestão da frota e equipamentos operacionais" 
        onPrint={() => setModalFiltroAberto(true)}
          textoBotaoImprimir="Imprimir Relatório"
        onAdd={() => { setEquipAtual(null); setModalAberto(true); }}
        textoBotao="Registar Equipamento"
      />

      <div className="card p-4 flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar por nome ou código..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtrados.map(eq => (
          <div key={eq.id} className="card p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="font-bold leading-tight">{eq.nome}</h3>
                  <span className="text-xs font-mono text-muted-foreground">{eq.codigo}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <StatusBadge status={eq.status} />
            </div>

            <div className="space-y-3 mb-6 flex-1 text-sm bg-muted/30 p-3 rounded-lg">
              <div className="flex justify-between border-b border-border border-dashed pb-2">
                <span className="text-muted-foreground">Tipo / Capacidade</span>
                <span className="font-medium text-right">{eq.tipo}<br/><span className="text-xs">{eq.capacidade}</span></span>
              </div>
              <div className="flex justify-between border-b border-border border-dashed pb-2">
                <span className="text-muted-foreground flex items-center gap-1.5"><Activity size={14}/> Horas Uso</span>
                <span className="font-mono">{eq.horasOperacao?.toLocaleString() || 0} h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Settings size={14}/> Prox. Manutenção</span>
                <span className="font-medium">{eq.proximaManutencao ? format(new Date(eq.proximaManutencao), 'dd/MM/yyyy') : '-'}</span>
              </div>
            </div>
            
            <div className="mt-auto flex gap-2">
              <button className="btn-secondary w-full justify-center">
                <Clock size={16} /> Registar Manutenção
              </button>
              <button onClick={() => { setEquipAtual(eq); setModalAberto(true); }} className="btn-primary w-full inline-flex items-center justify-center gap-2">
                <Wrench size={16} /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal aberto={modalFiltroAberto} onFechar={() => setModalFiltroAberto(false)} titulo="Filtro do Relatório de Equipamentos">
        <div className="space-y-4">
          <div>
            <label className="label">Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Operacional">Operacional</option>
              <option value="Em Manutenção">Em Manutenção</option>
              <option value="Avariado">Avariado</option>
            </select>
          </div>
          <div>
            <label className="label">Tipo</label>
            <input
              type="text"
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="input"
              placeholder="Tipo de equipamento"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Próx. Manutenção - Início</label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Próx. Manutenção - Fim</label>
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
            <button type="button" onClick={gerarRelatorioEquipamentos} className="btn-primary">
              Gerar Relatório
            </button>
          </div>
        </div>
      </Modal>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo={equipAtual ? 'Editar Equipamento' : 'Registar Equipamento'}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.target);
          const dados = {
            nome: f.get('nome'),
            codigo: f.get('codigo'),
            tipo: f.get('tipo'),
            capacidade: f.get('capacidade'),
            proximaManutencao: f.get('proximaManutencao') || null,
            horasOperacao: Number(f.get('horasOperacao') || 0),
            status: f.get('status') || 'Operacional'
          };
          create(dados);
          setModalAberto(false);
        }} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input name="nome" className="input" defaultValue={equipAtual?.nome || ''} required />
          </div>
          <div>
            <label className="label">Código</label>
            <input name="codigo" className="input" defaultValue={equipAtual?.codigo || ''} />
          </div>
          <div>
            <label className="label">Tipo</label>
            <input name="tipo" className="input" defaultValue={equipAtual?.tipo || ''} />
          </div>
          <div>
            <label className="label">Capacidade</label>
            <input name="capacidade" className="input" defaultValue={equipAtual?.capacidade || ''} />
          </div>
          <div>
            <label className="label">Próxima Manutenção</label>
            <input name="proximaManutencao" type="date" className="input" defaultValue={equipAtual?.proximaManutencao || ''} />
          </div>
          <div>
            <label className="label">Horas de Operação</label>
            <input name="horasOperacao" type="number" className="input" defaultValue={equipAtual?.horasOperacao || 0} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
