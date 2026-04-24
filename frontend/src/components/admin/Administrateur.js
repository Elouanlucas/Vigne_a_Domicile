import React, { useState, useEffect } from 'react';
import AdminIntro from './AdminIntro';
import GestionnaireCompte from './GestionCompte';
import GestionVin from './GestionVin';
import Commande from './Commande';
import Stoke from './Stocks';
import Statistique from './Statistique';
import '../../styles/Administrateur.css';

function Administrateur() {
    const [currentPage, setCurrentPage] = useState('intro');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const renderContent = () => {
        switch (currentPage) {
            case 'intro': return <AdminIntro user={user} />;
            case 'comptes': return <GestionnaireCompte user={user} />;
            case 'vins': return <GestionVin user={user} />;
            case 'commande': return <Commande user={user} />;
            case 'stoke': return <Stoke user={user} />;
            case 'statistique': return <Statistique user={user} />;
            default: return <AdminIntro user={user} />;
        }
    };

    return (
        <div className="admin-layout">
            <nav className="admin-sidebar">
                <h3>Menu Admin</h3>
                <ul>
                    <li className={currentPage === 'intro' ? 'active' : ''} 
                        onClick={() => setCurrentPage('intro')}>Vue d'ensemble</li>
                </ul>
                <h3>Gestion des Utilisateurs/Vins</h3>
                <ul>
                    <li className={currentPage === 'comptes' ? 'active' : ''} 
                        onClick={() => setCurrentPage('comptes')}>Utilisateurs</li>
                    <li className={currentPage === 'vins' ? 'active' : ''} 
                        onClick={() => setCurrentPage('vins')}>Vins</li>
                </ul>
                <h3>Commande</h3>
                <ul>
                    <li className={currentPage === 'commande' ? 'active' : ''} 
                        onClick={() => setCurrentPage('commande')}>Commandes</li>
                </ul>
                <h3>Stock</h3>
                <ul>
                    <li className={currentPage === 'stoke' ? 'active' : ''} 
                        onClick={() => setCurrentPage('stoke')}>Stocks</li>
                </ul>
                <h3>Statistiques</h3>
                <ul>
                    <li className={currentPage === 'statistique' ? 'active' : ''} 
                        onClick={() => setCurrentPage('statistique')}>Statistiques</li>
                </ul>
            </nav>

            <div className="admin-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default Administrateur;