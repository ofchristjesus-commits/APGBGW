import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function appendAuthLog(action, user) {
  if (typeof window === 'undefined') return;
  const storageKey = 'portocais_logsSistema';
  const entry = {
    id: Date.now(),
    tipo: 'Autenticação',
    mensagem: `${action} ${user?.email || 'utilizador'}`,
    detalhe: `${user?.nome || user?.email || 'Sistema'} ${action === 'login' ? 'iniciou sessão' : action === 'logout' ? 'terminou sessão' : 'registou uma conta'}.`,
    usuario: user?.nome || user?.email || 'Sistema',
    data: new Date().toISOString(),
  };
  const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
  localStorage.setItem(storageKey, JSON.stringify([...existing, entry]));
  window.dispatchEvent(new CustomEvent('entity-updated', { detail: 'logsSistema' }));
}

const AuthContext = createContext(null);

const DEFAULT_USER = {
  nome: 'Administrador',
  email: 'admin@portocais.tg',
  cargo: 'Diretor Geral',
};

function getStoredUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('portocais_utilizadores');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findUserByCredentials(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '').trim();
  const users = getStoredUsers();

  const match = users.find((user) => {
    const storedEmail = String(user?.email || '').trim().toLowerCase();
    const storedPassword = String(user?.senha || '').trim();
    return storedEmail === normalizedEmail && storedPassword === normalizedPassword;
  });

  if (match) {
    return {
      nome: match.nome || match.email,
      email: match.email,
      cargo: match.perfil || match.cargo || 'Utilizador',
      perfil: match.perfil || 'Operador',
      privilegios: Array.isArray(match.privilegios) ? match.privilegios : [],
      ...(match.senha ? { senha: match.senha } : {}),
    };
  }

  if (normalizedEmail === 'admin@portocais.tg' && normalizedPassword === 'admin123') {
    return { ...DEFAULT_USER, email: normalizedEmail, senha: 'admin123' };
  }

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.email === 'admin@portocais.tg') return true;
    const privileges = Array.isArray(user.privilegios) ? user.privilegios : [];
    return privileges.includes(permission);
  };

  useEffect(() => {
    const stored = localStorage.getItem('portocais_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const userData = findUserByCredentials(email, password);
    if (!userData) {
      return false;
    }

    localStorage.setItem('portocais_user', JSON.stringify(userData));
    setUser(userData);
    appendAuthLog('login', userData);
    return true;
  };

  const register = (nome, email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const userData = {
      nome,
      email: normalizedEmail,
      cargo: 'Utilizador',
      perfil: 'Operador',
      senha: password,
      ativo: true,
      privilegios: [],
    };

    const users = getStoredUsers();
    const existingIndex = users.findIndex((user) => String(user?.email || '').trim().toLowerCase() === normalizedEmail);
    const updatedUsers = existingIndex >= 0
      ? users.map((user, index) => index === existingIndex ? { ...user, ...userData } : user)
      : [...users, userData];

    localStorage.setItem('portocais_utilizadores', JSON.stringify(updatedUsers));
    localStorage.setItem('portocais_user', JSON.stringify(userData));
    setUser(userData);
    appendAuthLog('register', userData);
    return true;
  };

  const logout = () => {
    appendAuthLog('logout', user);
    localStorage.removeItem('portocais_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return user ? children : null;
}
