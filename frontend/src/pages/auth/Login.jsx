import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Anchor, Eye, EyeOff } from 'lucide-react';
import { useEntity } from '../../hooks/useEntity';

export default function Login() {
  const { items: empresa } = useEntity('empresa');
  const empresaAtual = empresa[0] || { nome: 'APGB S.A.', logo: null };
  const [email, setEmail] = useState('admin@portocais.tg');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-4">
      {/* Blobs decorativos */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />

      <div className="card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            {empresaAtual.logo ? (
              <img src={empresaAtual.logo} alt={empresaAtual.nome} className="h-12 w-12 rounded-xl object-contain" />
            ) : (
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Anchor size={28} className="text-primary" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">{empresaAtual.nome}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de Gestão Portuária
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Palavra-passe</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border" />
              <span className="text-muted-foreground">Lembrar-me</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline">
              Esqueci a senha
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5">
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Registe-se
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/site" className="text-xs text-muted-foreground hover:text-primary">
            ← Voltar ao site institucional
          </Link>
        </div>
      </div>
    </div>
  );
}
