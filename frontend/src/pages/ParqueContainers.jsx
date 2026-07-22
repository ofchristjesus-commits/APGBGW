import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import Modal from '../components/shared/Modal';
import StatusBadge from '../components/shared/StatusBadge';
import { useEntity } from '../hooks/useEntity';
import { Container, Map, AlertTriangle } from 'lucide-react';

export default function ParqueContainers() {
  const { items, create, update } = useEntity('containers');
  const [pesquisa, setPesquisa] = useState('');
  const [tabAtiva, setTabAtiva] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [containerAtual, setContainerAtual] = useState(null);
  const [modalInspecaoAberto, setModalInspecaoAberto] = useState(false);
  const [containerParaInspecao, setContainerParaInspecao] = useState(null);

  const tabs = ['Todos', 'No Parque', 'Em Trânsito', 'Liberado', 'Retido'];

  const filtrados = items.filter(c => {
    const matchTab = tabAtiva === 'Todos' || c.status === tabAtiva;
    const matchSearch = c.numContainer.toLowerCase().includes(pesquisa.toLowerCase()) || 
                        c.consignatario.toLowerCase().includes(pesquisa.toLowerCase());
    return matchTab && matchSearch;
  });

  const abrirModal = (container = null) => {
    setContainerAtual(container);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setContainerAtual(null);
    setModalAberto(false);
  };

  const handleSalvarContainer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = {
      numContainer: formData.get('numContainer'),
      tipo: formData.get('tipo'),
      consignatario: formData.get('consignatario'),
      navioNome: formData.get('navioNome'),
      bloco: formData.get('bloco'),
      fila: formData.get('fila'),
      nivel: formData.get('nivel'),
      dataEntrada: formData.get('dataEntrada'),
      status: formData.get('status'),
      peso: Number(formData.get('peso') || 0),
      descricaoCarga: formData.get('descricaoCarga'),
      tipoMercadoria: formData.get('tipoMercadoria'),
      volumes: Number(formData.get('volumes') || 0),
      pesoDeclarado: Number(formData.get('pesoDeclarado') || 0),
      pesoConferido: Number(formData.get('pesoConferido') || 0),
      observacoesCarga: formData.get('observacoesCarga'),
      condicao: formData.get('condicao'),
    };

    if (containerAtual?.id) {
      update(containerAtual.id, dados);
    } else {
      create(dados);
    }

    fecharModal();
  };

  const handleMovimentar = (container) => {
    update(container.id, { status: 'Em Trânsito' });
  };

  const handleInspecionar = (container) => {
    setContainerParaInspecao(container);
    setModalInspecaoAberto(true);
  };

  const handleValidarConforme = (container) => {
    update(container.id, {
      condicao: 'Inspecionado',
      ultimaInspecao: new Date().toISOString(),
      ultimaInspecaoResultado: 'Conforme',
    });
    setModalInspecaoAberto(false);
    setContainerParaInspecao(null);
  };

  const fecharModalInspecao = () => {
    setModalInspecaoAberto(false);
    setContainerParaInspecao(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Serviço de Parque" 
        subtitulo="Gestão do parque, localização e estado dos contentores" 
        onAdd={() => abrirModal()}
        textoBotao="Registar Contentor"
      />

      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-0 rounded-b-none">
        <div className="w-full sm:max-w-md">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar nº contentor ou consignatário..." />
        </div>
      </div>

      <div className="tabs px-4 bg-card border-x border-b border-border rounded-b-xl -mt-6 pt-2">
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

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={containerAtual ? 'Editar Contentor' : 'Registar Contentor'}>
        <form onSubmit={handleSalvarContainer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Número de Contentor</label>
              <input name="numContainer" className="input" defaultValue={containerAtual?.numContainer || ''} required />
            </div>
            <div>
              <label className="label">Tipo</label>
              <input name="tipo" className="input" defaultValue={containerAtual?.tipo || ''} />
            </div>
            <div>
              <label className="label">Consignatário</label>
              <input name="consignatario" className="input" defaultValue={containerAtual?.consignatario || ''} />
            </div>
            <div>
              <label className="label">Navio / Viagem</label>
              <input name="navioNome" className="input" defaultValue={containerAtual?.navioNome || ''} />
            </div>
            <div>
              <label className="label">Localização - Bloco</label>
              <input name="bloco" className="input" defaultValue={containerAtual?.bloco || ''} />
            </div>
            <div>
              <label className="label">Fila</label>
              <input name="fila" className="input" defaultValue={containerAtual?.fila || ''} />
            </div>
            <div>
              <label className="label">Nível</label>
              <input name="nivel" className="input" defaultValue={containerAtual?.nivel || ''} />
            </div>
            <div>
              <label className="label">Data de Entrada</label>
              <input name="dataEntrada" type="date" className="input" defaultValue={containerAtual?.dataEntrada || ''} />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" defaultValue={containerAtual?.status || 'No Parque'}>
                <option>No Parque</option>
                <option>Em Trânsito</option>
                <option>Liberado</option>
                <option>Retido</option>
              </select>
            </div>
            <div>
              <label className="label">Peso (Kg)</label>
              <input name="peso" type="number" className="input" defaultValue={containerAtual?.peso || ''} />
            </div>
            <div>
              <label className="label">Descrição da Mercadoria</label>
              <input name="descricaoCarga" className="input" defaultValue={containerAtual?.descricaoCarga || ''} />
            </div>
            <div>
              <label className="label">Tipo de Mercadoria</label>
              <input name="tipoMercadoria" className="input" defaultValue={containerAtual?.tipoMercadoria || ''} />
            </div>
            <div>
              <label className="label">Volumes</label>
              <input name="volumes" type="number" className="input" defaultValue={containerAtual?.volumes || ''} />
            </div>
            <div>
              <label className="label">Peso Declarado (Kg)</label>
              <input name="pesoDeclarado" type="number" className="input" defaultValue={containerAtual?.pesoDeclarado || ''} />
            </div>
            <div>
              <label className="label">Peso Conferido (Kg)</label>
              <input name="pesoConferido" type="number" className="input" defaultValue={containerAtual?.pesoConferido || ''} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Observações da Carga</label>
              <textarea name="observacoesCarga" className="input min-h-[96px]" defaultValue={containerAtual?.observacoesCarga || ''} />
            </div>
            <div>
              <label className="label">Condição</label>
              <select name="condicao" className="select" defaultValue={containerAtual?.condicao || 'Bom'}>
                <option>Bom</option>
                <option>Inspecionado</option>
                <option>Danificado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Contentor</button>
          </div>
        </form>
      </Modal>

      <Modal aberto={modalInspecaoAberto} onFechar={fecharModalInspecao} titulo="Inspeção de Contentor">
        {containerParaInspecao ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-xs">Nº Contentor</span>
                <p className="font-medium">{containerParaInspecao.numContainer}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Tipo</span>
                <p className="font-medium">{containerParaInspecao.tipo || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Consignatário</span>
                <p className="font-medium">{containerParaInspecao.consignatario || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Navio / Viagem</span>
                <p className="font-medium">{containerParaInspecao.navioNome || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Localização</span>
                <p className="font-medium">{containerParaInspecao.bloco}-{containerParaInspecao.fila}-{containerParaInspecao.nivel}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Status</span>
                <p className="font-medium">{containerParaInspecao.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Peso</span>
                <p className="font-medium">{containerParaInspecao.peso ? `${containerParaInspecao.peso.toLocaleString()} Kg` : '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Condição Atual</span>
                <p className="font-medium">{containerParaInspecao.condicao || '—'}</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-semibold mb-2">Dados da Mercadoria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Descrição</span>
                  <p className="font-medium">{containerParaInspecao.descricaoCarga || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Tipo de Mercadoria</span>
                  <p className="font-medium">{containerParaInspecao.tipoMercadoria || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Volumes</span>
                  <p className="font-medium">{containerParaInspecao.volumes || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Peso Declarado</span>
                  <p className="font-medium">{containerParaInspecao.pesoDeclarado ? `${containerParaInspecao.pesoDeclarado.toLocaleString()} Kg` : '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Peso Conferido</span>
                  <p className="font-medium">{containerParaInspecao.pesoConferido ? `${containerParaInspecao.pesoConferido.toLocaleString()} Kg` : '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground text-xs">Observações</span>
                  <p className="font-medium">{containerParaInspecao.observacoesCarga || '—'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModalInspecao} className="btn-secondary">Fechar</button>
              <button type="button" onClick={() => handleValidarConforme(containerParaInspecao)} className="btn-primary">Conforme</button>
            </div>
          </div>
        ) : null}
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrados.map(c => (
          <div key={c.id} className={`card p-5 border-l-4 ${c.status === 'Retido' ? 'border-l-red-500' : c.status === 'Liberado' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
                  <Container size={20} />
                </div>
                <div>
                  <h3 className="font-bold font-mono tracking-wider text-lg leading-tight">{c.numContainer}</h3>
                  <span className="text-xs text-muted-foreground">{c.tipo} • {c.peso?.toLocaleString() || 0} Kg</span>
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="col-span-2">
                <span className="text-muted-foreground block text-xs">Consignatário</span>
                <span className="font-medium truncate block">{c.consignatario}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block text-xs">Navio / Viagem</span>
                <span className="font-medium truncate block">{c.navioNome}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block text-xs">Carga</span>
                <span className="font-medium truncate block">{c.descricaoCarga || 'Não registada'} • {c.tipoMercadoria || 'Sem tipo'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Peso Declarado</span>
                <span className="font-medium block">{c.pesoDeclarado ? `${c.pesoDeclarado.toLocaleString()} Kg` : '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Peso Conferido</span>
                <span className="font-medium block">{c.pesoConferido ? `${c.pesoConferido.toLocaleString()} Kg` : '—'}</span>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Localização no Parque</span>
                <div className="flex items-center gap-1.5 font-mono text-sm bg-background px-2 py-1 rounded border border-border inline-flex">
                  <Map size={14} className="text-primary" />
                  {c.bloco}-{c.fila}-{c.nivel}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Condição Física</span>
                <div className="flex items-center gap-1.5 text-sm">
                  {c.condicao === 'Bom' ? (
                    <span className="text-green-600 font-medium">Bom Estado</span>
                  ) : (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <AlertTriangle size={14} /> {c.condicao}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs block mb-1">Última Inspeção</span>
                <span className="font-medium block">{c.ultimaInspecao ? new Date(c.ultimaInspecao).toLocaleString() : 'Ainda não inspecionado'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-xs block mb-1">Resultado da Inspeção</span>
                <span className="font-medium block">{c.ultimaInspecaoResultado || '—'}</span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button onClick={() => handleMovimentar(c)} className="btn-secondary flex-1">Movimentar</button>
              <button onClick={() => handleInspecionar(c)} className="btn-secondary flex-1">Inspecionar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
