import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import ConfirmModal from '../components/shared/ConfirmModal';
import { useEntity } from '../hooks/useEntity';
import { Calendar, Mail, FileText, ArrowRight, Bell } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Secretaria() {
  const { items: audiencias, create: criarAudiencia, update: updateAudiencia, remove: removeAudiencia } = useEntity('audiencias');
  const { items: correspondencias, create: criarCorrespondencia, update: updateCorrespondencia, remove: removeCorrespondencia } = useEntity('correspondencias');
  const [tabAtiva, setTabAtiva] = useState('Audiências e Reuniões');
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [registroAtual, setRegistroAtual] = useState(null);
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);

  const tabs = ['Audiências e Reuniões', 'Correspondências'];

  const audienciasFiltradas = audiencias.filter(a => 
    a.titulo.toLowerCase().includes(pesquisa.toLowerCase()) || 
    a.participantes.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const correspondenciasFiltradas = correspondencias.filter(c => 
    c.numReferencia.toLowerCase().includes(pesquisa.toLowerCase()) || 
    c.assunto.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.remetente.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const proximasAudiencias = audiencias.filter(a => {
    const dataHora = new Date(a.dataHora);
    const diffHours = differenceInHours(dataHora, new Date());
    return diffHours >= 0 && diffHours <= 48;
  });

  const textoBotaoAcao = tabAtiva === 'Audiências e Reuniões'
    ? 'Agendar Audiência / Reunião'
    : 'Registar Correspondência';

  const abrirModal = (tipo, registro = null) => {
    setModalTipo(tipo);
    setRegistroAtual(registro);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalTipo('');
    setRegistroAtual(null);
    setModalAberto(false);
  };

  const handleSalvarAudiencia = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const payload = {
      titulo: data.get('titulo'),
      tipo: data.get('tipo'),
      dataHora: data.get('dataHora'),
      local: data.get('local'),
      participantes: data.get('participantes'),
      descricao: data.get('descricao'),
      status: 'Programada',
      notas: data.get('notas'),
    };
    if (registroAtual?.id) {
      updateAudiencia(registroAtual.id, payload);
    } else {
      criarAudiencia(payload);
    }
    fecharModal();
  };

  const handleSalvarCorrespondencia = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const payload = {
      numReferencia: data.get('numReferencia'),
      tipo: data.get('tipo'),
      remetente: data.get('remetente'),
      destinatario: data.get('destinatario'),
      assunto: data.get('assunto'),
      data: data.get('data'),
      status: 'Recebida',
      urgencia: data.get('urgencia'),
      observacoes: data.get('observacoes'),
    };
    if (registroAtual?.id) {
      updateCorrespondencia(registroAtual.id, payload);
    } else {
      criarCorrespondencia(payload);
    }
    fecharModal();
  };

  const handleConfirmarRemocao = () => {
    if (!itemParaRemover) return;
    switch (itemParaRemover.tipo) {
      case 'audiencia': removeAudiencia(itemParaRemover.id); break;
      case 'correspondencia': removeCorrespondencia(itemParaRemover.id); break;
    }
    setConfirmModalAberto(false);
    setItemParaRemover(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Secretaria Geral" 
        subtitulo="Gestão de agenda, audiências e correspondência" 
        onAdd={() => abrirModal(tabAtiva === 'Audiências e Reuniões' ? 'Audiência' : 'Correspondência')}
        textoBotao={textoBotaoAcao}
      />

      <div className="card p-4">
        {proximasAudiencias.length > 0 && (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-amber-900 font-semibold">
              <Bell size={18} /> Alarme de proximidade
            </div>
            <p className="text-sm text-amber-800 mb-3">
              Há {proximasAudiencias.length} evento(s) marcado(s) para as próximas 48 horas.
            </p>
            <div className="grid gap-2">
              {proximasAudiencias.map(a => (
                <div key={a.id} className="rounded-2xl bg-white p-3 border border-amber-100">
                  <div className="text-sm font-semibold">{a.titulo} ({a.tipo})</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(a.dataHora), "dd/MM/yyyy HH:mm", { locale: ptBR })} — {a.local}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex bg-background border border-border rounded-lg p-1 w-full sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setTabAtiva(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  tabAtiva === tab ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full sm:max-w-xs">
            <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar..." />
          </div>
        </div>

        {tabAtiva === 'Audiências e Reuniões' ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Tipo / Título</th>
                  <th>Data/Hora</th>
                  <th>Local</th>
                  <th>Participantes</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {audienciasFiltradas.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold text-primary mb-0.5">{a.titulo}</div>
                      <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded">{a.tipo}</span>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={14} className="text-muted-foreground" />
                        {format(new Date(a.dataHora), "dd/MM/yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground ml-5">
                        {format(new Date(a.dataHora), "HH:mm", { locale: ptBR })}
                      </div>
                    </td>
                    <td>{a.local}</td>
                    <td className="text-sm max-w-[200px] truncate" title={a.participantes}>{a.participantes}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => abrirModal('Audiência', a)}
                          className="btn-secondary btn-sm"
                        >Editar</button>
                        <button
                          onClick={() => { setItemParaRemover({ id: a.id, tipo: 'audiencia' }); setConfirmModalAberto(true); }}
                          className="btn-destructive btn-sm"
                        >Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {audienciasFiltradas.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-6 text-muted-foreground">Nenhuma audiência agendada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ref. / Tipo</th>
                  <th>Data</th>
                  <th>Remetente → Destinatário</th>
                  <th>Assunto</th>
                  <th>Urgência / Status</th>
                </tr>
              </thead>
              <tbody>
                {correspondenciasFiltradas.map(c => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap">
                      <div className="font-mono text-primary font-bold mb-1">{c.numReferencia}</div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded flex w-fit items-center gap-1 ${c.tipo === 'Entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.tipo === 'Entrada' ? '↓ Entrada' : '↑ Saída'}
                      </span>
                    </td>
                    <td className="text-sm font-medium">{format(new Date(c.data), 'dd/MM/yyyy')}</td>
                    <td className="text-sm">
                      <div className="font-medium text-foreground">{c.remetente}</div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <ArrowRight size={12} /> {c.destinatario}
                      </div>
                    </td>
                    <td className="text-sm max-w-[250px]">
                      <div className="font-medium truncate" title={c.assunto}>{c.assunto}</div>
                      {c.observacoes && <div className="text-xs text-muted-foreground truncate italic mt-0.5" title={c.observacoes}>{c.observacoes}</div>}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5 items-start">
                        <StatusBadge status={c.urgencia} />
                        <StatusBadge status={c.status} />
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => abrirModal('Correspondência', c)}
                          className="btn-secondary btn-sm"
                        >Editar</button>
                        <button
                          onClick={() => { setItemParaRemover({ id: c.id, tipo: 'correspondencia' }); setConfirmModalAberto(true); }}
                          className="btn-destructive btn-sm"
                        >Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {correspondenciasFiltradas.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-6 text-muted-foreground">Nenhuma correspondência encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={modalTipo === 'Audiência' ? 'Agendar Audiência / Reunião' : 'Registar Correspondência'}>
        {modalTipo === 'Audiência' && (
          <form onSubmit={handleSalvarAudiencia} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tipo</label>
                <select name="tipo" className="select" defaultValue={registroAtual?.tipo || 'Reunião'}>
                  <option>Reunião</option>
                  <option>Audiência</option>
                </select>
              </div>
              <div>
                <label className="label">Título</label>
                <input name="titulo" className="input" defaultValue={registroAtual?.titulo || ''} required />
              </div>
              <div>
                <label className="label">Data e Hora</label>
                <input name="dataHora" type="datetime-local" className="input" defaultValue={registroAtual?.dataHora || ''} required />
              </div>
              <div>
                <label className="label">Local</label>
                <input name="local" className="input" defaultValue={registroAtual?.local || ''} required />
              </div>
              <div className="col-span-2">
                <label className="label">Participantes</label>
                <input name="participantes" className="input" defaultValue={registroAtual?.participantes || ''} placeholder="Separar por vírgulas" />
              </div>
              <div className="col-span-2">
                <label className="label">Descrição</label>
                <textarea name="descricao" className="textarea" defaultValue={registroAtual?.descricao || ''} />
              </div>
              <div className="col-span-2">
                <label className="label">Notas</label>
                <textarea name="notas" className="textarea" defaultValue={registroAtual?.notas || ''} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Agendar</button>
            </div>
          </form>
        )}

        {modalTipo === 'Correspondência' && (
          <form onSubmit={handleSalvarCorrespondencia} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Número de Referência</label>
                <input name="numReferencia" className="input" defaultValue={registroAtual?.numReferencia || ''} required />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select name="tipo" className="select" defaultValue={registroAtual?.tipo || 'Entrada'}>
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </div>
              <div>
                <label className="label">Remetente</label>
                <input name="remetente" className="input" defaultValue={registroAtual?.remetente || ''} required />
              </div>
              <div>
                <label className="label">Destinatário</label>
                <input name="destinatario" className="input" defaultValue={registroAtual?.destinatario || ''} required />
              </div>
              <div className="col-span-2">
                <label className="label">Assunto</label>
                <input name="assunto" className="input" defaultValue={registroAtual?.assunto || ''} required />
              </div>
              <div>
                <label className="label">Data</label>
                <input name="data" type="date" className="input" defaultValue={registroAtual?.data || new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <label className="label">Urgência</label>
                <select name="urgencia" className="select" defaultValue={registroAtual?.urgencia || 'Normal'}>
                  <option>Normal</option>
                  <option>Urgente</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Observações</label>
                <textarea name="observacoes" className="textarea" defaultValue={registroAtual?.observacoes || ''} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Registar</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal 
        aberto={confirmModalAberto}
        onFechar={() => {
          setConfirmModalAberto(false);
          setItemParaRemover(null);
        }}
        onConfirmar={handleConfirmarRemocao}
        titulo="Confirmar Remoção"
        mensagem="Tem a certeza que deseja remover este registo? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
