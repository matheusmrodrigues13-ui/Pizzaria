import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from '@/lib/CartContext';
import { AdminAuthProvider } from '@/lib/AdminAuth';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Cardapio from '@/pages/Cardapio';
import Reserva from '@/pages/Reserva';
import Acompanhamento from '@/pages/Acompanhamento';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminRoute from '@/components/admin/AdminRoute';
import Dashboard from '@/pages/admin/Dashboard';
import PedidosAdmin from '@/pages/admin/PedidosAdmin';
import MesasAdmin from '@/pages/admin/MesasAdmin';
import ReservasAdmin from '@/pages/admin/ReservasAdmin';
import ProdutosAdmin from '@/pages/admin/ProdutosAdmin';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Perfil from '@/pages/Perfil';
import Promocoes from '@/pages/Promocoes';
import Contato from '@/pages/Contato';
import ConfiguracoesAdmin from '@/pages/admin/ConfiguracoesAdmin';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AdminAuthProvider>
      <CartProvider>
        <Routes>
          {/* Autenticação de clientes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Área do cliente */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cardapio" element={<Cardapio />} />
            <Route path="/promocoes" element={<Promocoes />} />
            <Route path="/reserva" element={<Reserva />} />
            <Route path="/acompanhamento" element={<Acompanhamento />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/contato" element={<Contato />} />
          </Route>

          {/* Área do administrador */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<Dashboard />} />
            <Route path="pedidos" element={<PedidosAdmin />} />
            <Route path="mesas" element={<MesasAdmin />} />
            <Route path="reservas" element={<ReservasAdmin />} />
            <Route path="produtos" element={<ProdutosAdmin />} />
            <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </CartProvider>
    </AdminAuthProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App