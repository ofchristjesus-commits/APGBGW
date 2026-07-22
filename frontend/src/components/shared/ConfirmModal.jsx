import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ aberto, onFechar, onConfirmar, titulo, mensagem, textoConfirmar = 'Sim', textoCancelar = 'Não' }) {
  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={titulo || 'Confirmar Ação'} largura="400px">
      <div className="flex items-start gap-4 mb-6 mt-2">
        <div className="w-10 h-10 rounded-full bg-red-100/50 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div className="pt-2">
          <p className="text-sm text-foreground">{mensagem}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onFechar} className="btn-secondary">
          {textoCancelar}
        </button>
        <button type="button" onClick={() => { onConfirmar(); onFechar(); }} className="btn-danger">
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
