import { Plus, Printer } from 'lucide-react';

export default function PageHeader({ titulo, subtitulo, onAdd, textoBotao, onPrint, textoBotaoImprimir, onReforma, textoBotaoReforma, children }) {
  return (
    <div className="page-header no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{titulo}</h1>
        {subtitulo && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitulo}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end">
        {children}
        {onPrint && (
          <button onClick={onPrint} className="btn-secondary inline-flex items-center justify-center gap-2">
            <Printer size={18} />
            {textoBotaoImprimir || 'Imprimir Relatório'}
          </button>
        )}
        {onReforma && (
          <button onClick={onReforma} className="btn-primary inline-flex items-center justify-center gap-2">
            {textoBotaoReforma || 'Ver Mapa de Reforma'}
          </button>
        )}
        {onAdd && (
          <button onClick={onAdd} className="btn-primary inline-flex items-center justify-center gap-2">
            <Plus size={18} />
            {textoBotao || 'Adicionar'}
          </button>
        )}
      </div>
    </div>
  );
}
