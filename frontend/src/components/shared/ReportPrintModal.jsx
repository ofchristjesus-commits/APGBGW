import { useState } from 'react';
import Modal from './Modal';
import { Calendar } from 'lucide-react';

export default function ReportPrintModal({ aberto, onFechar, onConfirmar, titulo = 'Imprimir Relatório' }) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmar({ dataInicio, dataFim });
    onFechar();
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={titulo} largura="480px">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Data de Início</label>
          <input
            type="date"
            className="input"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Data de Fim</label>
          <input
            type="date"
            className="input"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onFechar} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Imprimir</button>
        </div>
      </form>
    </Modal>
  );
}
