import React, { createContext, useState, useEffect } from 'react';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  // On récupère la devise sauvegardée ou on met EUR par défaut
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'EUR');

  const currencyMap = {
    EUR: { symbol: '€', rate: 1 },
    USD: { symbol: '$', rate: 1.08 }, // Taux fixes pour l'exemple
    GBP: { symbol: '£', rate: 0.85 },
    CHF: { symbol: 'CHF', rate: 0.96 },
    JPY: { symbol: '¥', rate: 160 },
  };

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Fonction pour formater le prix proprement
  const formatPrice = (priceInEuro) => {
    const { symbol, rate } = currencyMap[currency];
    const converted = (priceInEuro * rate).toFixed(2);
    return `${converted}${symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, currencyMap }}>
      {children}
    </CurrencyContext.Provider>
  );
};