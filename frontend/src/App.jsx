import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Site Institucional
import SiteInstitucional from './pages/site/SiteInstitucional';

// Dashboard
import Dashboard from './pages/Dashboard';

// Módulos Core
import Navios from './pages/Navios';
import Atracagem from './pages/Atracagem';
import Escalas from './pages/Escalas';
import Pesagens from './pages/Pesagens';

// Módulos Operacionais
import Manifestos from './pages/Manifestos';
import Armazens from './pages/Armazens';
import ParqueContainers from './pages/ParqueContainers';
import Equipamentos from './pages/Equipamentos';
import Oficina from './pages/Oficina';
import Fiscalizacao from './pages/Fiscalizacao';

// Módulos Financeiros & Admin
import Faturacao from './pages/Faturacao';
import Tesouraria from './pages/Tesouraria';
import Compras from './pages/Compras';
import Pessoal from './pages/Pessoal';
import Remuneracoes from './pages/Remuneracoes';
import HorasExtras from './pages/HorasExtras';
import ControlePonto from './pages/ControlePonto';
import Configuracoes from './pages/Configuracoes';

// Direção Geral & Extras
import Secretaria from './pages/Secretaria';
import Diretoria from './pages/Diretoria';
import Estatisticas from './pages/Estatisticas';
import Notificacoes from './pages/Notificacoes';

function ProtectedRouteWithPermission({ children, permission }) {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/site" element={<SiteInstitucional />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Redirecionamento da raiz */}
        <Route path="/" element={<Navigate to="/site" replace />} />

        {/* Rotas Autenticadas (AppLayout) */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/navios" element={<ProtectedRouteWithPermission permission="Navios:Visualizar"><Navios /></ProtectedRouteWithPermission>} />
          <Route path="/atracagem" element={<ProtectedRouteWithPermission permission="Atracagem:Visualizar"><Atracagem /></ProtectedRouteWithPermission>} />
          <Route path="/escalas" element={<ProtectedRouteWithPermission permission="Escalas de Trabalho:Visualizar"><Escalas /></ProtectedRouteWithPermission>} />
          <Route path="/pesagens" element={<ProtectedRouteWithPermission permission="Pesagens:Visualizar"><Pesagens /></ProtectedRouteWithPermission>} />
          <Route path="/manifestos" element={<ProtectedRouteWithPermission permission="Manifestos:Visualizar"><Manifestos /></ProtectedRouteWithPermission>} />
          <Route path="/armazens" element={<ProtectedRouteWithPermission permission="Serviço de Armazéns:Visualizar"><Armazens /></ProtectedRouteWithPermission>} />
          <Route path="/parque-containers" element={<ProtectedRouteWithPermission permission="Serviço de Parque:Visualizar"><ParqueContainers /></ProtectedRouteWithPermission>} />
          <Route path="/equipamentos" element={<ProtectedRouteWithPermission permission="Equipamentos:Visualizar"><Equipamentos /></ProtectedRouteWithPermission>} />
          <Route path="/oficina" element={<ProtectedRouteWithPermission permission="Oficina:Visualizar"><Oficina /></ProtectedRouteWithPermission>} />
          <Route path="/fiscalizacao" element={<ProtectedRouteWithPermission permission="Fiscalização:Visualizar"><Fiscalizacao /></ProtectedRouteWithPermission>} />
          <Route path="/faturacao" element={<ProtectedRouteWithPermission permission="Faturação:Visualizar"><Faturacao /></ProtectedRouteWithPermission>} />
          <Route path="/tesouraria" element={<ProtectedRouteWithPermission permission="Tesouraria:Visualizar"><Tesouraria /></ProtectedRouteWithPermission>} />
          <Route path="/compras" element={<ProtectedRouteWithPermission permission="Compras:Visualizar"><Compras /></ProtectedRouteWithPermission>} />
          <Route path="/horas-extras" element={<ProtectedRouteWithPermission permission="Remunerações:Visualizar"><HorasExtras /></ProtectedRouteWithPermission>} />
          <Route path="/remuneracoes" element={<ProtectedRouteWithPermission permission="Remunerações:Visualizar"><Remuneracoes /></ProtectedRouteWithPermission>} />
          <Route path="/recursos-humanos" element={<ProtectedRouteWithPermission permission="Recursos Humanos:Visualizar"><Pessoal /></ProtectedRouteWithPermission>} />
          <Route path="/controlo-ponto" element={<ProtectedRouteWithPermission permission="Controlo de Ponto:Visualizar"><ControlePonto /></ProtectedRouteWithPermission>} />
          <Route path="/configuracoes" element={<ProtectedRouteWithPermission permission="Configurações:Visualizar"><Configuracoes /></ProtectedRouteWithPermission>} />
          <Route path="/secretaria" element={<ProtectedRouteWithPermission permission="Secretaria:Visualizar"><Secretaria /></ProtectedRouteWithPermission>} />
          <Route path="/diretoria" element={<ProtectedRouteWithPermission permission="Diretoria:Visualizar"><Diretoria /></ProtectedRouteWithPermission>} />
          <Route path="/estatisticas" element={<ProtectedRouteWithPermission permission="Estatísticas:Visualizar"><Estatisticas /></ProtectedRouteWithPermission>} />
          <Route path="/notificacoes" element={<ProtectedRouteWithPermission permission="Notificações:Visualizar"><Notificacoes /></ProtectedRouteWithPermission>} />
          <Route path="/pessoal" element={<Navigate to="/recursos-humanos" replace />} />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/site" replace />} />
      </Routes>
    </Router>
  );
}
