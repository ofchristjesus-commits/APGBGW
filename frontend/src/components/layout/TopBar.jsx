import { Menu, Globe, Bell, LogOut, User, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEntity } from '../../hooks/useEntity';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

export default function TopBar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items: notificacoes } = useEntity('notificacoes');
  const naoLidas = notificacoes.filter(n => !n.lida).length;
  const [menuAberto, setMenuAberto] = useState(false);
  const [langAberto, setLangAberto] = useState(false);
  const menuRef = useRef(null);
  const langRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAberto(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangAberto(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="btn-ghost lg:hidden">
          <Menu size={20} />
        </button>
        <h2 className="text-sm font-medium text-muted-foreground hidden sm:block">
          {t('appTitle')}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Link Site Público */}
        <Link to="/site" className="btn-ghost" title={t('publicSite')}>
          <Globe size={18} />
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-ghost"
          title={t('toggleTheme')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Language Toggle */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangAberto(!langAberto)}
            className="btn-ghost"
            title={t('language')}
          >
            <span className="text-xs font-bold uppercase">{i18n.language.toUpperCase()}</span>
          </button>
          
          {langAberto && (
            <div className="absolute right-0 top-full mt-1 w-24 card py-1 shadow-lg z-50">
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

        {/* Notificações */}
        <button
          onClick={() => navigate('/notificacoes')}
          className="btn-ghost relative"
          title={t('notifications')}
        >
          <Bell size={18} />
          {naoLidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {naoLidas}
            </span>
          )}
        </button>

        {/* Logout direto */}
        <button
          onClick={handleLogout}
          className="btn-ghost"
          title={t('logout')}
        >
          <LogOut size={18} />
        </button>

        {/* Menu Perfil */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium hidden sm:block">{user?.nome}</span>
          </button>

          {menuAberto && (
            <div className="absolute right-0 top-full mt-1 w-48 card py-1 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium">{user?.nome}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              >
                <LogOut size={14} />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
