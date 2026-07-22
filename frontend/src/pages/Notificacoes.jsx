import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import ConfirmModal from '../components/shared/ConfirmModal';
import { useEntity } from '../hooks/useEntity';
import { getNotifIcon } from '../lib/portUtils';
import { Trash2, CheckCircle2, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Notificacoes() {
  const { items, update, remove } = useEntity('notificacoes');
  const [tabAtiva, setTabAtiva] = useState('Todas');
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);

  const notificacoes = items.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
  
  const filtradas = notificacoes.filter(n => {
    if (tabAtiva === 'Não Lidas') return !n.lida;
    return true;
  });

  const marcarComoLida = (id) => {
    update(id, { lida: true });
  };

  const marcarTodasLidas = () => {
    const naoLidas = items.filter(n => !n.lida);
    naoLidas.forEach(n => update(n.id, { lida: true }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Notificações</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Avisos e alertas do sistema</p>
        </div>
        <button 
          onClick={marcarTodasLidas} 
          disabled={items.filter(n => !n.lida).length === 0}
          className="btn-secondary whitespace-nowrap"
        >
          <CheckSquare size={16} /> Marcar todas como lidas
        </button>
      </div>

      <div className="tabs border-b-2">
        {['Todas', 'Não Lidas'].map(tab => (
          <button
            key={tab}
            className={`tab ${tabAtiva === tab ? 'active' : ''}`}
            onClick={() => setTabAtiva(tab)}
          >
            {tab}
            {tab === 'Não Lidas' && items.filter(n => !n.lida).length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-primary text-white text-[10px] rounded-full">
                {items.filter(n => !n.lida).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtradas.map(n => (
          <div 
            key={n.id} 
            className={`card p-4 flex gap-4 transition-all ${
              n.lida ? 'bg-card border-border opacity-75' : 'bg-primary/5 border-primary/20 ring-1 ring-primary/20 shadow-md'
            }`}
          >
            <div className="text-2xl pt-1 shrink-0">
              {getNotifIcon(n.tipo)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {!n.lida && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                <h4 className={`font-semibold text-base ${n.lida ? 'text-foreground' : 'text-primary'}`}>
                  {n.titulo}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium ml-auto">
                  {n.modulo}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {n.mensagem}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{format(new Date(n.dataCriacao), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                <div className="flex items-center gap-3">
                  {!n.lida && (
                    <button 
                      onClick={() => marcarComoLida(n.id)}
                      className="text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      <CheckCircle2 size={14} /> Marcar lida
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setItemParaRemover(n);
                      setConfirmModalAberto(true);
                    }}
                    className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtradas.length === 0 && (
          <div className="text-center py-12 card border-dashed">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-lg font-medium">Caixa Vazia</h3>
            <p className="text-muted-foreground">Não há {tabAtiva === 'Não Lidas' ? 'novas notificações' : 'notificações'}.</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        aberto={confirmModalAberto}
        onFechar={() => {
          setConfirmModalAberto(false);
          setItemParaRemover(null);
        }}
        onConfirmar={() => itemParaRemover && remove(itemParaRemover.id)}
        titulo="Remover Notificação"
        mensagem="Tem a certeza que deseja remover esta notificação?"
      />
    </div>
  );
}
