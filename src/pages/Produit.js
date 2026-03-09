import Footer from '../components/Footer';
import Header from '../components/Header';
import Panier from '../components/Panier';
import Produits from '../components/Selection_Produits';
import { useCart } from '../context/CartContext';
import '../styles/Produit.css';

function Produit() {
  const { panierItems, handleAjouterAuPanier, handleRetirer, handleToutRetirer } = useCart();

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