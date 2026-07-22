import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEntity } from '../../hooks/useEntity';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Ship, Anchor, Users, Scale,
  FileText, Package, Warehouse, Container, Wrench, Shield, Settings,
  Receipt, Wallet, ShoppingCart, Plus, UserCircle, BarChart3,
  Bell, ChevronLeft, ChevronRight, ChevronDown,
  Calendar, Briefcase, UserCheck, Clock3
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { t } = useTranslation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { items: empresa } = useEntity('empresa');
  const { hasPermission } = useAuth();
  const empresaAtual = empresa[0] || { nome: 'Porto Cais' };

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, permission: 'Dashboard:Visualizar' },
    { path: '/secretaria', label: t('secretaria'), icon: Calendar, permission: 'Secretaria:Visualizar' },
    { path: '/diretoria', label: t('diretoria'), icon: Briefcase, permission: 'Diretoria:Visualizar' },
    {
      label: 'Operações Portuárias', icon: Ship, submenu: [
        { path: '/navios', label: 'Navios', icon: Ship, permission: 'Navios:Visualizar' },
        { path: '/atracagem', label: 'Atracagem', icon: Anchor, permission: 'Atracagem:Visualizar' },
      ]
    },
    {
      label: 'Cais e Estiva', icon: Anchor, submenu: [
        { path: '/escalas', label: 'Escalas de Trabalho', icon: Users, permission: 'Escalas de Trabalho:Visualizar' },
        { path: '/horas-extras', label: 'Horas Extras', icon: Clock3, permission: 'Remunerações:Visualizar' },
      ]
    },
    {
      label: t('serviceWarehouse'), icon: Warehouse, submenu: [
        { path: '/armazens', label: t('warehouses'), icon: Warehouse, permission: 'Serviço de Armazéns:Visualizar' },
        { path: '/manifestos', label: t('manifests'), icon: FileText, permission: 'Manifestos:Visualizar' },
      ]
    },
    { path: '/parque-containers', label: t('containers'), icon: Container, permission: 'Serviço de Parque:Visualizar' },
    {
      label: t('serviceMachines'), icon: Wrench, submenu: [
        { path: '/equipamentos', label: t('equipment'), icon: Wrench, permission: 'Equipamentos:Visualizar' },
        { path: '/oficina', label: t('workshop'), icon: Settings, permission: 'Oficina:Visualizar' },
      ]
    },
    {
      label: t('inspection'), icon: Shield, submenu: [
        { path: '/fiscalizacao', label: t('inspection'), icon: Shield, permission: 'Fiscalização:Visualizar' },
        { path: '/pesagens', label: 'Serviço de Báscula', icon: Scale, permission: 'Pesagens:Visualizar' },
      ]
    },
    {
      label: t('financialServices'), icon: Receipt, submenu: [
        { path: '/faturacao', label: t('billing'), icon: Receipt, permission: 'Faturação:Visualizar' },
        { path: '/tesouraria', label: t('treasury'), icon: Wallet, permission: 'Tesouraria:Visualizar' },
        { path: '/compras', label: t('purchasing'), icon: ShoppingCart, permission: 'Compras:Visualizar' },
        { path: '/remuneracoes', label: t('remuneration'), icon: UserCheck, permission: 'Remunerações:Visualizar' },
      ]
    },
    {
      label: t('hr'), icon: UserCircle, submenu: [
        { path: '/recursos-humanos', label: t('hr'), icon: Users, permission: 'Recursos Humanos:Visualizar' },
        { path: '/controlo-ponto', label: t('timeClock'), icon: Calendar, permission: 'Controlo de Ponto:Visualizar' },
      ]
    },
    { path: '/estatisticas', label: t('statistics'), icon: BarChart3, permission: 'Estatísticas:Visualizar' },
    { path: '/configuracoes', label: t('settings'), icon: Wrench, permission: 'Configurações:Visualizar' },
    { path: '/notificacoes', label: t('notifications'), icon: Bell, permission: 'Notificações:Visualizar' },
  ];

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const renderItem = (item, index) => {
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }

    if (item.submenu) {
      // Filtrar subitens que o utilizador tem permissão para ver
      const visibleSubitems = item.submenu.filter(sub => !sub.permission || hasPermission(sub.permission));
      
      // Se não há subitens visíveis, não renderizar o item pai
      if (visibleSubitems.length === 0) {
        return null;
      }
      
      const isOpen = openSubmenu === item.label;
      return (
        <div key={index}>
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm">{item.label}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {isOpen && !collapsed && (
            <div className="ml-4 mt-0.5 space-y-0.5">
              {visibleSubitems.map((sub, subIdx) => (
                <NavLink
                  key={subIdx}
                  to={sub.path}
                  onClick={() => setMobileOpen?.(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-sidebar-active text-primary font-medium'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-hover'
                    }`
                  }
                >
                  <sub.icon size={16} className="shrink-0" />
                  <span>{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={index}
        to={item.path}
        onClick={() => setMobileOpen?.(false)}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            collapsed ? 'justify-center' : ''
          } ${
            isActive
              ? 'bg-sidebar-active text-primary font-medium'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover'
          }`
        }
        title={collapsed ? item.label : undefined}
      >
        <item.icon size={20} className="shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar fixed top-0 left-0 h-full bg-sidebar z-50 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-[70px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          {empresaAtual.logo ? (
            <img src={empresaAtual.logo} alt={empresaAtual.nome} className="h-10 w-10 rounded-lg object-contain" />
          ) : (
            <Anchor size={28} className="text-primary shrink-0" />
          )}
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-tight">{empresaAtual.nome}</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item, idx) => renderItem(item, idx))}
        </nav>

        {/* Collapse Button (desktop only) */}
        <div className="hidden lg:block px-3 py-3 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-hover transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className="text-xs">Recolher menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
