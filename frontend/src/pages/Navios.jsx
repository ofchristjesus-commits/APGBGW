import { useState, useMemo } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import ConfirmModal from '../components/shared/ConfirmModal';
import { useEntity } from '../hooks/useEntity';
import { useAuth } from '../contexts/AuthContext';
import { Ship, Anchor, Flag, Trash2, Edit2 } from 'lucide-react';

export default function Navios() {
  const { items, create, update, remove } = useEntity('navios');
  const { hasPermission } = useAuth();
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [navioAtual, setNavioAtual] = useState(null);
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);

  const naviosFiltrados = useMemo(() => {
    return items.filter(n => 
      n.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
      n.imo.includes(pesquisa) ||
      n.armador.toLowerCase().includes(pesquisa.toLowerCase())
    );
  }, [items, pesquisa]);

  const handleSalvar = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = {
      nome: formData.get('nome'),
      imo: formData.get('imo'),
      bandeira: formData.get('bandeira'),
      tipo: formData.get('tipo'),
      comprimento: Number(formData.get('comprimento')),
      calado: Number(formData.get('calado')),
      capacidadeTEUs: Number(formData.get('capacidadeTEUs')),
      armador: formData.get('armador'),
      agenteMaritimo: formData.get('agenteMaritimo'),
      status: formData.get('status') || 'Esperado'
    };

    if (navioAtual?.id) {
      update(navioAtual.id, dados);
    } else {
      create(dados);
    }
    setModalAberto(false);
  };

  const abrirModal = (navio = null) => {
    setNavioAtual(navio);
    setModalAberto(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Navios" 
        subtitulo="Gestão do registo de navios" 
        textoBotao="Registar Navio"
        onAdd={hasPermission('Navios:Criar') ? () => abrirModal() : undefined}
      />

      <div className="card p-4 flex items-center justify-between gap-4">
        <div className="w-full max-w-sm">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar por nome, IMO ou armador..." />
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          Total: {naviosFiltrados.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {naviosFiltrados.map(navio => (
          <div key={navio.id} className="card p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Ship size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{navio.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">IMO: {navio.imo}</p>
                </div>
              </div>
              <StatusBadge status={navio.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6 flex-1">
              <div>
                <span className="text-muted-foreground block text-xs">Tipo</span>
                <span className="font-medium">{navio.tipo}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Bandeira</span>
                <span className="font-medium inline-flex items-center gap-1">
                  <Flag size={14} className="text-muted-foreground" /> {navio.bandeira}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Armador</span>
                <span className="font-medium truncate block" title={navio.armador}>{navio.armador}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Agente</span>
                <span className="font-medium truncate block" title={navio.agenteMaritimo}>{navio.agenteMaritimo}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Comprimento / Calado</span>
                <span className="font-medium">{navio.comprimento}m / {navio.calado}m</span>
              </div>
            </div>

            {(hasPermission('Navios:Editar') || hasPermission('Navios:Remover')) && (
              <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                {hasPermission('Navios:Editar') && (
                  <button onClick={() => abrirModal(navio)} className="btn-secondary flex-1 justify-center">
                    <Edit2 size={16} /> Editar
                  </button>
                )}
                {hasPermission('Navios:Remover') && (
                  <button 
                    onClick={() => {
                      setItemParaRemover(navio);
                      setConfirmModalAberto(true);
                    }} 
                    className="btn-danger p-2"
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={navioAtual ? 'Editar Navio' : 'Novo Navio'}
      >
        <form id="form-navio" onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome do Navio</label>
              <input name="nome" type="text" className="input" required defaultValue={navioAtual?.nome} />
            </div>
            <div>
              <label className="label">Número IMO</label>
              <input name="imo" type="text" className="input" required defaultValue={navioAtual?.imo} />
            </div>
            <div>
              <label className="label">Bandeira</label>
              <input name="bandeira" type="text" className="input" required defaultValue={navioAtual?.bandeira} />
            </div>
            <div>
              <label className="label">Tipo de Navio</label>
              <select name="tipo" className="select" required defaultValue={navioAtual?.tipo || 'Carga Geral'}>
                <option>Porta-Containers</option>
                <option>Graneleiro</option>
                <option>Carga Geral</option>
                <option>Ro-Ro</option>
                <option>Tanque</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="label">Capacidade TEUs</label>
              <input name="capacidadeTEUs" type="number" className="input" required defaultValue={navioAtual?.capacidadeTEUs || 0} />
            </div>
            <div>
              <label className="label">Comprimento (m)</label>
              <input name="comprimento" type="number" step="0.1" className="input" required defaultValue={navioAtual?.comprimento} />
            </div>
            <div>
              <label className="label">Calado (m)</label>
              <input name="calado" type="number" step="0.1" className="input" required defaultValue={navioAtual?.calado} />
            </div>
            <div className="col-span-2">
              <label className="label">Armador</label>
              <input name="armador" type="text" className="input" required defaultValue={navioAtual?.armador} />
            </div>
            <div className="col-span-2">
              <label className="label">Agente Marítimo</label>
              <input name="agenteMaritimo" type="text" className="input" required defaultValue={navioAtual?.agenteMaritimo} />
            </div>
            {navioAtual && (
              <div className="col-span-2">
                <label className="label">Status</label>
                <select name="status" className="select" defaultValue={navioAtual.status}>
                  <option>Esperado</option>
                  <option>Atracado</option>
                  <option>Em Operação</option>
                  <option>Partiu</option>
                </select>
              </div>
            )}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        aberto={confirmModalAberto}
        onFechar={() => {
          setConfirmModalAberto(false);
          setItemParaRemover(null);
        }}
        onConfirmar={() => itemParaRemover && remove(itemParaRemover.id)}
        titulo="Confirmar Remoção"
        mensagem="Tem a certeza que deseja remover este navio? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
