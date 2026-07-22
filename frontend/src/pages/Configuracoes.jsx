import { useState, useEffect } from 'react';
import PageHeader from '../components/shared/PageHeader';
import Modal from '../components/shared/Modal';
import ConfirmModal from '../components/shared/ConfirmModal';
import { useEntity } from '../hooks/useEntity';
import { useAuth } from '../contexts/AuthContext';
import { Plus, UserPlus, ShieldCheck, Newspaper, Video, Settings, Edit2, Trash2, FileText } from 'lucide-react';

const tabs = [
  'Empresa',
  'Utilizadores',
  'Privilégios',
  'Notícias',
  'FAQs',
  'Vídeos',
  'Serviços',
  'Logs do sistema'
];

export default function Configuracoes() {
  const { items: empresa, create: criarEmpresa, update: atualizarEmpresa } = useEntity('empresa');
  const { items: utilizadores, create: criarUtilizador, update: atualizarUtilizador, remove: removerUtilizador } = useEntity('utilizadores');
  const { items: noticias, create: criarNoticia, update: atualizarNoticia, remove: removerNoticia } = useEntity('noticias');
  const { items: faqs, create: criarFAQ, update: atualizarFAQ, remove: removerFAQ } = useEntity('faqs');
  const { items: videos, create: criarVideo, update: atualizarVideo, remove: removerVideo } = useEntity('videos');
  const { items: servicos, create: criarServico, update: atualizarServico, remove: removerServico } = useEntity('servicos');
  const { items: logs, create: criarLog, clear: limparLogs } = useEntity('logsSistema');
  const { user } = useAuth();

  const [tabAtiva, setTabAtiva] = useState('Empresa');
  const [modalAberto, setModalAberto] = useState(false);
  const [itemAtual, setItemAtual] = useState(null);
  const [modalTipo, setModalTipo] = useState('');
  const [confirmModalAberto, setConfirmModalAberto] = useState(false);
  const [itemParaRemover, setItemParaRemover] = useState(null);
  const [empresaForm, setEmpresaForm] = useState({
    nome: '',
    nif: '',
    endereco: '',
    email: '',
    telefone: '',
    logo: '',
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [modalImagePreview, setModalImagePreview] = useState('');
  const [modalVideoPreview, setModalVideoPreview] = useState('');
  const [perfilSelecionado, setPerfilSelecionado] = useState('');
  const [novoPerfilTexto, setNovoPerfilTexto] = useState('');
  const [perfisDisponibles, setperfisDisponibles] = useState([
    'Administrador',
    'Operador',
    'Conferente',
    'Estivador',
    'Fiscal',
    'Administrativo',
    'Gestor de Carga',
    'Capitão de Porto',
    'Manutentor',
    'Almoxarife',
    'Segurança',
  ]);

  const PRIVILEGIOS_SISTEMA = {
    'Geral': {
      'Dashboard': ['Dashboard:Visualizar'],
      'Notificações': ['Notificações:Visualizar', 'Notificações:Gerir'],
      'Estatísticas': ['Estatísticas:Visualizar', 'Estatísticas:Exportar'],
    },
    'Secretaria': {
      'Secretaria': ['Secretaria:Visualizar', 'Secretaria:Criar', 'Secretaria:Editar', 'Secretaria:Remover'],
      'Diretoria': ['Diretoria:Visualizar', 'Diretoria:Criar', 'Diretoria:Editar', 'Diretoria:Remover'],
    },
    'RH': {
      'Recursos Humanos': ['Recursos Humanos:Visualizar', 'Recursos Humanos:Criar', 'Recursos Humanos:Editar', 'Recursos Humanos:Remover'],
      'Controlo de Ponto': ['Controlo de Ponto:Visualizar', 'Controlo de Ponto:Criar', 'Controlo de Ponto:Editar', 'Controlo de Ponto:Remover'],
      'Remunerações': ['Remunerações:Visualizar', 'Remunerações:Criar', 'Remunerações:Editar', 'Remunerações:Remover'],
    },
    'Financeiro': {
      'Faturação': ['Faturação:Visualizar', 'Faturação:Criar', 'Faturação:Editar', 'Faturação:Remover'],
      'Tesouraria': ['Tesouraria:Visualizar', 'Tesouraria:Criar', 'Tesouraria:Editar', 'Tesouraria:Remover'],
      'Compras': ['Compras:Visualizar', 'Compras:Criar', 'Compras:Editar', 'Compras:Remover'],
    },
    'Operações Portuárias': {
      'Navios': ['Navios:Visualizar', 'Navios:Criar', 'Navios:Editar', 'Navios:Remover'],
      'Atracagem': ['Atracagem:Visualizar', 'Atracagem:Criar', 'Atracagem:Editar', 'Atracagem:Remover'],
      'Escalas de Trabalho': ['Escalas de Trabalho:Visualizar', 'Escalas de Trabalho:Criar', 'Escalas de Trabalho:Editar', 'Escalas de Trabalho:Remover'],
      'Pesagens': ['Pesagens:Visualizar', 'Pesagens:Criar', 'Pesagens:Editar', 'Pesagens:Remover'],
      'Equipamentos': ['Equipamentos:Visualizar', 'Equipamentos:Criar', 'Equipamentos:Editar', 'Equipamentos:Remover'],
      'Oficina': ['Oficina:Visualizar', 'Oficina:Criar', 'Oficina:Editar', 'Equipamentos:Remover'],
      'Fiscalização': ['Fiscalização:Visualizar', 'Fiscalização:Criar', 'Fiscalização:Editar', 'Fiscalização:Remover'],
    },
    'Armazéns e Parque': {
      'Serviço de Armazéns': ['Serviço de Armazéns:Visualizar', 'Serviço de Armazéns:Criar', 'Serviço de Armazéns:Editar', 'Serviço de Armazéns:Remover'],
      'Manifestos': [
        'Manifestos:Visualizar', 'Manifestos:Criar', 'Manifestos:Editar', 'Manifestos:Remover',
        'Manifestos:Conferir BLs', 'Manifestos:Criar BL', 'Manifestos:Editar BL', 'Manifestos:Ver Detalhes BL',
        'Manifestos:Ação: Conferir BL', 'Manifestos:Ação: Dar Baixa', 'Manifestos:Ação: Autorizar Pode Sair'
      ],
      'Serviço de Parque': ['Serviço de Parque:Visualizar', 'Serviço de Parque:Criar', 'Serviço de Parque:Editar', 'Serviço de Parque:Remover'],
    },
    'Configurações': {
      'Configurações': ['Configurações:Visualizar', 'Configurações:Criar', 'Configurações:Editar', 'Configurações:Remover'],
      'Site Institucional': ['Site Institucional:Visualizar', 'Site Institucional:Criar', 'Site Institucional:Editar', 'Site Institucional:Remover'],
    },
  };

  const PRIVILEGIOS = Object.values(PRIVILEGIOS_SISTEMA).flatMap(grupo => Object.values(grupo).flat());

  const empresaAtual = empresa[0] || {};

  useEffect(() => {
    if (empresaAtual?.id) {
      setEmpresaForm({
        nome: empresaAtual.nome || '',
        nif: empresaAtual.nif || '',
        endereco: empresaAtual.endereco || '',
        email: empresaAtual.email || '',
        telefone: empresaAtual.telefone || '',
        logo: empresaAtual.logo || '',
      });
      setLogoPreview(empresaAtual.logo || '');
    }
  }, [empresaAtual]);

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEmpresaForm(prev => ({ ...prev, logo: reader.result }));
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const abrirModal = (tipo, item = null) => {
    setModalTipo(tipo);
    setItemAtual(item);
    setPerfilSelecionado(item?.perfil || 'Operador');
    setNovoPerfilTexto('');
    if (tipo === 'Notícias') {
      setModalImagePreview(item?.imagem || '');
    } else if (tipo === 'Vídeos') {
      setModalVideoPreview(item?.arquivo || item?.url || '');
    } else {
      setModalVideoPreview('');
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setItemAtual(null);
    setModalAberto(false);
  };

  const registrarLog = (tipo, mensagem, detalhe) => {
    criarLog({
      tipo,
      mensagem,
      detalhe,
      usuario: user?.nome || user?.email || 'Sistema',
      data: new Date().toISOString(),
    });
  };

  const limparRegistosLogs = () => {
    setItemParaRemover({ tipo: 'logs' });
    setConfirmModalAberto(true);
  };

  const handleConfirmarRemocao = () => {
    if (!itemParaRemover) return;
    switch (itemParaRemover.tipo) {
      case 'utilizador': removerUtilizador(itemParaRemover.id); break;
      case 'noticia': removerNoticia(itemParaRemover.id); break;
      case 'faq': removerFAQ(itemParaRemover.id); break;
      case 'video': removerVideo(itemParaRemover.id); break;
      case 'servico': removerServico(itemParaRemover.id); break;
      case 'logs':
        limparLogs();
        registrarLog('Sistema', 'Logs limpos', 'Todos os registos de logs foram removidos pelo administrador.');
        window.alert('Registos de logs limpos com sucesso.');
        break;
      default: break;
    }
    setConfirmModalAberto(false);
    setItemParaRemover(null);
  };

  const handleSalvarEmpresa = (e) => {
    e.preventDefault();
    const dados = {
      nome: empresaForm.nome,
      nif: empresaForm.nif,
      endereco: empresaForm.endereco,
      email: empresaForm.email,
      telefone: empresaForm.telefone,
      logo: empresaForm.logo || null,
    };

    if (empresaAtual?.id) {
      atualizarEmpresa(empresaAtual.id, dados);
      registrarLog('Configurações', 'Dados da empresa atualizados', 'Foi atualizada a informação da empresa.');
    } else {
      criarEmpresa(dados);
      registrarLog('Configurações', 'Dados da empresa criados', 'Foi criada a informação da empresa.');
    }
  };

  const handleSalvarUtilizador = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const senha = formData.get('senha');
    const confirmarSenha = formData.get('confirmarSenha');

    if (senha || confirmarSenha) {
      if (senha !== confirmarSenha) {
        window.alert('As senhas não coincidem.');
        return;
      }
    }

    let perfilFinal = perfilSelecionado;
    
    if (perfilSelecionado === 'OUTRO' && novoPerfilTexto.trim()) {
      perfilFinal = novoPerfilTexto.trim();
      if (!perfisDisponibles.includes(perfilFinal)) {
        setperfisDisponibles([...perfisDisponibles, perfilFinal].sort());
      }
    }

    const dados = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      perfil: perfilFinal,
      ativo: formData.get('ativo') === 'true',
      privilegios: [...formData.getAll('privilegios')],
      ...(senha ? { senha } : {}),
    };

    if (itemAtual) {
      atualizarUtilizador(itemAtual.id, dados);
      registrarLog('Configurações', 'Utilizador atualizado', `Utilizador ${dados.nome} foi atualizado.`);
    } else {
      criarUtilizador(dados);
      registrarLog('Configurações', 'Utilizador criado', `Utilizador ${dados.nome} foi criado.`);
    }
    fecharModal();
  };

  const handleSalvarNoticia = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = {
      titulo: formData.get('titulo'),
      resumo: formData.get('resumo'),
      conteudo: formData.get('conteudo'),
      imagem: modalImagePreview || formData.get('imagem') || null,
      data: formData.get('data'),
      publicada: formData.get('publicada') === 'true',
    };
    if (itemAtual) {
      atualizarNoticia(itemAtual.id, dados);
      registrarLog('Conteúdo', 'Notícia atualizada', `Notícia ${dados.titulo} foi atualizada.`);
    } else {
      criarNoticia(dados);
      registrarLog('Conteúdo', 'Notícia criada', `Notícia ${dados.titulo} foi criada.`);
    }
    fecharModal();
  };

  const handleNewsImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setModalImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setModalVideoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSalvarFAQ = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = {
      pergunta: formData.get('pergunta'),
      resposta: formData.get('resposta'),
      ativa: formData.get('ativa') === 'true',
    };
    if (itemAtual) {
      atualizarFAQ(itemAtual.id, dados);
      registrarLog('Conteúdo', 'FAQ atualizada', `FAQ ${dados.pergunta} foi atualizada.`);
    } else {
      criarFAQ(dados);
      registrarLog('Conteúdo', 'FAQ criada', `FAQ ${dados.pergunta} foi criada.`);
    }
    fecharModal();
  };

  const handleSalvarVideo = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const arquivoVal = modalVideoPreview || itemAtual?.arquivo || null;
    const urlVal = formData.get('url') || null;

    if (!urlVal && !arquivoVal) {
      window.alert('Forneça uma URL ou carregue um ficheiro de vídeo antes de guardar.');
      return;
    }

    const dados = {
      titulo: formData.get('titulo'),
      url: urlVal || arquivoVal,
      arquivo: arquivoVal,
      descricao: formData.get('descricao'),
      ativo: formData.get('ativo') === 'true',
    };

    try {
      if (itemAtual) {
        await atualizarVideo(itemAtual.id, dados);
        registrarLog('Conteúdo', 'Vídeo atualizado', `Vídeo ${dados.titulo} foi atualizado.`);
      } else {
        await criarVideo(dados);
        registrarLog('Conteúdo', 'Vídeo criado', `Vídeo ${dados.titulo} foi criado.`);
      }
      fecharModal();
    } catch (err) {
      console.error('Erro ao salvar vídeo', err);
      window.alert('Erro ao guardar o vídeo: ' + (err?.message || err));
    }
  };

  const handleSalvarServico = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const dados = {
      titulo: formData.get('titulo'),
      descricao: formData.get('descricao'),
      icone: formData.get('icone'),
      ativo: formData.get('ativo') === 'true',
    };
    if (itemAtual) {
      atualizarServico(itemAtual.id, dados);
      registrarLog('Configurações', 'Serviço atualizado', `Serviço ${dados.titulo} foi atualizado.`);
    } else {
      criarServico(dados);
      registrarLog('Configurações', 'Serviço criado', `Serviço ${dados.titulo} foi criado.`);
    }
    fecharModal();
  };

  useEffect(() => {
    if (!logs.length) {
      registrarLog('Sistema', 'Inicialização do módulo de logs do sistema.', 'A página de configurações foi aberta.');
    }
  }, [criarLog, logs.length]);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Configurações"
        subtitulo="Gestão de empresa, utilizadores, privilégio e conteúdo do site"
      />

      <div className="card p-4">
        <div className="flex flex-col xl:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setTabAtiva(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${tabAtiva === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={() => abrirModal(tabAtiva, null)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={16} /> Adicionar
          </button>
        </div>

        {tabAtiva === 'Empresa' && (
          <form onSubmit={handleSalvarEmpresa} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="label">Nome da Empresa</label>
              <input
                name="nome"
                className="input"
                value={empresaForm.nome}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">NIF</label>
              <input
                name="nif"
                className="input"
                value={empresaForm.nif}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, nif: e.target.value }))}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="label">Endereço</label>
              <input
                name="endereco"
                className="input"
                value={empresaForm.endereco}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, endereco: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                className="input"
                value={empresaForm.email}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input
                name="telefone"
                className="input"
                value={empresaForm.telefone}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, telefone: e.target.value }))}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="label">URL do Logotipo</label>
              <input
                name="logo"
                className="input"
                value={empresaForm.logo}
                onChange={(e) => setEmpresaForm(prev => ({ ...prev, logo: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <label className="label">Upload do Logotipo</label>
              <input
                type="file"
                accept="image/*"
                className="file-input w-full"
                onChange={handleLogoUpload}
              />
              {logoPreview && (
                <div className="mt-3 rounded-xl border border-border p-3 bg-muted">
                  <p className="text-xs text-muted-foreground mb-2">Pré-visualização do logotipo</p>
                  <img src={logoPreview} alt="Pré-visualização do logotipo" className="h-20 object-contain" />
                </div>
              )}
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="submit" className="btn-primary">Guardar Alterações</button>
            </div>
          </form>
        )}

        {tabAtiva === 'Utilizadores' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {utilizadores.map(user => (
              <div key={user.id} className="card p-4 border">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold">{user.nome}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm">Perfil: {user.perfil}</p>
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => abrirModal('Utilizadores', user)} className="btn-secondary text-xs">Editar</button>
                    <button onClick={() => { setItemParaRemover({ id: user.id, tipo: 'utilizador' }); setConfirmModalAberto(true); }} className="btn-danger text-xs">Remover</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {user.privilegios?.map(priv => (
                    <span key={priv} className="badge">{priv}</span>
                  ))}
                </div>
                <div className={`mt-4 text-xs font-semibold ${user.ativo ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {user.ativo ? 'Ativo' : 'Desativado'}
                </div>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === 'Privilégios' && (
          <div className="space-y-6">
            {utilizadores.map(user => (
              <div key={user.id} className="card p-4 border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{user.nome}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <button onClick={() => abrirModal('Utilizadores', user)} className="btn-secondary text-xs">Gerir</button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                  {user.privilegios?.map(priv => (
                    <span key={priv} className="badge">{priv}</span>
                  ))}
                </div>
                <div className="rounded-2xl border border-border p-4 bg-muted text-sm text-slate-500">
                  As alterações de privilégios são feitas apenas através do botão <strong>Gerir</strong>.
                </div>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === 'Notícias' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {noticias.map(noticia => (
              <div key={noticia.id} className="card p-4 border">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold">{noticia.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{noticia.data}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <button onClick={() => abrirModal('Notícias', noticia)} className="btn-secondary text-xs">Editar</button>
                    <button onClick={() => { setItemParaRemover({ id: noticia.id, tipo: 'noticia' }); setConfirmModalAberto(true); }} className="btn-danger text-xs">Remover</button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{noticia.resumo}</p>
                <span className={`badge ${noticia.publicada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {noticia.publicada ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === 'FAQs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqs.map(faq => (
              <div key={faq.id} className="card p-4 border">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold">{faq.pergunta}</h3>
                    <p className="text-sm text-muted-foreground">{faq.resposta.substring(0, 70)}...</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <button onClick={() => abrirModal('FAQs', faq)} className="btn-secondary text-xs">Editar</button>
                    <button onClick={() => { setItemParaRemover({ id: faq.id, tipo: 'faq' }); setConfirmModalAberto(true); }} className="btn-danger text-xs">Remover</button>
                  </div>
                </div>
                <span className={`badge ${faq.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {faq.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === 'Vídeos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map(video => (
              <div key={video.id} className="card p-4 border">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold">{video.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{video.url}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <button onClick={() => abrirModal('Vídeos', video)} className="btn-secondary text-xs">Editar</button>
                    <button onClick={() => { setItemParaRemover({ id: video.id, tipo: 'video' }); setConfirmModalAberto(true); }} className="btn-danger text-xs">Remover</button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{video.descricao}</p>
                <span className={`badge ${video.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {video.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === 'Serviços' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {servicos.map(servico => (
              <div key={servico.id} className="card p-4 border">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-semibold">{servico.titulo}</h3>
                    <p className="text-sm text-muted-foreground">{servico.icone || 'Ícone não definido'}</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <button onClick={() => abrirModal('Serviços', servico)} className="btn-secondary text-xs">Editar</button>
                    <button onClick={() => { setItemParaRemover({ id: servico.id, tipo: 'servico' }); setConfirmModalAberto(true); }} className="btn-danger text-xs">Remover</button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{servico.descricao}</p>
                <span className={`badge ${servico.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        )}

        {tabAtiva === 'Logs do sistema' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText size={16} />
                <span>Registo de acontecimentos e alterações no sistema.</span>
              </div>
              <button onClick={limparRegistosLogs} className="btn-danger inline-flex items-center gap-2">
                <Trash2 size={16} /> Limpar logs
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Utilizador</th>
                    <th>Mensagem</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice().reverse().map(log => (
                    <tr key={log.id}>
                      <td>{new Date(log.data).toLocaleString('pt-PT')}</td>
                      <td>{log.tipo || 'Sistema'}</td>
                      <td>{log.usuario || 'Sistema'}</td>
                      <td>{log.mensagem}</td>
                      <td>{log.detalhe || '—'}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-muted-foreground">Sem registos disponíveis.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal aberto={modalAberto} onFechar={fecharModal} titulo={modalTipo === 'Empresa' ? 'Editar Empresa' : `Editar ${modalTipo}`}>
        {modalTipo === 'Utilizadores' && (
          <form onSubmit={handleSalvarUtilizador} className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input name="nome" className="input" defaultValue={itemAtual?.nome || ''} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" defaultValue={itemAtual?.email || ''} required />
            </div>
            <div>
              <label className="label">Perfil</label>
              <select 
                value={perfilSelecionado} 
                onChange={(e) => setPerfilSelecionado(e.target.value)}
                className="select" 
                required
              >
                <option value="">Selecione um perfil...</option>
                {perfisDisponibles.map(perfil => (
                  <option key={perfil} value={perfil}>{perfil}</option>
                ))}
                <option value="OUTRO">Outro (novo perfil)</option>
              </select>
            </div>
            {perfilSelecionado === 'OUTRO' && (
              <div>
                <label className="label">Nome do novo perfil</label>
                <input 
                  type="text"
                  value={novoPerfilTexto}
                  onChange={(e) => setNovoPerfilTexto(e.target.value)}
                  className="input" 
                  placeholder="ex: Operador de Grua"
                  required 
                />
              </div>
            )}
            <div>
              <label className="label">Senha</label>
              <input name="senha" type="password" className="input" placeholder="Deixe em branco para manter a atual" />
            </div>
            <div>
              <label className="label">Confirmar senha</label>
              <input name="confirmarSenha" type="password" className="input" placeholder="Repita a senha" />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="ativo" className="select" defaultValue={String(itemAtual?.ativo ?? true)}>
                <option value="true">Ativo</option>
                <option value="false">Desativado</option>
              </select>
            </div>
            <div className="space-y-4">
              {Object.entries(PRIVILEGIOS_SISTEMA).map(([grupo, paginas]) => (
                <div key={grupo} className="rounded-2xl border border-border p-4 bg-muted">
                  <div className="text-sm font-semibold mb-3 border-b border-border pb-2">{grupo}</div>
                  <div className="space-y-4">
                    {Object.entries(paginas).map(([pagina, acoes]) => (
                      <div key={pagina}>
                        <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">{pagina}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm ml-2">
                          {acoes.map(acao => (
                            <label key={acao} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                              <input
                                type="checkbox"
                                name="privilegios"
                                value={acao}
                                defaultChecked={itemAtual?.privilegios?.includes(acao)}
                              />
                              <span className="truncate" title={acao.split(':').slice(1).join(': ')}>{acao.split(':').slice(1).join(': ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        )}

        {modalTipo === 'Notícias' && (
          <form onSubmit={handleSalvarNoticia} className="space-y-4">
            <div>
              <label className="label">Título</label>
              <input name="titulo" className="input" defaultValue={itemAtual?.titulo || ''} required />
            </div>
            <div>
              <label className="label">Resumo</label>
              <textarea name="resumo" className="textarea" defaultValue={itemAtual?.resumo || ''} required />
            </div>
            <div>
              <label className="label">Conteúdo</label>
              <textarea name="conteudo" className="textarea" defaultValue={itemAtual?.conteudo || ''} required />
            </div>
            <div>
              <label className="label">Data</label>
              <input name="data" type="date" className="input" defaultValue={itemAtual?.data || new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="label">Publicada</label>
              <select name="publicada" className="select" defaultValue={String(itemAtual?.publicada ?? true)}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div>
              <label className="label">Imagem</label>
              <input type="file" accept="image/*" className="file-input" onChange={handleNewsImageUpload} />
              {(modalImagePreview || itemAtual?.imagem) && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Pré-visualização</p>
                  <img src={modalImagePreview || itemAtual?.imagem} alt="Prévia" className="h-24 object-contain mt-2" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        )}

        {modalTipo === 'FAQs' && (
          <form onSubmit={handleSalvarFAQ} className="space-y-4">
            <div>
              <label className="label">Pergunta</label>
              <input name="pergunta" className="input" defaultValue={itemAtual?.pergunta || ''} required />
            </div>
            <div>
              <label className="label">Resposta</label>
              <textarea name="resposta" className="textarea" defaultValue={itemAtual?.resposta || ''} required />
            </div>
            <div>
              <label className="label">Ativa</label>
              <select name="ativa" className="select" defaultValue={String(itemAtual?.ativa ?? true)}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        )}

        {modalTipo === 'Vídeos' && (
          <form onSubmit={handleSalvarVideo} className="space-y-4">
            <div>
              <label className="label">Título</label>
              <input name="titulo" className="input" defaultValue={itemAtual?.titulo || ''} required />
            </div>
            <div>
              <label className="label">URL do vídeo</label>
              <input name="url" className="input" defaultValue={itemAtual?.url || ''} placeholder="https://..." />
            </div>
            <div>
              <label className="label">Carregar vídeo do computador</label>
              <input type="file" accept="video/*" className="file-input" onChange={handleVideoUpload} />
              {(modalVideoPreview || itemAtual?.arquivo || itemAtual?.url) && (
                <div className="mt-3 rounded-xl border border-border p-3 bg-muted">
                  <p className="text-xs text-muted-foreground mb-2">Pré-visualização do vídeo</p>
                  <video controls src={modalVideoPreview || itemAtual?.arquivo || itemAtual?.url} className="w-full rounded-lg" />
                </div>
              )}
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea name="descricao" className="textarea" defaultValue={itemAtual?.descricao || ''} required />
            </div>
            <div>
              <label className="label">Ativo</label>
              <select name="ativo" className="select" defaultValue={String(itemAtual?.ativo ?? true)}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        )}

        {modalTipo === 'Serviços' && (
          <form onSubmit={handleSalvarServico} className="space-y-4">
            <div>
              <label className="label">Título</label>
              <input name="titulo" className="input" defaultValue={itemAtual?.titulo || ''} required />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea name="descricao" className="textarea" defaultValue={itemAtual?.descricao || ''} required />
            </div>
            <div>
              <label className="label">Ícone</label>
              <input name="icone" className="input" defaultValue={itemAtual?.icone || ''} placeholder="Ex: Ship" />
            </div>
            <div>
              <label className="label">Ativo</label>
              <select name="ativo" className="select" defaultValue={String(itemAtual?.ativo ?? true)}>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">Guardar</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmModal 
        aberto={confirmModalAberto}
        onFechar={() => {
          setConfirmModalAberto(false);
          setItemParaRemover(null);
        }}
        onConfirmar={handleConfirmarRemocao}
        titulo="Confirmar Remoção"
        mensagem="Tem a certeza que deseja remover esta informação? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
