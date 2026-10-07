import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'latavola_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Gera uma chave única para o item baseada em suas customizações
  const itemKey = (item) => JSON.stringify({
    id: item.id,
    tipo: item.tipo,
    tamanho: item.tamanho || null,
    borda: item.borda || null,
    meio: item.meio_a_meio ? `${item.sabor1_id}|${item.sabor2_id}` : null,
    adicionais: (item.adicionais || []).map(a => a.id).sort(),
    remocoes: (item.remocoes || []).sort(),
    observacoes: item.observacoes || null,
  });

  const addItem = useCallback((item) => {
    const key = itemKey(item);
    setItems(prev => {
      const existing = prev.find(i => itemKey(i) === key);
      if (existing) {
        return prev.map(i => itemKey(i) === key ? { ...i, quantidade: i.quantidade + (item.quantidade || 1) } : i);
      }
      return [...prev, { ...item, quantidade: item.quantidade || 1, _key: key }];
    });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback((key, quantidade) => {
    if (quantidade <= 0) {
      setItems(prev => prev.filter(i => itemKey(i) !== key));
    } else {
      setItems(prev => prev.map(i => itemKey(i) === key ? { ...i, quantidade } : i));
    }
  }, []);

  const removeItem = useCallback((key) => {
    setItems(prev => prev.filter(i => itemKey(i) !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.preco_unitario * i.quantidade, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantidade, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, updateQty, removeItem, clearCart,
      isOpen, setIsOpen,
      subtotal, totalItems,
      itemKey
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}