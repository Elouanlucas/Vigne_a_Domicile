import React from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Homepage from '../components/Home';
import { useCart } from '../context/CartContext';

function Home() {
    const { handleAjouterAuPanier } = useCart();

    return (
        <>
        
            <Header />

            <Homepage onAjouter={handleAjouterAuPanier} />
            
            <Footer />
        
        </>

    );
}

export default Home;