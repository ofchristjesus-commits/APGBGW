import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import StatsCard from '../components/shared/StatsCard';
import Modal from '../components/shared/Modal';
import ConfirmModal from '../components/shared/ConfirmModal';
import { useEntity } from '../hooks/useEntity';
import { Users, UserCheck, Plane, Building, Phone, Mail, Plus, Edit2, Trash2 } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';

export default function Pessoal() {
  const { items, create, update, remove } = useEntity('funcionarios');
  const { items: reformas, create: criarReforma } = useEntity('reformas');
  const [pesquisa, setPesquisa] = useState('');
  const [depFiltro, setDepFiltro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [funcionarioAtual, setFuncionarioAtual] = useState(null);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [perfilFuncionario, setPerfilFuncionario] = useState(null);
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);

  // Filtros para relatório
  const [filtros, setFiltros] = useState({
    departamento: '',
    status: '',
    categoria: '',
  });

  const departamentos = [...new Set(items.map(f => f.departamento))].sort();

  // compute age for each funcionario (non-persistent, derived)
  items.forEach(f => {
    try {
      f.idade = f.dataNascimento ? differenceInYears(new Date(), new Date(f.dataNascimento)) : null;
    } catch (e) {
      f.idade = null;
    }
  });

  const filtrados = items.filter(f => {
    const matchDep = depFiltro === '' || f.departamento === depFiltro;
    const matchSearch = f.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
                        f.matricula.toLowerCase().includes(pesquisa.toLowerCase());
    return matchDep && matchSearch;
  });

  const total = items.length;
  const ativos = items.filter(f => f.status === 'Ativo').length;
  const ferias = items.filter(f => f.status === 'Férias').length;
  const totalDeps = departamentos.length;

  const abrirModal = (funcionario = null) => {
    setFuncionarioAtual(funcionario);
    setModalAberto(true);
  };

  const handleAdicionarReforma = async (funcionario) => {
    const ja = reformas.find(r => r.funcionarioId === funcionario.id);
    if (ja) return;

    const reformaCriada = await criarReforma({
      funcionarioId: funcionario.id,
      nome: funcionario.nome,
      dataNascimento: funcionario.dataNascimento || null,
      idade: funcionario.idade,
      dataAdicionado: new Date().toISOString().split('T')[0],
      status: 'Pendente',
    });

    if (reformaCriada?.id) {
      await update(funcionario.id, { status: 'Em Reforma' });
    }
  };

  const abrirPerfil = (funcionario) => {
    setPerfilFuncionario(funcionario);
    setPerfilAberto(true);
  };

  const fecharPerfil = () => {
    setPerfilFuncionario(null);
    setPerfilAberto(false);
  };

  const fecharModal = () => {
    setFuncionarioAtual(null);
    setModalAberto(false);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const matricula = String(formData.get('matricula') || '').trim();
    const numeroConta = String(formData.get('numeroConta') || '').trim();
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const arquivoDocumento = formData.get('documentoIdentidade');

    const emailJaExiste = items.some((funcionario) =>
      funcionario.id !== funcionarioAtual?.id &&
      String(funcionario.email || '').trim().toLowerCase() === email &&
      email !== ''
    );

    if (emailJaExiste) {
      window.alert('Este email já está associado a outro funcionário.');
      return;
    }

    const matriculaJaExiste = items.some((funcionario) =>
      funcionario.id !== funcionarioAtual?.id &&
      String(funcionario.matricula || '').trim().toLowerCase() === matricula.toLowerCase()
    );

    if (matriculaJaExiste) {
      window.alert('Esta matrícula já está associada a outro funcionário.');
      return;
    }

    const numeroContaJaExiste = numeroConta
      ? items.some((funcionario) =>
          funcionario.id !== funcionarioAtual?.id &&
          String(funcionario.numeroConta || '').trim() === numeroConta
        )
      : false;

    if (numeroContaJaExiste) {
      window.alert('Este número de conta bancária já está associado a outro funcionário.');
      return;
    }

    const dados = {
      nome: formData.get('nome'),
      matricula,
      categoria: formData.get('categoria'),
      departamento: formData.get('departamento'),
      telefone: formData.get('telefone'),
      banco: formData.get('banco') || null,
      numeroConta: numeroConta || null,
      email: email || null,
      dataNascimento: formData.get('dataNascimento'),
      dataAdmissao: formData.get('dataAdmissao'),
      status: formData.get('status'),
      salarioBase: Number(formData.get('salarioBase')),
      documentoIdentidade: arquivoDocumento && typeof arquivoDocumento === 'object'
        ? arquivoDocumento.name
        : (arquivoDocumento ? String(arquivoDocumento) : (funcionarioAtual?.documentoIdentidade || '')),
    };

    if (funcionarioAtual?.id) {
      update(funcionarioAtual.id, dados);
    } else {
      create(dados);
    }
    fecharModal();
  };

  const abrirModalFiltro = () => {
    setModalFiltroAberto(true);
  };

  const fecharModalFiltro = () => {
    setModalFiltroAberto(false);
  };

  const aplicarFiltros = () => {
    const funcFiltr = items.filter(f => {
      const cumpreDep = !filtros.departamento || f.departamento === filtros.departamento;
      const cumpreStatus = !filtros.status || f.status === filtros.status;
      const cumpreCat = !filtros.categoria || f.categoria === filtros.categoria;
      return cumpreDep && cumpreStatus && cumpreCat;
    });

    imprimirRelatorioPessoal(funcFiltr);
    fecharModalFiltro();
  };

  const imprimirRelatorioPessoal = (funcFiltr) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';
    const totalAtivos = funcFiltr.filter(f => f.status === 'Ativo').length;
    const totalSalario = funcFiltr.filter(f => f.status === 'Ativo').reduce((acc, f) => acc + (f.salarioBase || 0), 0);

    let linhasTabela = funcFiltr.map(f => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.matricula}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.nome}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.categoria}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.departamento}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarData(f.dataAdmissao)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${f.salarioBase.toLocaleString('pt-PT')} XOF</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.status}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Pessoal</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            .cabecalho { margin-bottom: 24px; }
            .titulo { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .subtitulo { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
            .filtros { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
            .resumo { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
            .card-resumo { flex: 1; min-width: 150px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .label { font-size: 12px; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
            .valor { font-size: 20px; font-weight: 700; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 700; font-size: 13px; border-bottom: 2px solid #d1d5db; }
            td { padding: 8px; }
            .rodape { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="cabecalho">
            <div class="titulo">Relatório de Recursos Humanos</div>
            <div class="subtitulo">Data de emissão: ${formatarData(new Date().toISOString())}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.departamento ? `Departamento: ${filtros.departamento}<br>` : ''}
              ${filtros.categoria ? `Categoria: ${filtros.categoria}<br>` : ''}
              ${filtros.status ? `Status: ${filtros.status}` : ''}
            </div>
          </div>

          <div class="resumo">
            <div class="card-resumo">
              <div class="label">Total de Funcionários</div>
              <div class="valor">${funcFiltr.length}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Funcionários Ativos</div>
              <div class="valor">${totalAtivos}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Folha Salarial (Ativos)</div>
              <div class="valor">${totalSalario.toLocaleString('pt-PT')} XOF</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Departamento</th>
                <th>Admissão</th>
                <th>Salário Base</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>

          <div class="rodape">
            <p>Relatório gerado pelo Sistema de Gestão Porto Cais</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Recursos Humanos" 
        subtitulo="Gestão dos colaboradores, turnos e salários" 
        onPrint={abrirModalFiltro}
          textoBotaoImprimir="Imprimir Relatório"
        onAdd={() => abrirModal()}
        textoBotao="Novo Funcionário"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard titulo="Total Funcionários" valor={total} icone={Users} cor="blue" />
        <StatsCard titulo="Funcionários Ativos" valor={ativos} icone={UserCheck} cor="green" />
        <StatsCard titulo="Em Férias" valor={ferias} icone={Plane} cor="amber" />
        <StatsCard titulo="Departamentos" valor={totalDeps} icone={Building} cor="violet" />
      </div>

      <div className="card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:max-w-md">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar por nome ou matrícula..." />
        </div>
        <div className="w-full sm:w-auto">
          <select 
            className="select w-full sm:w-64" 
            value={depFiltro} 
            onChange={e => setDepFiltro(e.target.value)}
          >
            <option value="">Todos os Departamentos</option>
            {departamentos.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtrados.map(f => (
          <div key={f.id} className="card p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 text-xl font-bold">
                  {f.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{f.nome}</h3>
                  <span className="text-xs font-mono text-primary font-medium">{f.matricula}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <StatusBadge status={f.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-6 flex-1">
              <div className="col-span-2 pb-2 border-b border-border">
                <span className="text-muted-foreground block text-xs">Cargo / Categoria</span>
                <span className="font-medium text-base">{f.categoria}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Departamento</span>
                <span className="font-medium">{f.departamento}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Admissão</span>
                <span className="font-medium">{format(new Date(f.dataAdmissao), 'dd/MM/yyyy')}</span>
              </div>
              <div className="col-span-2 pt-2 space-y-1">
                <div className="text-sm text-muted-foreground">Departamento: {f.departamento}</div>
                <div className="text-sm text-muted-foreground">Categoria: {f.categoria}</div>
                <div className="text-sm text-muted-foreground">Status: {f.status}</div>
              </div>
            </div>
            
            <div className="mt-auto flex gap-2">
              <button onClick={() => abrirPerfil(f)} className="btn-secondary flex-1">Ver Perfil</button>
              <button onClick={() => abrirModal(f)} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                <Edit2 size={16} /> Editar
              </button>
              <button onClick={() => {
                setItemParaRemover(f);
                setConfirmModalAberto(true);
              }} className="btn-danger p-2">
                <Trash2 size={16} />
              </button>
              {f.idade >= 60 && (
                <button onClick={() => handleAdicionarReforma(f)} className="btn-ghost p-2">
                  Adicionar para Reforma
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={funcionarioAtual ? 'Editar Funcionário' : 'Novo Funcionário'}>
        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome</label>
              <input name="nome" className="input" defaultValue={funcionarioAtual?.nome || ''} required />
            </div>
            <div>
              <label className="label">Matrícula</label>
              <input name="matricula" className="input" defaultValue={funcionarioAtual?.matricula || ''} required />
            </div>
            <div>
              <label className="label">Categoria</label>
              <input name="categoria" className="input" defaultValue={funcionarioAtual?.categoria || ''} required />
            </div>
            <div>
              <label className="label">Departamento</label>
              <input name="departamento" className="input" defaultValue={funcionarioAtual?.departamento || ''} required />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input name="telefone" className="input" defaultValue={funcionarioAtual?.telefone || ''} />
            </div>
            <div>
              <label className="label">Banco</label>
              <input name="banco" className="input" defaultValue={funcionarioAtual?.banco || ''} />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" defaultValue={funcionarioAtual?.email || ''} />
            </div>
            <div>
              <label className="label">Data de Nascimento</label>
              <input name="dataNascimento" type="date" className="input" defaultValue={funcionarioAtual?.dataNascimento || ''} required />
            </div>
            <div>
              <label className="label">Número de Conta</label>
              <input name="numeroConta" className="input" defaultValue={funcionarioAtual?.numeroConta || ''} />
            </div>
            <div>
              <label className="label">Data de Admissão</label>
              <input name="dataAdmissao" type="date" className="input" defaultValue={funcionarioAtual?.dataAdmissao || ''} required />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" defaultValue={funcionarioAtual?.status || 'Ativo'}>
                <option>Ativo</option>
                <option>Férias</option>
                <option>Inativo</option>
              </select>
            </div>
            <div>
              <label className="label">Salário Base</label>
              <input name="salarioBase" type="number" className="input" defaultValue={funcionarioAtual?.salarioBase || 0} required />
            </div>
            <div className="col-span-2">
              <label className="label">Documento de Identidade (PDF)</label>
              <input
                name="documentoIdentidade"
                type="file"
                accept="application/pdf"
                className="input file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
              />
              {funcionarioAtual?.documentoIdentidade && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Ficheiro atual: {funcionarioAtual.documentoIdentidade}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal aberto={perfilAberto} onFechar={fecharPerfil} titulo={`Perfil — ${perfilFuncionario?.nome || ''}`}>
        {perfilFuncionario ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">{perfilFuncionario.nome}</h3>
              <p className="text-sm text-muted-foreground">Matrícula: {perfilFuncionario.matricula}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Categoria</p>
                <p className="font-medium">{perfilFuncionario.categoria}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Departamento</p>
                <p className="font-medium">{perfilFuncionario.departamento}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Telefone</p>
                <p className="font-medium">{perfilFuncionario.telefone || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="font-medium">{perfilFuncionario.email || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Banco</p>
                <p className="font-medium">{perfilFuncionario.banco || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Número de Conta</p>
                <p className="font-medium">{perfilFuncionario.numeroConta || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Data de Nascimento</p>
                <p className="font-medium">{perfilFuncionario.dataNascimento || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Data de Admissão</p>
                <p className="font-medium">{perfilFuncionario.dataAdmissao || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <p className="font-medium">{perfilFuncionario.status || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Salário Base</p>
                <p className="font-medium">{perfilFuncionario.salarioBase ? perfilFuncionario.salarioBase.toLocaleString('pt-PT') + ' XOF' : '-'}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-muted-foreground text-xs">Documento de Identidade</p>
                <p className="font-medium">{perfilFuncionario.documentoIdentidade || '-'}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button onClick={fecharPerfil} className="btn-secondary">Fechar</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Selecione um funcionário para ver o perfil completo.</p>
        )}
      </Modal>

      {/* Modal Filtro Relatório Personalizado */}
      <Modal
        aberto={modalFiltroAberto}
        onFechar={fecharModalFiltro}
        titulo="Relatório Personalizado - Filtros"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Departamento</label>
            <select 
              value={filtros.departamento}
              onChange={(e) => setFiltros({...filtros, departamento: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              {departamentos.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select 
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Férias">Férias</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="label">Categoria</label>
            <input 
              type="text"
              placeholder="Deixe em branco para não filtrar"
              value={filtros.categoria}
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              className="input"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button type="button" onClick={fecharModalFiltro} className="btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={aplicarFiltros} className="btn-primary">
              Gerar Relatório
            </button>
          </div>
          </div>
      </Modal>

      <ConfirmModal 
        aberto={confirmModalAberto}
        onFechar={() => {
          setConfirmModalAberto(false);
          setItemParaRemover(null);
        }}
        onConfirmar={() => itemParaRemover && remove(itemParaRemover.id)}
        titulo="Remover Funcionário"
        mensagem="Tem a certeza que deseja remover este funcionário? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
