import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Ship, Calendar, Plus, Edit2, Eye, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

export default function Manifestos() {
  const { items: manifestos, create: criarManifesto, update: atualizarManifesto } = useEntity('manifestos');
  const { items: bls, create: criarBL, update: atualizarBL } = useEntity('bls');
  const { hasPermission } = useAuth();
  const [pesquisa, setPesquisa] = useState('');
  const [manifestoModalAberto, setManifestoModalAberto] = useState(false);
  const [manifestoAtual, setManifestoAtual] = useState(null);
  const [blsModalAberto, setBlsModalAberto] = useState(false);
  const [manifestoSelecionado, setManifestoSelecionado] = useState(null);
  const [blDetalhesAberto, setBlDetalhesAberto] = useState(false);
  const [blAtual, setBlAtual] = useState(null);
  const [blEditAberto, setBlEditAberto] = useState(false);
  const [filtroBL, setFiltroBL] = useState('');

  const filtrados = manifestos.filter(m =>
    m.numManifesto.toLowerCase().includes(pesquisa.toLowerCase()) ||
    m.navioNome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const abrirManifestoModal = (manifesto = null) => {
    setManifestoAtual(manifesto);
    setManifestoModalAberto(true);
  };

  const fecharManifestoModal = () => {
    setManifestoAtual(null);
    setManifestoModalAberto(false);
  };

  const handleSalvarManifesto = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = {
      numManifesto: formData.get('numManifesto'),
      navioId: Number(formData.get('navioId')) || null,
      navioNome: formData.get('navioNome'),
      data: formData.get('data'),
      portoOrigem: formData.get('portoOrigem'),
      totalBLs: Number(formData.get('totalBLs') || 0),
      totalContainers: Number(formData.get('totalContainers') || 0),
      pesoTotal: Number(formData.get('pesoTotal') || 0),
      status: formData.get('status') || 'Registrado',
      consignatario: formData.get('consignatario'),
      agente: formData.get('agente'),
    };

    if (manifestoAtual?.id) {
      atualizarManifesto(manifestoAtual.id, dados);
    } else {
      criarManifesto(dados);
    }
    fecharManifestoModal();
  };

  const abrirBlsModal = (manifesto) => {
    setManifestoSelecionado(manifesto);
    setBlsModalAberto(true);
    setFiltroBL('');
  };

  const fecharBlsModal = () => {
    setManifestoSelecionado(null);
    setBlsModalAberto(false);
    setFiltroBL('');
  };

  const abrirBlDetalhes = (bl) => {
    setBlAtual(bl);
    setBlDetalhesAberto(true);
  };

  const fecharBlDetalhes = () => {
    setBlAtual(null);
    setBlDetalhesAberto(false);
  };

  const abrirBlEdit = (bl = null) => {
    setBlAtual(bl);
    setBlEditAberto(true);
  };

  const fecharBlEdit = () => {
    setBlAtual(null);
    setBlEditAberto(false);
  };

  const handleSalvarBl = (e) => {
    e.preventDefault();
    if (!manifestoSelecionado) return;
    const formData = new FormData(e.target);
    const statusConferencia = formData.get('statusConferencia') || 'Pendente';
    let statusBaixa = blAtual?.statusBaixa || null;
    let podeSair = blAtual?.podeSair || false;

    if (statusConferencia === 'Pendente') {
      statusBaixa = null;
      podeSair = false;
    }

    const dados = {
      numBL: formData.get('numBL'),
      navioId: manifestoSelecionado.navioId,
      navioNome: manifestoSelecionado.navioNome,
      manifestoId: manifestoSelecionado.id,
      consignatario: formData.get('consignatario'),
      numContainer: formData.get('numContainer'),
      descricaoMercadoria: formData.get('descricaoMercadoria'),
      pesoDeclarado: Number(formData.get('pesoDeclarado') || 0),
      pesoConferido: formData.get('pesoConferido') ? Number(formData.get('pesoConferido')) : null,
      tipoCarga: formData.get('tipoCarga'),
      statusConferencia,
      statusBaixa,
      podeSair,
    };

    if (blAtual?.id) {
      atualizarBL(blAtual.id, dados);
    } else {
      criarBL({
        ...dados,
        statusBaixa: null,
        podeSair: false,
      });
    }
    fecharBlEdit();
  };

  const handleConferirBL = (bl) => {
    const atualizacao = {
      statusConferencia: 'Conferido OK',
      dataConferencia: new Date().toISOString(),
      conferente: 'Equipa de Conferência',
    };
    atualizarBL(bl.id, atualizacao);
    if (blAtual?.id === bl.id) {
      setBlAtual({ ...bl, ...atualizacao });
    }
  };

  const handleDarBaixa = (bl) => {
    const atualizacao = { statusBaixa: 'Baixado' };
    atualizarBL(bl.id, atualizacao);
    if (blAtual?.id === bl.id) {
      setBlAtual({ ...bl, ...atualizacao });
    }
  };

  const handleAutorizarSaida = (bl) => {
    const atualizacao = { podeSair: true };
    atualizarBL(bl.id, atualizacao);
    if (blAtual?.id === bl.id) {
      setBlAtual({ ...bl, ...atualizacao });
    }
  };

  const blsDoManifesto = bls.filter(b => b.manifestoId === manifestoSelecionado?.id);
  const blsFiltradosDoManifesto = blsDoManifesto.filter((bl) => {
    const termo = filtroBL.trim().toLowerCase();
    if (!termo) return true;

    const campos = [bl.numBL, bl.numContainer, bl.consignatario, bl.descricaoMercadoria, bl.navioNome]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return campos.includes(termo);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Manifestos de Carga"
        subtitulo="Documentos de declaração de carga dos navios"
        onAdd={hasPermission('Manifestos:Criar') ? () => abrirManifestoModal() : undefined}
        textoBotao="Registar Manifesto"
      />

      <div className="card p-4">
        <div className="max-w-md mb-4">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar manifesto ou navio..." />
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Manifesto</th>
                <th>Navio</th>
                <th>Data</th>
                <th>Origem</th>
                <th className="text-right">BLs</th>
                <th className="text-right">Peso Total (Kg)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(manifesto => (
                <tr key={manifesto.id}>
                  <td className="font-medium text-primary">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      <span>{manifesto.numManifesto}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Ship size={14} className="text-muted-foreground" />
                      <span>{manifesto.navioNome}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span>{manifesto.data ? format(new Date(manifesto.data), 'dd/MM/yyyy') : '-'}</span>
                    </div>
                  </td>
                  <td>{manifesto.portoOrigem}</td>
                  <td className="text-right font-medium">{manifesto.totalBLs}</td>
                  <td className="text-right font-mono">{manifesto.pesoTotal?.toLocaleString() || 0}</td>
                  <td><StatusBadge status={manifesto.status} /></td>
                  <td className="space-x-2 whitespace-nowrap">
                    {hasPermission('Manifestos:Conferir BLs') && (
                      <button
                        onClick={() => abrirBlsModal(manifesto)}
                        className="btn-secondary btn-xs inline-flex items-center gap-2"
                      >
                        <ClipboardList size={14} /> Conferir BLs
                      </button>
                    )}
                    {hasPermission('Manifestos:Editar') && (
                      <button
                        onClick={() => abrirManifestoModal(manifesto)}
                        className="btn-primary btn-xs inline-flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal aberto={manifestoModalAberto} onFechar={fecharManifestoModal} titulo={manifestoAtual ? 'Editar Manifesto' : 'Registar Manifesto'}>
        <form onSubmit={handleSalvarManifesto} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nº Manifesto</label>
              <input name="numManifesto" className="input" defaultValue={manifestoAtual?.numManifesto || ''} required />
            </div>
            <div>
              <label className="label">Navio</label>
              <input name="navioNome" className="input" defaultValue={manifestoAtual?.navioNome || ''} required />
            </div>
            <div>
              <label className="label">Data</label>
              <input name="data" type="date" className="input" defaultValue={manifestoAtual?.data || ''} required />
            </div>
            <div>
              <label className="label">Porto de Origem</label>
              <input name="portoOrigem" className="input" defaultValue={manifestoAtual?.portoOrigem || ''} required />
            </div>
            <div>
              <label className="label">Total BLs</label>
              <input name="totalBLs" type="number" className="input" defaultValue={manifestoAtual?.totalBLs || 0} min="0" required />
            </div>
            <div>
              <label className="label">Total Containers</label>
              <input name="totalContainers" type="number" className="input" defaultValue={manifestoAtual?.totalContainers || 0} min="0" required />
            </div>
            <div>
              <label className="label">Peso Total (Kg)</label>
              <input name="pesoTotal" type="number" className="input" defaultValue={manifestoAtual?.pesoTotal || 0} min="0" required />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" defaultValue={manifestoAtual?.status || 'Registrado'}>
                <option>Registrado</option>
                <option>Em Conferência</option>
                <option>Emitido</option>
                <option>Aprovado</option>
              </select>
            </div>
            <div>
              <label className="label">Consignatário</label>
              <input name="consignatario" className="input" defaultValue={manifestoAtual?.consignatario || ''} />
            </div>
            <div>
              <label className="label">Agente</label>
              <input name="agente" className="input" defaultValue={manifestoAtual?.agente || ''} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={fecharManifestoModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal aberto={blsModalAberto} onFechar={fecharBlsModal} titulo={`BLs de ${manifestoSelecionado?.numManifesto || 'Manifesto'}`} largura="1100px">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="w-full sm:max-w-sm">
            <input
              value={filtroBL}
              onChange={(event) => setFiltroBL(event.target.value)}
              placeholder="Filtrar BLs..."
              className="input"
            />
          </div>
          {hasPermission('Manifestos:Criar BL') && (
            <button onClick={() => abrirBlEdit()} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Novo BL
            </button>
          )}
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Contra marca do Navio</th>
                <th>Nº Container</th>
                <th>Dono da carga</th>
                <th className="whitespace-nowrap min-w-[150px]">Nº BL</th>
                <th>Peso (Kg)</th>
                <th>Mercadoria</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {blsFiltradosDoManifesto.map(bl => (
                <tr key={bl.id}>
                  <td>{bl.navioNome}</td>
                  <td>{bl.numContainer || '-'}</td>
                  <td>{bl.consignatario}</td>
                  <td className="font-medium whitespace-nowrap">{bl.numBL}</td>
                  <td>{(bl.pesoConferido ?? bl.pesoDeclarado)?.toLocaleString() || '-'}</td>
                  <td>{bl.descricaoMercadoria}</td>
                  <td>
                    <div className="space-y-1">
                      <StatusBadge status={bl.statusConferencia || 'Pendente'} />
                      {bl.statusBaixa && <StatusBadge status={bl.statusBaixa} />}
                      {bl.podeSair && <span className="badge bg-emerald-100 text-emerald-800">Pode Sair</span>}
                    </div>
                  </td>
                  <td className="space-x-2 whitespace-nowrap">
                    {hasPermission('Manifestos:Ver Detalhes BL') && (
                      <button
                        onClick={() => abrirBlDetalhes(bl)}
                        className="btn-secondary btn-xs inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> Abrir BL
                      </button>
                    )}
                    {hasPermission('Manifestos:Editar BL') && (
                      <button
                        onClick={() => abrirBlEdit(bl)}
                        className="btn-primary btn-xs inline-flex items-center gap-1"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {blsFiltradosDoManifesto.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-muted-foreground">Nenhum BL registado para este manifesto.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal aberto={blEditAberto} onFechar={fecharBlEdit} titulo={blAtual ? 'Editar BL' : 'Novo BL'} largura="700px">
        <form onSubmit={handleSalvarBl} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nº BL</label>
              <input name="numBL" className="input" defaultValue={blAtual?.numBL || ''} required />
            </div>
            <div>
              <label className="label">Nº Container</label>
              <input name="numContainer" className="input" defaultValue={blAtual?.numContainer || ''} />
            </div>
            <div>
              <label className="label">Dono da carga</label>
              <input name="consignatario" className="input" defaultValue={blAtual?.consignatario || ''} required />
            </div>
            <div>
              <label className="label">Mercadoria</label>
              <input name="descricaoMercadoria" className="input" defaultValue={blAtual?.descricaoMercadoria || ''} required />
            </div>
            <div>
              <label className="label">Peso Declarado (Kg)</label>
              <input name="pesoDeclarado" type="number" className="input" defaultValue={blAtual?.pesoDeclarado || 0} min="0" />
            </div>
            <div>
              <label className="label">Peso Conferido (Kg)</label>
              <input name="pesoConferido" type="number" className="input" defaultValue={blAtual?.pesoConferido || ''} min="0" />
            </div>
            <div>
              <label className="label">Tipo de Carga</label>
              <input name="tipoCarga" className="input" defaultValue={blAtual?.tipoCarga || 'Container'} />
            </div>
            <div>
              <label className="label">Status de Conferência</label>
              <select name="statusConferencia" className="select" defaultValue={blAtual?.statusConferencia || 'Pendente'}>
                <option>Pendente</option>
                <option>Conferido OK</option>
                <option>Divergência</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={fecharBlEdit} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar BL</button>
          </div>
        </form>
      </Modal>

      <Modal aberto={blDetalhesAberto} onFechar={fecharBlDetalhes} titulo={`BL ${blAtual?.numBL || ''}`} largura="700px">
        {blAtual ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Contra marca do Navio</p>
                <p className="font-medium">{blAtual.navioNome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nº Container</p>
                <p className="font-medium">{blAtual.numContainer || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dono da carga</p>
                <p className="font-medium">{blAtual.consignatario}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="font-medium">{(blAtual.pesoConferido ?? blAtual.pesoDeclarado)?.toLocaleString() || '-'}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm text-muted-foreground">Mercadoria</p>
                <p className="font-medium">{blAtual.descricaoMercadoria}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-xs text-muted-foreground">Conferência</p>
                <p className="font-semibold">{blAtual.statusConferencia || 'Pendente'}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-muted-foreground">Baixa</p>
                <p className="font-semibold">{blAtual.statusBaixa || 'Ainda não'}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-muted-foreground">Autorização</p>
                <p className="font-semibold">{blAtual.podeSair ? 'Pode Sair' : 'Aguardando'}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {blAtual.statusConferencia !== 'Conferido OK' && hasPermission('Manifestos:Ação: Conferir BL') && (
                <button onClick={() => handleConferirBL(blAtual)} className="btn-primary flex-1">
                  Conferir BL
                </button>
              )}
              {blAtual.statusConferencia === 'Conferido OK' && !blAtual.statusBaixa && hasPermission('Manifestos:Ação: Dar Baixa') && (
                <button onClick={() => handleDarBaixa(blAtual)} className="btn-secondary flex-1">
                  Dar Baixa
                </button>
              )}
              {blAtual.statusBaixa === 'Baixado' && !blAtual.podeSair && hasPermission('Manifestos:Ação: Autorizar Pode Sair') && (
                <button onClick={() => handleAutorizarSaida(blAtual)} className="btn-primary flex-1">
                  Autorizar Pode Sair
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Selecione um BL para ver detalhes.</p>
        )}
      </Modal>
    </div>
  );
}
