import Footer from '../components/Footer';
import Header from '../components/Header';
import Panier from '../components/Panier';
import Produits from '../components/Produits';
import '../styles/Produit.css';

function Home() {
  return (
    <>
      <Header />
      <div className="home-content">
        <div className="Produits_style">
          <Produits />
        </div>
        <div className="Panier_style">
        <Panier />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Home;