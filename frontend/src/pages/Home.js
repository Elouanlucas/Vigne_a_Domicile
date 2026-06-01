import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Homepage from '../components/Home';
import Recomandations from '../components/Recomandations';
import { useCart } from '../context/CartContext';

function Home() {
    const { handleAjouterAuPanier } = useCart();

    return (
        <div className="home-page-layout">
            {/* On enveloppe le Header dans un conteneur qui va le forcer à être fixe UNIQUEMENT sur cette page */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
            }}>
                <Header />
            </div>

            {/* Ce bloc contient tout le reste du contenu. 
              Le padding-top de 80px (à ajuster selon la hauteur de ton header) 
              permet d'éviter que la Homepage passe derrière le Header fixe.
            */}
            <div style={{ paddingTop: '80px' }}>
                <Homepage onAjouter={handleAjouterAuPanier} />

                <Recomandations onAjouter={handleAjouterAuPanier}/>
                
                <Footer />
            </div>
        </div>
    );
}

export default Home;