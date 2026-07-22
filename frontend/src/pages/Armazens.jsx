import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import StatusBadge from '../components/shared/StatusBadge';
import { useEntity } from '../hooks/useEntity';
import Modal from '../components/shared/Modal';
import { Warehouse, MapPin, Box } from 'lucide-react';

export default function Armazens() {
  const { items, create } = useEntity('armazens');
  const [modalAberto, setModalAberto] = useState(false);
  const [armazenAtual, setArmazenAtual] = useState(null);

  const abrirModal = (a = null) => {
    setArmazenAtual(a);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setArmazenAtual(null);
    setModalAberto(false);
  };

  const salvar = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const dados = {
      nome: form.get('nome'),
      codigo: form.get('codigo'),
      tipo: form.get('tipo'),
      capacidade: Number(form.get('capacidade') || 0),
      localizacao: form.get('localizacao'),
      status: form.get('status') || 'Ativo',
      ocupacaoAtual: 0,
    };

    create(dados);
    fecharModal();
  };

  return (
    <div className="space-y-6">
      <PageHeader titulo="Armazéns" subtitulo="Gestão de armazéns e áreas de armazenagem" onAdd={() => abrirModal()} textoBotao="Novo Armazém" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(armazem => {
          const ocupacao = armazem.capacidade ? Math.round((armazem.ocupacaoAtual / armazem.capacidade) * 100) : 0;
          const estaLotado = ocupacao >= 95;
          const status = estaLotado ? 'Lotado' : 'Disponível';

          return (
            <div key={armazem.id} className="card p-5 flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b border-border pb-4">
                <div className="flex gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                    <Warehouse size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{armazem.nome}</h3>
                    <span className="text-xs font-mono text-muted-foreground">{armazem.codigo}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Box size={14} />
                  <span>Tipo: <span className="font-medium text-foreground">{armazem.tipo}</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={14} />
                  <span><span className="font-medium text-foreground">{armazem.localizacao}</span></span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium">Ocupação</span>
                  <span className="text-2xl font-bold font-mono leading-none">{ocupacao}%</span>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${ocupacao}%`,
                      background: ocupacao > 90 ? '#ef4444' : ocupacao > 70 ? '#f59e0b' : undefined 
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{(armazem.ocupacaoAtual || 0).toLocaleString()} m² ocupados</span>
                  <span>{(armazem.capacidade || 0).toLocaleString()} m² total</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <StatusBadge status={status} />
                <button onClick={() => abrirModal(armazem)} className="text-sm text-primary font-medium hover:underline">Editar →</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={armazenAtual ? 'Editar Armazém' : 'Novo Armazém'}>
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className="label">Nome</label>
            <input name="nome" className="input" defaultValue={armazenAtual?.nome || ''} required />
          </div>
          <div>
            <label className="label">Código</label>
            <input name="codigo" className="input" defaultValue={armazenAtual?.codigo || ''} />
          </div>
          <div>
            <label className="label">Tipo</label>
            <input name="tipo" className="input" defaultValue={armazenAtual?.tipo || ''} />
          </div>
          <div>
            <label className="label">Capacidade</label>
            <input name="capacidade" type="number" className="input" defaultValue={armazenAtual?.capacidade || 0} />
          </div>
          <div>
            <label className="label">Localização</label>
            <input name="localizacao" className="input" defaultValue={armazenAtual?.localizacao || ''} />
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
