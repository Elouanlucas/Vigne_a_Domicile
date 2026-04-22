import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Produit from './pages/Produit';
import APropos from './pages/APropos';
import Error from './pages/Error';
import Preferences from './pages/Preferences';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import UserPage from './pages/Utilisateur';
import Administrateur from './pages/Administrateur';
import RecapPanier from './pages/RecapPanier';
import Paier from './pages/Paier';
import 'leaflet/dist/leaflet.css';


import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <CurrencyProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Ici, on définit quelle page afficher selon l'URL */}
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/produits" element={<Produit />} />
              <Route path="/APropos" element={<APropos />} />
              <Route path="/Preferences" element={<Preferences />} />
              <Route path="/connexion" element={<Connexion />} />
              <Route path="/inscription" element={<Inscription />} />
              <Route path="/Utilisateur" element={<UserPage />} />
              <Route path="/Administrateur" element={<Administrateur />} />
              <Route path="/RecapPanier" element={<RecapPanier />} />
              <Route path="/paiement" element={<Paier />} />
            
              

              <Route path="*" element={<Error />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </React.StrictMode>
);

