import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { Wrench, Plus, Calendar, FilePlus } from 'lucide-react';

export default function Oficina() {
  const { items, create } = useEntity('equipamentos');
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [registroAtual, setRegistroAtual] = useState(null);

  const filtrados = items.filter(eq =>
    eq.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    eq.codigo.toLowerCase().includes(pesquisa.toLowerCase()) ||
    eq.status.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const abrirModal = (equipamento = null) => {
    setRegistroAtual(equipamento);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setRegistroAtual(null);
    setModalAberto(false);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = {
      nome: formData.get('nome'),
      codigo: formData.get('codigo'),
      tipo: formData.get('tipo'),
      capacidade: formData.get('capacidade'),
      status: formData.get('status'),
      dataManutencao: formData.get('dataManutencao'),
      proximaManutencao: formData.get('proximaManutencao'),
      operadorAtual: formData.get('operadorAtual'),
      horasOperacao: Number(formData.get('horasOperacao') || 0),
    };

    if (registroAtual?.id) {
      // Atualização via useEntity ainda não expõe update aqui, manter apenas criação para demo
      create({ ...registroAtual, ...dados });
    } else {
      create(dados);
    }

    fecharModal();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Oficina"
        subtitulo="Registar máquinas em manutenção"
        onAdd={() => abrirModal()}
        textoBotao="Registar Máquina"
      />

      <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-0 rounded-b-none">
        <div className="w-full sm:max-w-md">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar máquina, código ou estado..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrados.map(eq => (
          <div key={eq.id} className="card p-5 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold">{eq.nome}</h3>
                <p className="text-xs text-muted-foreground">{eq.codigo} • {eq.tipo}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={eq.status} />
              </div>
            </div>
            <div className="space-y-3 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Última Manutenção</p>
                <p>{eq.dataManutencao || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Próxima Manutenção</p>
                <p>{eq.proximaManutencao || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Operador</p>
                <p>{eq.operadorAtual || '-'}</p>
              </div>
            </div>
            <button onClick={() => abrirModal(eq)} className="btn-secondary w-full justify-center inline-flex items-center gap-2">
              <FilePlus size={16} /> Atualizar
            </button>
          </div>
        ))}
      </div>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={registroAtual ? 'Editar Máquina' : 'Registar Máquina'}>
        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome</label>
              <input name="nome" className="input" defaultValue={registroAtual?.nome || ''} required />
            </div>
            <div>
              <label className="label">Código</label>
              <input name="codigo" className="input" defaultValue={registroAtual?.codigo || ''} required />
            </div>
            <div>
              <label className="label">Tipo</label>
              <input name="tipo" className="input" defaultValue={registroAtual?.tipo || ''} />
            </div>
            <div>
              <label className="label">Capacidade</label>
              <input name="capacidade" className="input" defaultValue={registroAtual?.capacidade || ''} />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" defaultValue={registroAtual?.status || 'Em Manutenção'}>
                <option>Operacional</option>
                <option>Em Manutenção</option>
                <option>Avariado</option>
              </select>
            </div>
            <div>
              <label className="label">Data de Manutenção</label>
              <input name="dataManutencao" type="date" className="input" defaultValue={registroAtual?.dataManutencao || ''} />
            </div>
            <div>
              <label className="label">Próxima Manutenção</label>
              <input name="proximaManutencao" type="date" className="input" defaultValue={registroAtual?.proximaManutencao || ''} />
            </div>
            <div>
              <label className="label">Operador Atual</label>
              <input name="operadorAtual" className="input" defaultValue={registroAtual?.operadorAtual || ''} />
            </div>
            <div>
              <label className="label">Horas de Operação</label>
              <input name="horasOperacao" type="number" min="0" className="input" defaultValue={registroAtual?.horasOperacao || 0} />
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
