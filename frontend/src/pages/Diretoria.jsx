import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import ConfirmModal from '../components/shared/ConfirmModal';
import { useEntity } from '../hooks/useEntity';
import { formatarMoeda } from '../lib/portUtils';
import { Briefcase, Calendar, CheckSquare, Banknote, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';

export default function Diretoria() {
  const { items: audiencias, create: criarAudiencia, update: updateAudiencia, remove: removeAudiencia } = useEntity('audiencias');
  const { items: compromissos, create: criarCompromisso, update: updateCompromisso, remove: removeCompromisso } = useEntity('compromissos');
  const { items: despachos, create: criarDespacho, update: updateDespacho, remove: removeDespacho } = useEntity('despachos');
  const { items: autorizacoes, create: criarAutorizacao, update: updateAutorizacao, remove: removeAutorizacao } = useEntity('autorizacoesCredito');
  const { items: isencoes, create: criarIsencao, update: updateIsencao, remove: removeIsencao } = useEntity('isencoes');

  const [tabAtiva, setTabAtiva] = useState('Agenda');
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [registroAtual, setRegistroAtual] = useState(null);
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);

  const tabs = [
    { label: 'Agenda', icon: Calendar },
    { label: 'Compromissos', icon: Briefcase },
    { label: 'Despachos', icon: CheckSquare },
    { label: 'Autorizações de Crédito', icon: Banknote },
    { label: 'Isenções', icon: ShieldOff },
  ];

  const textoBotaoAcao = tabAtiva === 'Agenda'
    ? 'Agendar'
    : tabAtiva === 'Compromissos'
      ? 'Registar Compromisso'
      : tabAtiva === 'Despachos'
        ? 'Realizar Despacho'
        : tabAtiva === 'Autorizações de Crédito'
          ? 'Autorizar Crédito'
          : 'Autorizar Isenção';

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
      tipo: 'Agenda',
      dataHora: data.get('dataHora'),
      local: data.get('local'),
      participantes: data.get('participantes'),
      descricao: data.get('descricao'),
      status: 'Programado',
      notas: data.get('notas'),
    };
    if (registroAtual?.id) {
      updateAudiencia(registroAtual.id, payload);
    } else {
      criarAudiencia(payload);
    }
    fecharModal();
  };

  const handleSalvarCompromisso = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const payload = {
      titulo: data.get('titulo'),
      dataHora: data.get('dataHora'),
      local: data.get('local'),
      participantes: data.get('participantes'),
      status: 'Programado',
      descricao: data.get('descricao'),
    };
    if (registroAtual?.id) {
      updateCompromisso(registroAtual.id, payload);
    } else {
      criarCompromisso(payload);
    }
    fecharModal();
  };

  const handleSalvarDespacho = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const payload = {
      numDespacho: data.get('numDespacho'),
      assunto: data.get('assunto'),
      descricao: data.get('descricao'),
      responsavel: data.get('responsavel'),
      status: 'Emitido',
      prioridade: data.get('prioridade'),
      dataCriacao: data.get('dataCriacao'),
    };
    if (registroAtual?.id) {
      updateDespacho(registroAtual.id, payload);
    } else {
      criarDespacho(payload);
    }
    fecharModal();
  };

  const handleSalvarAutorizacao = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const payload = {
      numAutorizacao: data.get('numAutorizacao'),
      beneficiario: data.get('beneficiario'),
      valor: Number(data.get('valor') || 0),
      descricao: data.get('descricao'),
      status: 'Aprovada',
      dataCriacao: data.get('dataCriacao'),
    };
    if (registroAtual?.id) {
      updateAutorizacao(registroAtual.id, payload);
    } else {
      criarAutorizacao(payload);
    }
    fecharModal();
  };

  const handleSalvarIsencao = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const payload = {
      numIsencao: data.get('numIsencao'),
      beneficiario: data.get('beneficiario'),
      tipo: data.get('tipo'),
      motivo: data.get('motivo'),
      valorIsento: Number(data.get('valorIsento') || 0),
      status: 'Aprovada',
      dataSolicitacao: data.get('dataSolicitacao'),
    };
    if (registroAtual?.id) {
      updateIsencao(registroAtual.id, payload);
    } else {
      criarIsencao(payload);
    }
    fecharModal();
  };

  const handleConfirmarRemocao = () => {
    if (!itemParaRemover) return;
    switch (itemParaRemover.tipo) {
      case 'audiencia': removeAudiencia(itemParaRemover.id); break;
      case 'compromisso': removeCompromisso(itemParaRemover.id); break;
      case 'despacho': removeDespacho(itemParaRemover.id); break;
      case 'autorizacao': removeAutorizacao(itemParaRemover.id); break;
      case 'isencao': removeIsencao(itemParaRemover.id); break;
    }
    setConfirmModalAberto(false);
    setItemParaRemover(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Diretoria Geral" 
        subtitulo="Visão executiva e despachos da administração" 
        onAdd={() => abrirModal(tabAtiva)}
        textoBotao={textoBotaoAcao}
      />

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide gap-2">
        {tabs.map(tab => (
          <button
            key={tab.label}
            onClick={() => setTabAtiva(tab.label)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              tabAtiva === tab.label 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:bg-muted'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-4 min-h-[400px]">
        <div className="max-w-md mb-6">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder={`Pesquisar em ${tabAtiva}...`} />
        </div>

        {tabAtiva === 'Agenda' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Título</th>
                  <th>Local</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {audiencias.map(a => (
                  <tr key={a.id}>
                    <td className="font-medium">{format(new Date(a.dataHora), "dd/MM/yyyy HH:mm")}</td>
                    <td className="font-semibold text-primary">{a.titulo}</td>
                    <td>{a.local}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => abrirModal('Agenda', a)}
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
              </tbody>
            </table>
          </div>
        )}

        {tabAtiva === 'Despachos' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº Despacho</th>
                  <th>Data</th>
                  <th>Assunto / Descrição</th>
                  <th>Responsável</th>
                  <th>Prioridade / Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despachos.map(d => (
                  <tr key={d.id}>
                    <td className="font-bold text-primary">{d.numDespacho}</td>
                    <td>{format(new Date(d.dataCriacao), "dd/MM/yyyy")}</td>
                    <td>
                      <div className="font-semibold">{d.assunto}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{d.descricao}</div>
                    </td>
                    <td className="font-medium">{d.responsavel}</td>
                    <td>
                      <div className="flex flex-col gap-1.5 items-start">
                        <StatusBadge status={d.prioridade} />
                        <StatusBadge status={d.status} />
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button onClick={() => abrirModal('Despachos', d)} className="btn-secondary btn-sm">Editar</button>
                        <button onClick={() => { setItemParaRemover({ id: d.id, tipo: 'despacho' }); setConfirmModalAberto(true); }} className="btn-destructive btn-sm">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tabAtiva === 'Autorizações de Crédito' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº Autorização</th>
                  <th>Data</th>
                  <th>Beneficiário / Descrição</th>
                  <th className="text-right">Valor Aprovado</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {autorizacoes.map(a => (
                  <tr key={a.id}>
                    <td className="font-bold text-primary">{a.numAutorizacao}</td>
                    <td>{format(new Date(a.dataCriacao), "dd/MM/yyyy")}</td>
                    <td>
                      <div className="font-semibold">{a.beneficiario}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{a.descricao}</div>
                    </td>
                    <td className="text-right font-mono font-bold text-lg">{formatarMoeda(a.valor)}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button onClick={() => abrirModal('Autorizações de Crédito', a)} className="btn-secondary btn-sm">Editar</button>
                        <button onClick={() => { setItemParaRemover({ id: a.id, tipo: 'autorizacao' }); setConfirmModalAberto(true); }} className="btn-destructive btn-sm">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tabAtiva === 'Isenções' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nº Isenção</th>
                  <th>Data Sol.</th>
                  <th>Beneficiário / Motivo</th>
                  <th>Tipo Ref.</th>
                  <th className="text-right">Valor Isento</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isencoes.map(i => (
                  <tr key={i.id}>
                    <td className="font-bold text-primary">{i.numIsencao}</td>
                    <td>{format(new Date(i.dataSolicitacao), "dd/MM/yyyy")}</td>
                    <td>
                      <div className="font-semibold">{i.beneficiario}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{i.motivo}</div>
                    </td>
                    <td><span className="px-2 py-1 bg-muted rounded text-xs font-medium">{i.tipo}</span></td>
                    <td className="text-right font-mono font-bold text-lg text-emerald-600">{formatarMoeda(i.valorIsento)}</td>
                    <td><StatusBadge status={i.status} /></td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button onClick={() => abrirModal('Isenções', i)} className="btn-secondary btn-sm">Editar</button>
                        <button onClick={() => { setItemParaRemover({ id: i.id, tipo: 'isencao' }); setConfirmModalAberto(true); }} className="btn-destructive btn-sm">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {tabAtiva === 'Compromissos' && (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Título</th>
                  <th>Local</th>
                  <th>Participantes</th>
                  <th>Status</th>
                  <th className="text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {compromissos.map(c => (
                  <tr key={c.id}>
                    <td>{format(new Date(c.dataHora), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="font-semibold text-primary">{c.titulo}</td>
                    <td>{c.local}</td>
                    <td>{c.participantes}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => abrirModal('Compromissos', c)}
                          className="btn-secondary btn-sm"
                        >Editar</button>
                        <button
                          onClick={() => { setItemParaRemover({ id: c.id, tipo: 'compromisso' }); setConfirmModalAberto(true); }}
                          className="btn-destructive btn-sm"
                        >Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {compromissos.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-6 text-muted-foreground">Nenhum compromisso registado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={
        modalTipo === 'Agenda' ? 'Agendar Evento' :
        modalTipo === 'Compromissos' ? 'Registar Compromisso' :
        modalTipo === 'Despachos' ? 'Realizar Despacho' :
        modalTipo === 'Autorizações de Crédito' ? 'Autorizar Crédito' :
        'Autorizar Isenção'
      }>
        {modalTipo === 'Agenda' && (
          <form onSubmit={handleSalvarAudiencia} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
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
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Agendar</button></div>
          </form>
        )}

        {modalTipo === 'Compromissos' && (
          <form onSubmit={handleSalvarCompromisso} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Título</label><input name="titulo" className="input" defaultValue={registroAtual?.titulo || ''} required /></div>
              <div><label className="label">Data e Hora</label><input name="dataHora" type="datetime-local" className="input" defaultValue={registroAtual?.dataHora || ''} required /></div>
              <div><label className="label">Local</label><input name="local" className="input" defaultValue={registroAtual?.local || ''} required /></div>
              <div><label className="label">Participantes</label><input name="participantes" className="input" defaultValue={registroAtual?.participantes || ''} placeholder="Separar por vírgulas" /></div>
              <div className="col-span-2"><label className="label">Descrição</label><textarea name="descricao" className="textarea" defaultValue={registroAtual?.descricao || ''} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Registar</button></div>
          </form>
        )}

        {modalTipo === 'Despachos' && (
          <form onSubmit={handleSalvarDespacho} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Nº Despacho</label><input name="numDespacho" className="input" defaultValue={registroAtual?.numDespacho || ''} required /></div>
              <div><label className="label">Data</label><input name="dataCriacao" type="date" className="input" defaultValue={registroAtual?.dataCriacao || new Date().toISOString().split('T')[0]} required /></div>
              <div><label className="label">Assunto</label><input name="assunto" className="input" defaultValue={registroAtual?.assunto || ''} required /></div>
              <div><label className="label">Responsável</label><input name="responsavel" className="input" defaultValue={registroAtual?.responsavel || ''} required /></div>
              <div className="col-span-2"><label className="label">Descrição</label><textarea name="descricao" className="textarea" defaultValue={registroAtual?.descricao || ''} /></div>
              <div><label className="label">Prioridade</label><select name="prioridade" className="select" defaultValue={registroAtual?.prioridade || 'Normal'}><option>Normal</option><option>Urgente</option></select></div>
            </div>
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Realizar</button></div>
          </form>
        )}

        {modalTipo === 'Autorizações de Crédito' && (
          <form onSubmit={handleSalvarAutorizacao} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Nº Autorização</label><input name="numAutorizacao" className="input" defaultValue={registroAtual?.numAutorizacao || ''} required /></div>
              <div><label className="label">Data</label><input name="dataCriacao" type="date" className="input" defaultValue={registroAtual?.dataCriacao || new Date().toISOString().split('T')[0]} required /></div>
              <div><label className="label">Beneficiário</label><input name="beneficiario" className="input" defaultValue={registroAtual?.beneficiario || ''} required /></div>
              <div><label className="label">Valor</label><input name="valor" type="number" className="input" defaultValue={registroAtual?.valor || ''} required /></div>
              <div className="col-span-2"><label className="label">Descrição</label><textarea name="descricao" className="textarea" defaultValue={registroAtual?.descricao || ''} /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Autorizar</button></div>
          </form>
        )}

        {modalTipo === 'Isenções' && (
          <form onSubmit={handleSalvarIsencao} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">Nº Isenção</label><input name="numIsencao" className="input" defaultValue={registroAtual?.numIsencao || ''} required /></div>
              <div><label className="label">Data</label><input name="dataSolicitacao" type="date" className="input" defaultValue={registroAtual?.dataSolicitacao || new Date().toISOString().split('T')[0]} required /></div>
              <div><label className="label">Beneficiário</label><input name="beneficiario" className="input" defaultValue={registroAtual?.beneficiario || ''} required /></div>
              <div><label className="label">Tipo</label><input name="tipo" className="input" defaultValue={registroAtual?.tipo || ''} required /></div>
              <div className="col-span-2"><label className="label">Motivo</label><textarea name="motivo" className="textarea" defaultValue={registroAtual?.motivo || ''} /></div>
              <div><label className="label">Valor Isento</label><input name="valorIsento" type="number" className="input" defaultValue={registroAtual?.valorIsento || ''} required /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Autorizar</button></div>
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
