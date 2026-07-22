import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setEnviado(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-4">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

      <div className="card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Anchor size={28} className="text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Recuperar Senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Insira o seu email para receber as instruções
          </p>
        </div>

        {enviado ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
              Instruções de recuperação enviadas para <strong>{email}</strong>. Por favor, verifique a sua caixa de entrada.
            </div>
            <Link to="/login" className="btn-primary w-full justify-center py-2.5 inline-flex">
              Voltar ao Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5">
              Enviar Instruções
            </button>
          </form>
        )}

        {!enviado && (
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft size={14} />
              Voltar ao Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
