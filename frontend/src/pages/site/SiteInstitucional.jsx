import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Menu, X, Ship, Warehouse, Scale, Shield, Phone, Mail, MapPin, Sun, Moon } from 'lucide-react';
import { useEntity } from '../../hooks/useEntity';
import { useTheme } from 'next-themes';
import Modal from '../../components/shared/Modal';
import { useTranslation } from 'react-i18next';
import { getCurrentYear } from '../../lib/portUtils';

export default function SiteInstitucional() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items: noticias } = useEntity('noticias');
  const { items: faqs } = useEntity('faqs');
  const { items: empresa } = useEntity('empresa');
  const { items: videos } = useEntity('videos');
  const { create: criarContato } = useEntity('contatos');

  const [servicesOpen, setServicesOpen] = useState(null);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [videoAberto, setVideoAberto] = useState(null);
  const [detalheAberto, setDetalheAberto] = useState(false);
  const [detalheTipo, setDetalheTipo] = useState('');
  const [detalheItem, setDetalheItem] = useState(null);

  const [contatoForm, setContatoForm] = useState({
    nome: '', email: '', telefone: '', assunto: '', mensagem: ''
  });
  const [contatoEnviado, setContatoEnviado] = useState(false);
  const [langAberto, setLangAberto] = useState(false);
  const { theme, setTheme } = useTheme();
  const { i18n, t } = useTranslation();

  const noticiasPublicadas = noticias.filter(n => n.publicada);
  const faqsAtivas = faqs.filter(f => f.ativa);

  const [faqAberto, setFaqAberto] = useState(null);
  const [noticiaAberta, setNoticiaAberta] = useState(null);
  const empresaAtual = empresa[0] || { nome: 'APGB S.A.', endereco: 'Avenida da República, Zona Portuária, Lomé, Togo', email: 'geral@portocais.tg', telefone: '+228 22 23 45 67', logo: null };

  const handleContatoSubmit = (e) => {
    e.preventDefault();
    criarContato({ ...contatoForm, dataHora: new Date().toISOString() });
    setContatoEnviado(true);
    setContatoForm({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
    setTimeout(() => setContatoEnviado(false), 5000);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: t('services'), id: 'servicos' },
    { label: t('howItWorks'), id: 'como-funciona' },
    { label: t('newsSection'), id: 'noticias' },
    { label: t('faqTitle'), id: 'faqs' },
    { label: t('contactTitle'), id: 'contato' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-card/90 backdrop-blur-md border-b border-border z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('hero')}>
            {empresaAtual.logo ? (
              <img src={empresaAtual.logo} alt={empresaAtual.nome} className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <Anchor size={32} className="text-primary" />
            )}
            <span className="text-xl font-bold">{empresaAtual.nome}</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button key={link.id} onClick={() => scrollTo(link.id)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </button>
            ))}
            {/* Theme Toggle */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-muted-foreground hover:text-foreground">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language Toggle */}
            <div className="relative">
              <button onClick={() => setLangAberto(!langAberto)} className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <span className="text-xs font-bold uppercase">{i18n.language.toUpperCase()}</span>
              </button>
              {langAberto && (
                <div className="absolute right-0 top-full mt-2 w-24 card py-1 shadow-lg z-50">
                  {['pt', 'en', 'fr'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => { i18n.changeLanguage(lang); setLangAberto(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors uppercase ${i18n.language === lang ? 'font-bold text-primary' : ''}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/login" className="btn-primary">
              {t('accessSystem')}
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-card z-40 md:hidden flex flex-col p-4 border-t border-border shadow-xl">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)} className="py-4 border-b border-border text-left font-medium text-foreground">
              {link.label}
            </button>
          ))}
          <div className="pt-6">
            <Link to="/login" className="btn-primary w-full justify-center">
              {t('accessSystem')}
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider uppercase mb-6">
            {t('heroBadge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            {t('heroHeading')}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="btn-primary text-lg px-8 py-3 w-full sm:w-auto">
              {t('accessSystem')}
            </Link>
            <button onClick={() => scrollTo('como-funciona')} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-8 py-3 text-lg font-medium transition-colors w-full sm:w-auto">
              {t('howItWorks')}
            </button>
          </div>
        </div>
      </section>

      <Modal aberto={detalheAberto} onFechar={() => setDetalheAberto(false)} titulo={detalheTipo === 'video' ? detalheItem?.titulo || 'Vídeo' : detalheTipo === 'servico' ? detalheItem?.title || 'Serviço' : detalheTipo === 'noticia' ? detalheItem?.titulo || 'Notícia' : 'Detalhes'}>
        {detalheTipo === 'video' && detalheItem && (
          <div className="space-y-4">
            <div className="aspect-video bg-black">
              {detalheItem.arquivo || detalheItem.url ? (
                (() => {
                  const src = detalheItem.arquivo || detalheItem.url;
                  const isYouTube = typeof src === 'string' && (src.includes('youtube.com') || src.includes('youtu.be'));
                  const isVimeo = typeof src === 'string' && src.includes('vimeo.com');
                  if (isYouTube) {
                    let id = null;
                    try { if (src.includes('youtu.be/')) id = src.split('youtu.be/')[1].split(/[?&]/)[0]; else { const u = new URL(src); id = u.searchParams.get('v'); } } catch(e) { id = null; }
                    const embed = id ? `https://www.youtube.com/embed/${id}` : src;
                    return <iframe title={detalheItem.titulo} src={embed} className="w-full h-full" frameBorder="0" allowFullScreen />;
                  }
                  if (isVimeo) { let id = null; try { id = src.split('/').pop().split(/[?&]/)[0]; } catch(e){ id = null;} const embed = id ? `https://player.vimeo.com/video/${id}` : src; return <iframe title={detalheItem.titulo} src={embed} className="w-full h-full" frameBorder="0" allowFullScreen />; }
                  return <video controls src={src} className="w-full h-full" />;
                })()
              ) : (
                <div className="p-6">Sem fonte de vídeo disponível.</div>
              )}
            </div>
            <div>
              <h4 className="font-semibold">Descrição</h4>
              <p className="text-sm text-muted-foreground">{detalheItem.descricao}</p>
            </div>
          </div>
        )}

        {detalheTipo === 'servico' && detalheItem && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{detalheItem.title || detalheItem.titulo}</h4>
            <p className="text-sm text-muted-foreground">{detalheItem.desc || detalheItem.descricao}</p>
          </div>
        )}

        {detalheTipo === 'noticia' && detalheItem && (
          <div className="space-y-4">
            {detalheItem.imagem && <img src={detalheItem.imagem} alt={detalheItem.titulo} className="w-full rounded" />}
            <h4 className="text-lg font-semibold">{detalheItem.titulo}</h4>
            <div className="text-sm text-muted-foreground">{detalheItem.data}</div>
            <p className="mt-2 text-sm">{detalheItem.conteudo || detalheItem.resumo}</p>
          </div>
        )}
      </Modal>

      {/* Serviços */}
      <section id="servicos" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">{t('ourServices')}</h2>
            <p className="text-muted-foreground">{t('serviceDescription')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Ship, title: t('serviceShips'), desc: t('serviceShipsDesc'), color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: Warehouse, title: t('serviceWarehousing'), desc: t('serviceWarehousingDesc'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: Scale, title: t('serviceWeighing'), desc: t('serviceWeighingDesc'), color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Shield, title: t('serviceInspection'), desc: t('serviceInspectionDesc'), color: 'text-violet-500', bg: 'bg-violet-50' },
            ].map((s, i) => (
              <div key={i} className="card p-8 text-center card-hover">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${s.bg}`}>
                  <s.icon size={32} className={s.color} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className={`text-sm text-muted-foreground leading-relaxed ${servicesOpen === i ? '' : 'line-clamp-3'}`}>{s.desc}</p>
                <button
                  onClick={() => { setDetalheTipo('servico'); setDetalheItem(s); setDetalheAberto(true); }}
                  className="text-primary text-sm font-semibold hover:underline mt-4"
                >
                  Ver mais
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vídeos Explicativos */}
      <section id="videos" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t('videos')}</h2>
              <p className="text-muted-foreground">Vídeos explicativos carregados no sistema.</p>
            </div>
            {videos && videos.length > 3 && (
              <button onClick={() => setShowAllVideos(!showAllVideos)} className="btn-secondary">
                {showAllVideos ? t('seeLess') : 'Ver mais'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(videos || []).filter(v => v.ativo !== false).slice().sort((a,b) => (b.id || 0) - (a.id || 0)).slice(0, showAllVideos ? videos.length : 3).map(v => (
              <div key={v.id} className="card overflow-hidden card-hover flex flex-col">
                <div className="aspect-video bg-black/5">
                  { (v.arquivo || v.url) ? (
                    (() => {
                      const src = v.arquivo || v.url;
                      const isData = typeof src === 'string' && src.startsWith('data:');
                      const isYouTube = typeof src === 'string' && (src.includes('youtube.com') || src.includes('youtu.be'));
                      const isVimeo = typeof src === 'string' && src.includes('vimeo.com');

                      if (isData) {
                        return <video controls src={src} className="w-full h-full object-cover" />;
                      }

                      if (isYouTube) {
                        // extract id from common youtube url formats
                        let id = null;
                        try {
                          if (src.includes('youtu.be/')) {
                            id = src.split('youtu.be/')[1].split(/[?&]/)[0];
                          } else if (src.includes('watch?v=')) {
                            const u = new URL(src);
                            id = u.searchParams.get('v');
                          } else {
                            // fallback: try last path segment
                            id = src.split('/').pop();
                          }
                        } catch (e) { id = null; }
                        const embed = id ? `https://www.youtube.com/embed/${id}` : src;
                        return <iframe title={v.titulo} src={embed} className="w-full h-full" frameBorder="0" allowFullScreen />;
                      }

                      if (isVimeo) {
                        let id = null;
                        try { id = src.split('/').pop().split(/[?&]/)[0]; } catch (e) { id = null; }
                        const embed = id ? `https://player.vimeo.com/video/${id}` : src;
                        return <iframe title={v.titulo} src={embed} className="w-full h-full" frameBorder="0" allowFullScreen />;
                      }

                      // Assume direct video file URL (mp4/webm) otherwise
                      return <video controls src={src} className="w-full h-full object-cover" />;
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">{t('videoSimulation')}</div>
                  ) }
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{v.titulo}</h3>
                  <p className={`text-sm text-muted-foreground mb-4 ${videoAberto === v.id ? '' : 'line-clamp-3'}`}>{v.descricao}</p>
                  <div className="mt-auto">
                    <button onClick={() => { setDetalheTipo('video'); setDetalheItem(v); setDetalheAberto(true); }} className="text-primary text-sm font-semibold hover:underline">
                      Ver mais
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {(videos || []).length === 0 && (
              <p className="text-center col-span-3 text-muted-foreground py-12">Nenhum vídeo disponível.</p>
            )}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
<h2 className="text-3xl font-bold mb-4">{t('howItWorksSection')}</h2>
            <p className="text-muted-foreground mb-10">{t('howItWorksDescription')}</p>
              
              <div className="space-y-8">
                {[
                  { num: '01', title: t('step1Title'), desc: t('step1Desc') },
                  { num: '02', title: t('step2Title'), desc: t('step2Desc') },
                  { num: '03', title: t('step3Title'), desc: t('step3Desc') },
                  { num: '04', title: t('step4Title'), desc: t('step4Desc') },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-slate-900 border border-slate-800">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <Anchor size={64} className="mb-4 opacity-50" />
                <p className="font-medium">{t('videoInstitutional')}</p>
                <p className="text-xs mt-2 opacity-50">{t('videoSimulation')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notícias */}
      <section id="noticias" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t('newsSection')}</h2>
              <p className="text-muted-foreground">{t('newsDescription')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {noticiasPublicadas.length > 0 ? (
              noticiasPublicadas.slice(0, 3).map(noticia => (
                <div key={noticia.id} className="card overflow-hidden card-hover flex flex-col">
                  <div className="h-48 bg-muted flex items-center justify-center">
                    {noticia.imagem ? (
                      <img src={noticia.imagem} alt={noticia.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <Anchor size={48} className="text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="text-xs font-semibold text-primary mb-3">
                      {new Date(noticia.data).toLocaleDateString(i18n.language === 'pt' ? 'pt-PT' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{noticia.titulo}</h3>
                    <p className={`text-muted-foreground text-sm mb-4 flex-1 ${noticiaAberta === noticia.id ? '' : 'line-clamp-3'}`}>
                      {noticiaAberta === noticia.id ? noticia.conteudo : noticia.resumo}
                    </p>
                    <button
                      onClick={() => { setDetalheTipo('noticia'); setDetalheItem(noticia); setDetalheAberto(true); }}
                      className="text-primary text-sm font-semibold hover:underline mt-auto text-left"
                    >
                      Ver mais
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground py-12">{t('noPublishedNews')}</p>
            )}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('faqTitle')}</h2>
            <p className="text-muted-foreground">{t('faqDescription')}</p>
          </div>

          <div className="card rounded-2xl overflow-hidden border-border bg-card">
            {faqsAtivas.length > 0 ? (
              faqsAtivas.map(faq => (
                <div key={faq.id} className="accordion-item last:border-b-0 px-6">
                  <button 
                    className="accordion-trigger"
                    onClick={() => setFaqAberto(faqAberto === faq.id ? null : faq.id)}
                  >
                    {faq.pergunta}
                    <span className={`transform transition-transform text-muted-foreground ${faqAberto === faq.id ? 'rotate-180' : ''}`}>
                      ↓
                    </span>
                  </button>
                  {faqAberto === faq.id && (
                    <div className="accordion-content animate-in slide-in-from-top-2">
                      {faq.resposta}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">{t('noFaqAvailable')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t('contactTitle')}</h2>
              <p className="text-muted-foreground mb-8">{t('contactDescription')}</p>
              
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t('address')}</h4>
                    <p className="text-muted-foreground text-sm">{empresaAtual.endereco}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t('phone')}</h4>
                    <p className="text-muted-foreground text-sm">{empresaAtual.telefone}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{t('email')}</h4>
                    <p className="text-muted-foreground text-sm">{empresaAtual.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-8">
              {contatoEnviado ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    ✓
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t('messageSentTitle')}</h3>
                  <p className="text-muted-foreground">{t('messageSentBody')}</p>
                </div>
              ) : (
                <form onSubmit={handleContatoSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">{t('nameLabel')}</label>
                      <input type="text" className="input" required value={contatoForm.nome} onChange={e => setContatoForm({...contatoForm, nome: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">{t('phoneLabel')}</label>
                      <input type="text" className="input" value={contatoForm.telefone} onChange={e => setContatoForm({...contatoForm, telefone: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="label">{t('emailLabel')}</label>
                    <input type="email" className="input" required value={contatoForm.email} onChange={e => setContatoForm({...contatoForm, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">{t('subjectLabel')}</label>
                    <input type="text" className="input" required value={contatoForm.assunto} onChange={e => setContatoForm({...contatoForm, assunto: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">{t('messageLabel')}</label>
                    <textarea className="textarea" rows="4" required value={contatoForm.mensagem} onChange={e => setContatoForm({...contatoForm, mensagem: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3">
                    {t('sendMessage')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800" style={{ minHeight: '2cm' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row justify-between items-center gap-6 py-4">
          <div className="flex items-center gap-2 text-white">
            {empresaAtual.logo ? (
              <img src={empresaAtual.logo} alt={empresaAtual.nome} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <Anchor size={24} className="text-primary" />
            )}
            <span className="text-xl font-bold tracking-tight">{empresaAtual.nome}</span>
          </div>
          <p className="text-sm">
            &copy; {getCurrentYear()} {empresaAtual.nome}. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('termsOfUse')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
