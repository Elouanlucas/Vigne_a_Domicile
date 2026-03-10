import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [panierItems, setPanierItems] = useState([]);

  const handleAjouterAuPanier = (vin, quantity) => {
    setPanierItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === vin.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === vin.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...vin, quantity: quantity }];
      }
    });
  };

  const handleRetirer = (id) => {
    setPanierItems((prevItems) => {
      const item = prevItems.find(item => item.id === id);
      
      if (item.quantity > 1) {
        return prevItems.map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevItems.filter(item => item.id !== id);
      }
    });
  };

  const handleToutRetirer = (id) => {
    if (id === null) {
      setPanierItems([]);
    } else {
      setPanierItems((prevItems) => prevItems.filter(item => item.id !== id));
    }
  };

  return (
    <CartContext.Provider value={{
      panierItems,
      handleAjouterAuPanier,
      handleRetirer,
      handleToutRetirer
    }}>
      {children}
    </CartContext.Provider>
  );
};