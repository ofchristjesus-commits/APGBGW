import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';

const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(valor || 0);

export default function HorasExtras() {
  const { items: pagamentos, create: criarPagamento } = useEntity('pagamentos');
  const { items: funcionariosBase } = useEntity('funcionarios');

  const [pesquisa, setPesquisa] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [modalRegistoAberto, setModalRegistoAberto] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  const [horasExtras, setHorasExtras] = useState('');
  const [valorHora, setValorHora] = useState('');
  const [dataRegistro, setDataRegistro] = useState(new Date().toISOString().slice(0, 10));
  const [observacoes, setObservacoes] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const funcionariosAtivos = useMemo(
    () => funcionariosBase.filter((funcionario) => funcionario.status === 'Ativo'),
    [funcionariosBase]
  );

  const funcionarioSelecionadoObjeto = useMemo(
    () => funcionariosAtivos.find((funcionario) => funcionario.id === Number(funcionarioSelecionado)) || null,
    [funcionariosAtivos, funcionarioSelecionado]
  );

  const valorTotalHorasExtras = useMemo(() => {
    const horas = Number(horasExtras || 0);
    const valor = Number(valorHora || 0);
    return horas > 0 && valor > 0 ? horas * valor : 0;
  }, [horasExtras, valorHora]);

  const registrosFiltrados = useMemo(() => {
    const pesquisaTexto = pesquisa.trim().toLowerCase();
    return pagamentos.filter((pagamento) => {
      const correspondePesquisa =
        pagamento.nome?.toLowerCase().includes(pesquisaTexto) ||
        pagamento.perfil?.toLowerCase().includes(pesquisaTexto) ||
        pagamento.observacoes?.toLowerCase().includes(pesquisaTexto);

      if (!correspondePesquisa) return false;

      if (filtroDataInicio) {
        const dataInicio = new Date(filtroDataInicio);
        const dataRegistroDate = new Date(pagamento.data);
        if (dataRegistroDate < dataInicio) return false;
      }

      if (filtroDataFim) {
        const dataFim = new Date(filtroDataFim);
        const dataRegistroDate = new Date(pagamento.data);
        if (dataRegistroDate > dataFim) return false;
      }

      return true;
    });
  }, [pagamentos, pesquisa, filtroDataInicio, filtroDataFim]);

  const handleRegistarHorasExtras = (event) => {
    event.preventDefault();
    if (!funcionarioSelecionadoObjeto || !horasExtras || !valorHora || !dataRegistro) return;

    criarPagamento({
      funcionarioId: funcionarioSelecionadoObjeto.id,
      nome: funcionarioSelecionadoObjeto.nome,
      perfil: funcionarioSelecionadoObjeto.categoria,
      horasExtras: Number(horasExtras),
      valorHora: Number(valorHora),
      valorHorasExtras: valorTotalHorasExtras,
      valorTotal: valorTotalHorasExtras,
      contribuicaoSocial: 0,
      data: dataRegistro,
      status: 'Pendente',
      observacoes: observacoes.trim(),
    });

    setModalRegistoAberto(false);
    setFuncionarioSelecionado('');
    setHorasExtras('');
    setValorHora('');
    setDataRegistro(new Date().toISOString().slice(0, 10));
    setObservacoes('');
    setMensagemSucesso('Horas extras registadas com sucesso.');
    window.setTimeout(() => setMensagemSucesso(''), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Horas Extras"
        subtitulo="Registe horas extras e consulte o histórico por data."
        onAdd={() => setModalRegistoAberto(true)}
        textoBotao="Registar Horas Extras"
      />

      <div className="card p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-1/2">
          <SearchInput
            value={pesquisa}
            onChange={setPesquisa}
            placeholder="Pesquisar por funcionário, cargo ou observações..."
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:w-[min(720px,100%)]">
          <label className="text-sm font-medium text-foreground flex flex-col gap-2">
            Data Inicial
            <input
              type="date"
              className="input"
              value={filtroDataInicio}
              onChange={(event) => setFiltroDataInicio(event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-foreground flex flex-col gap-2">
            Data Final
            <input
              type="date"
              className="input"
              value={filtroDataFim}
              onChange={(event) => setFiltroDataFim(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="card p-5 overflow-auto">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Histórico de Horas Extras</h2>
            <p className="text-sm text-muted-foreground">Aqui ficam registadas todas as horas extras lançadas no sistema.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {registrosFiltrados.length} registro(s) encontrados
          </div>
        </div>

        {registrosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Nenhum registro de horas extras encontrado com os critérios selecionados.
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Data</th>
                <th>Funcionário</th>
                <th>Perfil</th>
                <th>Horas Extras</th>
                <th>Valor/Hora</th>
                <th>Total</th>
                <th>Status</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((pagamento) => (
                <tr key={pagamento.id}>
                  <td>{pagamento.data}</td>
                  <td>{pagamento.nome}</td>
                  <td>{pagamento.perfil}</td>
                  <td>{pagamento.horasExtras}h</td>
                  <td>{formatarMoeda(pagamento.valorHora)}</td>
                  <td>{formatarMoeda(pagamento.valorHorasExtras)}</td>
                  <td><StatusBadge status={pagamento.status} /></td>
                  <td>{pagamento.observacoes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        aberto={modalRegistoAberto}
        onFechar={() => setModalRegistoAberto(false)}
        titulo="Registar Horas Extras"
        largura="640px"
      >
        <form onSubmit={handleRegistarHorasExtras} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-foreground flex flex-col gap-2">
              Funcionário
              <select
                className="select"
                value={funcionarioSelecionado}
                onChange={(event) => setFuncionarioSelecionado(event.target.value)}
                required
              >
                <option value="">Selecione um funcionário</option>
                {funcionariosAtivos.map((funcionario) => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome} — {funcionario.categoria}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-foreground flex flex-col gap-2">
              Data do registo
              <input
                type="date"
                className="input"
                value={dataRegistro}
                onChange={(event) => setDataRegistro(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm font-medium text-foreground flex flex-col gap-2">
              Horas extras
              <input
                type="number"
                className="input"
                min="0"
                step="0.5"
                value={horasExtras}
                onChange={(event) => setHorasExtras(event.target.value)}
                placeholder="Ex: 2.5"
                required
              />
            </label>

            <label className="text-sm font-medium text-foreground flex flex-col gap-2">
              Valor por hora
              <input
                type="number"
                className="input"
                min="0"
                step="100"
                value={valorHora}
                onChange={(event) => setValorHora(event.target.value)}
                placeholder="Ex: 4500"
                required
              />
            </label>

            <div className="text-sm font-medium text-foreground flex flex-col gap-2">
              Total estimado
              <div className="rounded-xl border border-border bg-surface p-3 text-foreground">
                {formatarMoeda(valorTotalHorasExtras)}
              </div>
            </div>
          </div>

          <label className="text-sm font-medium text-foreground flex flex-col gap-2">
            Observações
            <textarea
              className="input min-h-[100px]"
              value={observacoes}
              onChange={(event) => setObservacoes(event.target.value)}
              placeholder="Notas adicionais sobre este registo (opcional)"
            />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalRegistoAberto(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Registar
            </button>
          </div>
        </form>
      </Modal>

      {mensagemSucesso && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {mensagemSucesso}
        </div>
      )}
    </div>
  );
}
