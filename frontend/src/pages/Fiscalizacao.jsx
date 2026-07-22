import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { Shield, FileText, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getCurrentYear } from '../lib/portUtils';

export default function Fiscalizacao() {
  const { items, create } = useEntity('fiscalizacoes');
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState({
    tipo: 'Inspeção de Segurança',
    local: '',
    dataHora: '',
    fiscalResponsavel: '',
    navioNome: '',
    descricao: '',
  });
  const [erro, setErro] = useState('');

  const filtrados = items.filter(f => 
    f.numAuto.toLowerCase().includes(pesquisa.toLowerCase()) || 
    f.tipo.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (f.navioNome && f.navioNome.toLowerCase().includes(pesquisa.toLowerCase()))
  );

  const gerarNumeroAuto = () => {
    const prefixo = 'FIS';
    const ano = getCurrentYear();
    const total = items.length + 1;
    return `${prefixo}-${ano}-${String(total).padStart(5, '0')}`;
  };

  const handleSalvar = () => {
    if (!form.local || !form.dataHora || !form.fiscalResponsavel || !form.descricao) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    create({
      numAuto: gerarNumeroAuto(),
      tipo: form.tipo,
      local: form.local,
      dataHora: form.dataHora,
      fiscalResponsavel: form.fiscalResponsavel,
      navioNome: form.navioNome || null,
      descricao: form.descricao,
      resultado: 'Pendente',
      acoesCorretivas: null,
      prazoRegularizacao: null,
    });

    setForm({
      tipo: 'Inspeção de Segurança',
      local: '',
      dataHora: '',
      fiscalResponsavel: '',
      navioNome: '',
      descricao: '',
    });
    setErro('');
    setModalAberto(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Fiscalização" 
        subtitulo="Registo de autos e inspeções" 
        onAdd={() => setModalAberto(true)}
        textoBotao="Agendar Fiscalização"
      />

      <div className="card p-4">
        <div className="max-w-md mb-4">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar nº auto, tipo ou navio..." />
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Auto</th>
                <th>Tipo</th>
                <th>Data/Hora</th>
                <th>Local / Navio</th>
                <th>Fiscal</th>
                <th>Resultado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(f => (
                <tr key={f.id}>
                  <td className="font-medium text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Shield size={16} />
                      {f.numAuto}
                    </div>
                  </td>
                  <td className="font-medium">{f.tipo}</td>
                  <td className="text-sm whitespace-nowrap">
                    {format(new Date(f.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </td>
                  <td>
                    <div className="text-sm">
                      <div className="font-medium">{f.local}</div>
                      {f.navioNome && <div className="text-muted-foreground mt-0.5">Navio: {f.navioNome}</div>}
                    </div>
                  </td>
                  <td className="text-sm">{f.fiscalResponsavel}</td>
                  <td>
                    {f.resultado === 'Conforme' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                        <CheckCircle size={14} /> Conforme
                      </span>
                    ) : f.resultado === 'Pendente' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">
                        <AlertTriangle size={14} /> Não Conforme
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn-ghost p-2" title="Ver Detalhes">
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-muted-foreground">Nenhuma fiscalização encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)} titulo="Agendar Fiscalização" largura="620px">
        <div className="space-y-4">
          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tipo de Fiscalização</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))}
                className="input w-full"
              >
                <option>Inspeção de Segurança</option>
                <option>Ambiental</option>
                <option>Documental</option>
                <option>Operacional</option>
              </select>
            </div>
            <div>
              <label className="label">Data e Hora</label>
              <input
                type="datetime-local"
                value={form.dataHora}
                onChange={(e) => setForm((prev) => ({ ...prev, dataHora: e.target.value }))}
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Local</label>
              <input
                type="text"
                value={form.local}
                onChange={(e) => setForm((prev) => ({ ...prev, local: e.target.value }))}
                className="input w-full"
                placeholder="Ex: Cais 2 - Zona Sul"
              />
            </div>
            <div>
              <label className="label">Fiscal Responsável</label>
              <input
                type="text"
                value={form.fiscalResponsavel}
                onChange={(e) => setForm((prev) => ({ ...prev, fiscalResponsavel: e.target.value }))}
                className="input w-full"
                placeholder="Nome do fiscal"
              />
            </div>
          </div>

          <div>
            <label className="label">Navio (opcional)</label>
            <input
              type="text"
              value={form.navioNome}
              onChange={(e) => setForm((prev) => ({ ...prev, navioNome: e.target.value }))}
              className="input w-full"
              placeholder="Ex: MV Atlantic Star"
            />
          </div>

          <div>
            <label className="label">Motivo da Fiscalização</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((prev) => ({ ...prev, descricao: e.target.value }))}
              className="input h-28 w-full resize-none"
              placeholder="Descreva o motivo da fiscalização"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary w-full sm:w-auto">Cancelar</button>
            <button type="button" onClick={handleSalvar} className="btn-primary w-full sm:w-auto">Salvar Fiscalização</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
