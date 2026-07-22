import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { Anchor, ArrowRight, Plus, Calendar, MapPin, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_FLOW = ['Notificado', 'Aprovado', 'Atracado', 'Em Operação', 'Desatracado'];

export default function Atracagem() {
  const { items, create, update } = useEntity('atracagens');
  const { items: navios, create: criarNavio } = useEntity('navios');
  const { create: criarNotificacao } = useEntity('notificacoes');
  const [modalAberto, setModalAberto] = useState(false);
  const [atracagemAtual, setAtracagemAtual] = useState(null);
  const [navioNomeInput, setNavioNomeInput] = useState('');
  const [novoNavio, setNovoNavio] = useState(false);
  const [novoNavioData, setNovoNavioData] = useState({
    nome: '',
    imo: '',
    bandeira: '',
    tipo: '',
    comprimento: '',
    calado: '',
    capacidadeTEUs: '',
    armador: '',
    agenteMaritimo: '',
  });

  const formatarData = (isoStr) => {
    if (!isoStr) return '-';
    return format(new Date(isoStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const abrirModal = (atracagem = null) => {
    setAtracagemAtual(atracagem);
    const nome = atracagem?.navioNome || '';
    setNavioNomeInput(nome);
    const existente = navios.find((n) => n.nome.toLowerCase() === nome.toLowerCase());
    setNovoNavio(Boolean(nome) && !existente);
    if (!existente) {
      setNovoNavioData(prev => ({ ...prev, nome }));
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setAtracagemAtual(null);
    setNavioNomeInput('');
    setNovoNavio(false);
    setNovoNavioData({ nome: '', imo: '', bandeira: '', tipo: '', comprimento: '', calado: '', capacidadeTEUs: '', armador: '', agenteMaritimo: '' });
    setModalAberto(false);
  };

  const handleNovoNavioChange = (field, value) => {
    setNovoNavioData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvarAtracagem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const nomeInput = formData.get('navioNome')?.trim() || '';
    let navioId = null;
    let navioNome = nomeInput;

    const existente = navios.find((n) => n.nome.toLowerCase() === nomeInput.toLowerCase());
    if (existente) {
      navioId = existente.id;
      navioNome = existente.nome;
      setNovoNavio(false);
    } else if (nomeInput) {
      const novoNavioPayload = {
        nome: nomeInput,
        imo: formData.get('novoNavioImo') || novoNavioData.imo || '',
        bandeira: formData.get('novoNavioBandeira') || novoNavioData.bandeira || '',
        tipo: formData.get('novoNavioTipo') || novoNavioData.tipo || '',
        comprimento: Number(formData.get('novoNavioComprimento') || novoNavioData.comprimento || 0),
        calado: Number(formData.get('novoNavioCalado') || novoNavioData.calado || 0),
        capacidadeTEUs: Number(formData.get('novoNavioCapacidadeTEUs') || novoNavioData.capacidadeTEUs || 0),
        armador: formData.get('novoNavioArmador') || novoNavioData.armador || '',
        agenteMaritimo: formData.get('novoNavioAgenteMaritimo') || novoNavioData.agenteMaritimo || '',
        status: 'Esperado',
      };
      const criado = await criarNavio(novoNavioPayload);
      navioId = criado.id;
      navioNome = criado.nome;
    }

    const dados = {
      numViagem: formData.get('numViagem'),
      navioId,
      navioNome,
      cais: formData.get('cais'),
      dataPrevista: formData.get('dataPrevista'),
      portoOrigem: formData.get('portoOrigem'),
      portoDestino: formData.get('portoDestino'),
      status: formData.get('status'),
      notas: formData.get('notas') || '',
    };

    if (atracagemAtual?.id) {
      update(atracagemAtual.id, dados);
    } else {
      create(dados);
    }

    fecharModal();
  };

  const progredirStatus = (atracagem) => {
    const currentIndex = STATUS_FLOW.indexOf(atracagem.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1];
      const updates = { status: nextStatus };
      
      const now = new Date().toISOString();
      if (nextStatus === 'Atracado') updates.dataAtracagem = now;
      if (nextStatus === 'Desatracado') updates.dataDesatracagem = now;

      update(atracagem.id, updates);
      
      criarNotificacao({
        titulo: `Atracagem: ${atracagem.navioNome} - ${nextStatus}`,
        mensagem: `O navio ${atracagem.navioNome} mudou o estado para ${nextStatus} no ${atracagem.cais}.`,
        tipo: 'Atracagem',
        destinatario: 'Todos',
        lida: false,
        referencia: atracagem.numViagem,
        modulo: 'Atracagem',
        dataCriacao: now
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Atracagem" 
        subtitulo="Gestão do fluxo de atracagem de navios" 
        onAdd={() => abrirModal()}
        textoBotao="Registar Atracagem"
      />

      <div className="card p-0 overflow-hidden">
        <div className="table-container border-0 rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>Viagem</th>
                <th>Navio</th>
                <th>Cais</th>
                <th>Previsão</th>
                <th>Atracação / Desatracação</th>
                <th>Status Atual</th>
                <th>Notas</th>
                <th className="text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map(a => {
                const navio = navios.find(n => n.id === a.navioId);
                const nextStatusIndex = STATUS_FLOW.indexOf(a.status) + 1;
                const canProgress = nextStatusIndex < STATUS_FLOW.length;
                
                return (
                  <tr key={a.id}>
                    <td className="font-medium text-primary">{a.numViagem}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Anchor size={16} className="text-muted-foreground" />
                        <span className="font-semibold">{a.navioNome}</span>
                      </div>
                      <span className="text-xs text-muted-foreground block mt-0.5">{navio?.tipo}</span>
                    </td>
                    <td className="font-medium">{a.cais}</td>
                    <td className="text-sm">{formatarData(a.dataPrevista)}</td>
                    <td className="text-sm">
                      <div className="text-emerald-600">A: {formatarData(a.dataAtracagem)}</div>
                      <div className="text-rose-600">D: {formatarData(a.dataDesatracagem)}</div>
                    </td>
                    <td className="align-middle"><StatusBadge status={a.status} /></td>
                    <td className="align-middle">{a.notas ? <span className="text-sm text-muted-foreground">{a.notas}</span> : '-'}</td>
                    <td className="text-right align-middle">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {canProgress && (
                          <button 
                            onClick={() => progredirStatus(a)}
                            className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-2"
                          >
                            Avançar <ArrowRight size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => abrirModal(a)}
                          className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-2"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={atracagemAtual ? 'Editar Atracagem' : 'Registar Atracagem'}>
        <form onSubmit={handleSalvarAtracagem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Viagem</label>
              <input name="numViagem" className="input" defaultValue={atracagemAtual?.numViagem || ''} required />
            </div>
            <div>
              <label className="label">Navio</label>
              <input
                name="navioNome"
                list="navios-list"
                className="input"
                value={navioNomeInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setNavioNomeInput(value);
                  const existente = navios.find((n) => n.nome.toLowerCase() === value.trim().toLowerCase());
                  setNovoNavio(Boolean(value.trim()) && !existente);
                  if (value.trim() && !existente) {
                    setNovoNavioData((prev) => ({ ...prev, nome: value.trim() }));
                  }
                }}
                placeholder="Digite ou selecione um navio registrado"
                required
              />
              <datalist id="navios-list">
                {navios.map((n) => (
                  <option key={n.id} value={n.nome} />
                ))}
              </datalist>
            </div>
            {novoNavio && (
              <div className="md:col-span-2 grid grid-cols-1 gap-4 bg-slate-900 border border-slate-700 p-4 rounded-2xl">
                <div className="text-sm text-muted-foreground">Registe os dados do novo navio para que fique disponível no catálogo.</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nome do Navio</label>
                    <input
                      name="novoNavioNome"
                      className="input"
                      value={novoNavioData.nome}
                      onChange={(e) => handleNovoNavioChange('nome', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">IMO</label>
                    <input
                      name="novoNavioImo"
                      className="input"
                      value={novoNavioData.imo}
                      onChange={(e) => handleNovoNavioChange('imo', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Bandeira</label>
                    <input
                      name="novoNavioBandeira"
                      className="input"
                      value={novoNavioData.bandeira}
                      onChange={(e) => handleNovoNavioChange('bandeira', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Tipo</label>
                    <input
                      name="novoNavioTipo"
                      className="input"
                      value={novoNavioData.tipo}
                      onChange={(e) => handleNovoNavioChange('tipo', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Comprimento (m)</label>
                    <input
                      name="novoNavioComprimento"
                      type="number"
                      className="input"
                      value={novoNavioData.comprimento}
                      onChange={(e) => handleNovoNavioChange('comprimento', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Calado (m)</label>
                    <input
                      name="novoNavioCalado"
                      type="number"
                      className="input"
                      value={novoNavioData.calado}
                      onChange={(e) => handleNovoNavioChange('calado', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Capacidade TEUs</label>
                    <input
                      name="novoNavioCapacidadeTEUs"
                      type="number"
                      className="input"
                      value={novoNavioData.capacidadeTEUs}
                      onChange={(e) => handleNovoNavioChange('capacidadeTEUs', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Armador</label>
                    <input
                      name="novoNavioArmador"
                      className="input"
                      value={novoNavioData.armador}
                      onChange={(e) => handleNovoNavioChange('armador', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Agente Marítimo</label>
                    <input
                      name="novoNavioAgenteMaritimo"
                      className="input"
                      value={novoNavioData.agenteMaritimo}
                      onChange={(e) => handleNovoNavioChange('agenteMaritimo', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="label">Cais</label>
              <input name="cais" className="input" defaultValue={atracagemAtual?.cais || ''} required />
            </div>
            <div>
              <label className="label">Data Prevista</label>
              <input name="dataPrevista" type="datetime-local" className="input" defaultValue={atracagemAtual?.dataPrevista || ''} required />
            </div>
            <div>
              <label className="label">Porto de Origem</label>
              <input name="portoOrigem" className="input" defaultValue={atracagemAtual?.portoOrigem || ''} required />
            </div>
            <div>
              <label className="label">Porto de Destino</label>
              <input name="portoDestino" className="input" defaultValue={atracagemAtual?.portoDestino || ''} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" defaultValue={atracagemAtual?.status || 'Notificado'}>
                <option>Notificado</option>
                <option>Aprovado</option>
                <option>Atracado</option>
                <option>Em Operação</option>
                <option>Desatracado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Notas de correção / comentário</label>
              <textarea
                name="notas"
                className="textarea h-24"
                defaultValue={atracagemAtual?.notas || ''}
                placeholder="Descreva um engano ou por que a atracagem não devia ter sido registada..."
              />
            </div>
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
