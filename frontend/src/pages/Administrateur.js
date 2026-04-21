import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Administrateur from '../components/admin/Administrateur';

function AdministrateurPage() {
    return (
        <>
            <Header />
            
            <Administrateur />
            
            <Footer />
        </>
    );
}

export default AdministrateurPage;