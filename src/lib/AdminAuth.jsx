import React, { createContext, useContext, useState, useCallback } from 'react';

const AdminAuthContext = createContext(null);

// Credenciais do superior (projeto escolar/local — gate simples)
const ADMIN_USER = 'Loginho';
const ADMIN_PASS = 'Senhas';
const SESSION_KEY = 'latavola_admin';

export function AdminAuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');

  const login = useCallback((usuario, senha) => {
    if (usuario.trim() === ADMIN_USER && senha === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setIsAuthed(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthed(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthed, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider');
  return ctx;
}