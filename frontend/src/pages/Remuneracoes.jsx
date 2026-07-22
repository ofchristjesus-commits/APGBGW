import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatsCard from '../components/shared/StatsCard';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { Shield, Wallet, Clock3, UserCheck, Printer } from 'lucide-react';

const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(valor || 0);

export default function Remuneracoes() {
  const { items: pagamentos, create: criarPagamento, update: atualizarPagamento } = useEntity('pagamentos');
  const { items: funcionariosBase } = useEntity('funcionarios');
  const { items: reformas } = useEntity('reformas');

  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroFuncionario, setFiltroFuncionario] = useState('');
  const [modalProcessamentoAberto, setModalProcessamentoAberto] = useState(false);
  const [modalReformaAberto, setModalReformaAberto] = useState(false);
  const [bancoSelecionado, setBancoSelecionado] = useState('');
  const [mesProcessamento, setMesProcessamento] = useState(new Date().toISOString().slice(0, 7));
  const [valorProcessamento, setValorProcessamento] = useState('');
  const [resultadoProcessamento, setResultadoProcessamento] = useState(null);
  const [pagamentosProcessadosId, setPagamentosProcessadosId] = useState([]);
  const [idadeReforma, setIdadeReforma] = useState(60);

  const funcionarios = useMemo(
    () => [...new Set([...pagamentos.map((p) => p.nome), ...funcionariosBase.map((f) => f.nome)])].sort(),
    [pagamentos, funcionariosBase]
  );

  const funcionariosAtivos = useMemo(
    () => funcionariosBase.filter((funcionario) => funcionario.status === 'Ativo'),
    [funcionariosBase]
  );

  const bancosDisponiveis = useMemo(
    () => [...new Set(funcionariosAtivos.map((funcionario) => funcionario.banco).filter(Boolean))].sort(),
    [funcionariosAtivos]
  );

  const funcionariosPorBanco = useMemo(
    () => funcionariosAtivos.filter((funcionario) => funcionario.banco === bancoSelecionado),
    [funcionariosAtivos, bancoSelecionado]
  );

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);
    const nascimento = new Date(ano, mes - 1, dia);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    if (hoje.getMonth() < nascimento.getMonth() || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
      idade -= 1;
    }
    return idade;
  };

  const funcionariosParaReforma = useMemo(
    () => funcionariosBase.filter((funcionario) => {
      const idade = calcularIdade(funcionario.dataNascimento);
      return idade !== null && idade >= idadeReforma;
    }),
    [funcionariosBase, idadeReforma]
  );

  const itensFiltrados = pagamentos.filter((pagamento) => {
    const pesquisaTexto = pesquisa.trim().toLowerCase();
    const correspondePesquisa =
      pagamento.nome.toLowerCase().includes(pesquisaTexto) ||
      pagamento.perfil.toLowerCase().includes(pesquisaTexto);
    const correspondeStatus = !filtroStatus || pagamento.status === filtroStatus;
    const correspondeFuncionario = !filtroFuncionario || pagamento.nome === filtroFuncionario;
    return correspondePesquisa && correspondeStatus && correspondeFuncionario;
  });

  const totalContribuicoes = pagamentos.reduce((acc, pagamento) => acc + (pagamento.contribuicaoSocial || 0), 0);
  const totalHorasExtras = pagamentos.reduce((acc, pagamento) => acc + (pagamento.horasExtras || 0), 0);
  const pagos = pagamentos.filter((pagamento) => pagamento.status === 'Pago').length;

  const handleProcessarSalario = (event) => {
    event.preventDefault();

    if (!bancoSelecionado) return;

    const selecionados = funcionariosPorBanco;
    if (selecionados.length === 0) return;

    const idsProcessados = [];
    selecionados.forEach((funcionario) => {
      const valorBase = Number(valorProcessamento || funcionario.salarioBase || 0);
      const contribuicaoSocial = Math.round(valorBase * 0.08);
      const pagamentoCriado = criarPagamento({
        funcionarioId: funcionario.id,
        nome: funcionario.nome,
        perfil: funcionario.categoria,
        horasExtras: 0,
        valorHorasExtras: 0,
        valorTotal: valorBase,
        contribuicaoSocial,
        data: mesProcessamento,
        status: 'Pendente',
      });
      if (pagamentoCriado?.id) {
        idsProcessados.push(pagamentoCriado.id);
      }
    });

    setResultadoProcessamento({
      banco: bancoSelecionado,
      funcionarios: selecionados.map((funcionario) => funcionario.nome),
      total: selecionados.length,
    });
    setPagamentosProcessadosId(idsProcessados);
    setValorProcessamento('');
    setMesProcessamento(new Date().toISOString().slice(0, 7));
  };

  const pagarProcessados = () => {
    pagamentosProcessadosId.forEach((id) => {
      atualizarPagamento(id, { status: 'Pago' });
    });
    setPagamentosProcessadosId([]);
    setResultadoProcessamento((prev) => prev ? { ...prev, pago: true } : null);
  };

  const handleImprimirHistorico = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Remunerações e Segurança Social"
        subtitulo="Acompanhe pagamentos, horas extra e contribuições sociais do pessoal."
        onReforma={() => setModalReformaAberto(true)}
        textoBotaoReforma="Mapa de Reforma"
        onAdd={() => setModalProcessamentoAberto(true)}
        textoBotao="Processar Salário"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard titulo="Total de Pagamentos" valor={pagamentos.length} icone={Wallet} cor="blue" />
        <StatsCard titulo="Pagamentos Efetuados" valor={pagos} icone={UserCheck} cor="green" />
        <StatsCard titulo="Horas Extras" valor={`${totalHorasExtras}h`} icone={Clock3} cor="amber" />
        <StatsCard titulo="Contribuições Sociais" valor={formatarMoeda(totalContribuicoes)} icone={Shield} cor="violet" />
      </div>

      <div className="card p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-1/2">
          <SearchInput
            value={pesquisa}
            onChange={setPesquisa}
            placeholder="Pesquisar por funcionário ou cargo..."
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            className="select"
            value={filtroFuncionario}
            onChange={(e) => setFiltroFuncionario(e.target.value)}
          >
            <option value="">Todos Funcionários</option>
            {funcionarios.map((nome) => (
              <option key={nome} value={nome}>{nome}</option>
            ))}
          </select>
          <select
            className="select"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os Status</option>
            <option value="Pago">Pago</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>
      </div>

      <div className="card p-5 overflow-auto">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Histórico de Pagamentos</h2>
            <p className="text-sm text-muted-foreground">Consulte e imprima o histórico de processamento salarial.</p>
          </div>
          <button type="button" onClick={handleImprimirHistorico} className="btn-secondary inline-flex items-center justify-center gap-2">
            <Printer size={18} />
            Imprimir Histórico
          </button>
        </div>
        {itensFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Nenhum pagamento encontrado com os critérios selecionados.
          </div>
        ) : (
          <table className="table w-full">
            <thead>
              <tr>
                <th>Funcionário</th>
                <th>Perfil</th>
                <th>Horas Extra</th>
                <th>Valor Horas Extra</th>
                <th>Contribuição Social</th>
                <th>Valor Total</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map((pagamento) => (
                <tr key={pagamento.id}>
                  <td>{pagamento.nome}</td>
                  <td>{pagamento.perfil}</td>
                  <td>{pagamento.horasExtras}h</td>
                  <td>{formatarMoeda(pagamento.valorHorasExtras)}</td>
                  <td>{formatarMoeda(pagamento.contribuicaoSocial)}</td>
                  <td>{formatarMoeda(pagamento.valorTotal)}</td>
                  <td>{pagamento.data}</td>
                  <td><StatusBadge status={pagamento.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        aberto={modalReformaAberto}
        onFechar={() => setModalReformaAberto(false)}
        titulo="Mapa de Reforma"
        largura="720px"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Defina a idade de reforma</p>
              <p className="text-sm text-muted-foreground">O sistema comparará essa idade com a data de nascimento de todos os funcionários.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-foreground">Idade de Reforma</label>
              <input
                type="number"
                className="input w-24"
                min="50"
                max="80"
                value={idadeReforma}
                onChange={(event) => setIdadeReforma(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">Funcionários que já atingiram ou excedem a idade de reforma</p>
            {funcionariosParaReforma.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                {funcionariosParaReforma.map((funcionario) => (
                  <li key={funcionario.id}>
                    {funcionario.nome} — {calcularIdade(funcionario.dataNascimento)} anos
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhum funcionário atingiu a idade de reforma definida.</p>
            )}
          </div>

          <div className="space-y-3">
            {reformas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem trabalhadores em reforma registados.</p>
            ) : (
              reformas.map((reforma) => (
                <div key={reforma.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{reforma.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {reforma.idade} anos · Nascido em {reforma.dataNascimento}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {reforma.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        aberto={modalProcessamentoAberto}
        onFechar={() => setModalProcessamentoAberto(false)}
        titulo="Processar Salário"
        largura="640px"
      >
        <form onSubmit={handleProcessarSalario} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-foreground flex flex-col gap-2">
              Banco
              <select
                className="select"
                value={bancoSelecionado}
                onChange={(event) => {
                  setBancoSelecionado(event.target.value);
                  setResultadoProcessamento(null);
                }}
                required
              >
                <option value="">Selecione o banco</option>
                {bancosDisponiveis.map((banco) => (
                  <option key={banco} value={banco}>
                    {banco}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-foreground flex flex-col gap-2">
              Mês de processamento
              <input
                type="month"
                className="input"
                value={mesProcessamento}
                onChange={(event) => setMesProcessamento(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="text-sm font-medium text-foreground flex flex-col gap-2">
            Valor a processar (opcional)
            <input
              type="number"
              className="input"
              value={valorProcessamento}
              onChange={(event) => setValorProcessamento(event.target.value)}
              placeholder="Deixe em branco para usar o salário base"
            />
          </label>

          <div className="rounded-2xl border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">Funcionários selecionados para processamento</p>
            {bancoSelecionado ? (
              funcionariosPorBanco.length > 0 ? (
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  {funcionariosPorBanco.map((funcionario) => (
                    <li key={funcionario.id}>{funcionario.nome}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Nenhum funcionário ativo encontrado para este banco.</p>
              )
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Selecione um banco para listar os funcionários.</p>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">Funcionários já na idade de reforma</p>
            {funcionariosParaReforma.length > 0 ? (
              <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                {funcionariosParaReforma.map((funcionario) => (
                  <li key={funcionario.id}>{funcionario.nome} — {calcularIdade(funcionario.dataNascimento)} anos</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhum funcionário ativo atingiu a idade de reforma definida.</p>
            )}
          </div>

          {resultadoProcessamento && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <p className="font-semibold">Processamento concluído para {resultadoProcessamento.total} funcionário(s) do banco {resultadoProcessamento.banco}.</p>
              <ul className="mt-2 list-disc pl-5">
                {resultadoProcessamento.funcionarios.map((funcionario) => (
                  <li key={funcionario}>{funcionario}</li>
                ))}
              </ul>
              {pagamentosProcessadosId.length > 0 && (
                <button type="button" onClick={pagarProcessados} className="mt-4 btn-primary">
                  Pagar
                </button>
              )}
              {resultadoProcessamento.pago && (
                <p className="mt-4 text-sm text-emerald-900">Todos os pagamentos processados foram marcados como pagos.</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => {
              setModalProcessamentoAberto(false);
              setBancoSelecionado('');
              setResultadoProcessamento(null);
            }} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Processar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
