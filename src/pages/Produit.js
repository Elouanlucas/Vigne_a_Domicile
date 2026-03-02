import Footer from '../components/Footer';
import Header from '../components/Header';
import Panier from '../components/Panier';
import Produits from '../components/Selection_Produits';
import { useState } from 'react';
import '../styles/Produit.css';

function Produit() {
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
    <>
      <Header />
      <div className="home-content">
        <div className="Produits_style">
          <Produits onAjouter={handleAjouterAuPanier} />
        </div>
        <div className="Panier_style">
          <Panier items={panierItems} onRetirer={handleRetirer} onToutRetirer={handleToutRetirer}/>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Produit;