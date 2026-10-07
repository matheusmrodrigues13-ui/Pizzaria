import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pizza, Lock, User, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '@/lib/AdminAuth';
import { useToast } from '@/components/ui/use-toast';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (login(usuario, senha)) {
      toast({ title: 'Bem-vindo!', description: 'Login realizado com sucesso.' });
      navigate('/admin');
    } else {
      setErro('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-espresso grain-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-grid place-items-center w-16 h-16 rounded-full bg-gold text-espresso mb-4 shadow-lg">
            <Pizza className="w-8 h-8" />
          </span>
          <h1 className="font-heading text-3xl font-bold text-cream">La Tavola</h1>
          <p className="text-gold text-sm tracking-[0.2em] uppercase mt-1">Painel Administrativo</p>
        </div>

        <form onSubmit={submit} className="bg-sidebar rounded-2xl border border-gold/20 p-8 shadow-2xl space-y-5">
          <div>
            <label className="text-xs font-semibold text-cream/70 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Usuário</label>
            <input
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              autoFocus
              className="w-full mt-1.5 rounded-lg bg-espresso/50 border border-gold/20 px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
              placeholder="Loginho"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-cream/70 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="w-full mt-1.5 rounded-lg bg-espresso/50 border border-gold/20 px-4 py-3 text-cream text-sm focus:outline-none focus:border-gold"
              placeholder="••••••"
            />
          </div>

          {erro && <p className="text-destructive text-sm text-center bg-destructive/10 py-2 rounded-lg">{erro}</p>}

          <button type="submit" className="w-full bg-gold text-espresso font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-colors flex items-center justify-center gap-2 shadow-lg">
            Entrar <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center text-xs text-cream/40 pt-2 border-t border-gold/10">
            <p>Acesso restrito ao superior.</p>
            <p className="mt-1">Dica: usuário <code className="text-gold">Loginho</code> · senha <code className="text-gold">Senhas</code></p>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-cream/50 text-sm hover:text-gold transition-colors">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}