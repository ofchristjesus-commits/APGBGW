import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useEntity } from '../../hooks/useEntity';
import { getCurrentYear } from '../../lib/portUtils';

export default function AppLayout() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items: empresa } = useEntity('empresa');
  const empresaAtual = empresa[0] || { nome: 'Porto Cais S.A.', logo: '' };

  return (
    <div className="min-h-screen bg-background">
      <div className="print-header hidden print:block bg-white border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          {empresaAtual.logo ? (
            <img src={empresaAtual.logo} alt="Logo" className="h-12 object-contain" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">PC</div>
          )}
          <div>
            <h1 className="text-xl font-bold">{empresaAtual.nome}</h1>
            <p className="text-sm text-muted-foreground">Relatório personalizado</p>
          </div>
        </div>
      </div>
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'lg:ml-[70px]' : 'lg:ml-[260px]'
        }`}
      >
        <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 lg:p-6 max-w-[1600px] mx-auto pb-20">
          <Outlet />
        </main>
        <footer className={`fixed bottom-0 right-0 z-20 bg-slate-900 text-slate-300 border-t border-slate-800`} style={{ height: '0.5cm', left: collapsed ? '70px' : '260px' }}>
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-full">
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm font-semibold tracking-tight">{empresaAtual.nome}</span>
            </div>
            <p className="text-xs text-slate-400">&copy; {getCurrentYear()} {empresaAtual.nome}. {t('rightsReserved')}</p>
            <div className="flex gap-4 text-xs text-slate-400">
              <a href="#" className="hover:text-white transition-colors">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('termsOfUse')}</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
