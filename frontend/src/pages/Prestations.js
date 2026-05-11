import Header from '../components/Header';
import Footer from '../components/Footer';
import PrestationsList from '../components/prestations/Prestation'; // Ton composant de liste
import Panier from '../components/Panier';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import '../styles/Produit.css'; 

function PrestationsPage() {
  const [isPanierOpen, setIsPanierOpen] = useState(false);
  const { panierItems, handleAjouterAuPanier, handleRetirer, handleToutRetirer } = useCart();

  const togglePanier = () => {
    setIsPanierOpen(!isPanierOpen);
  };

  return (
    <>
      {/* On passe le toggle au header pour que le bouton panier fonctionne */}
      <Header onTogglePanier={togglePanier} />
      
      <div className="home-content">
        {/* La liste des prestations prend la place principale */}
        <div className="Produits_style">
          <PrestationsList />
        </div>

        {/* Le panier s'affiche à droite s'il est ouvert */}
        {isPanierOpen && (
          <div className="Panier_style">
            <Panier 
                items={panierItems} 
                onRetirer={handleRetirer} 
                onToutRetirer={handleToutRetirer}
            />
          </div>
        )}
      </div>
      
      <Footer />
    </>
  );
}

export default PrestationsPage;