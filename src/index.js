import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Produit from './pages/Produit';
import APropos from './pages/APropos';
import { CartProvider } from './context/CartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Ici, on définit quelle page afficher selon l'URL */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/produits" element={<Produit />} />
          <Route path="/APropos" element={<APropos />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);

