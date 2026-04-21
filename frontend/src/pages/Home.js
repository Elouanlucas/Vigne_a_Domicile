import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Homepage from '../components/Home'; // Ton catalogue de vins
import { useCart } from '../context/CartContext';

function Home() {
    const { handleAjouterAuPanier } = useCart();

    return (
        <div className="page-container">
            <Header />
            <main>
                <Homepage onAjouter={handleAjouterAuPanier} />
            </main>
            <Footer />
        </div>
    );
}

export default Home;