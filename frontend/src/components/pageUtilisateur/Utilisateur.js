import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import MaPage from './MaPage';
import SuiviCommande from './SuiviCommande';
import HistoriqueCommande from './HistoriqueCommande';

import '../../styles/Utilisateur.css';

function Utilisateur() {
    const [currentPage, setCurrentPage] = useState('intro');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const renderContent = () => {
        switch (currentPage) {
            case 'intro': return <MaPage user={user} />;
            case 'commande': return <SuiviCommande user={user} />;
            case 'historique': return <HistoriqueCommande user={user} />;
            default: return <MaPage user={user} />;
        }
    };

    return (
        <div className="user-layout">
            <nav className="user-sidebar">
                <h3>Menu utilisateur</h3>
                <ul>
                    <li className={currentPage === 'intro' ? 'active' : ''} 
                        onClick={() => setCurrentPage('intro')}>Vue d'ensemble</li>
                    <li className={currentPage === 'commande' ? 'active' : ''} 
                        onClick={() => setCurrentPage('commande')}>Suivi des commandes</li>
                    <li className={currentPage === 'historique' ? 'active' : ''} 
                        onClick={() => setCurrentPage('historique')}>Historique des commandes</li>
                </ul>
            </nav>

            <div className="user-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default Utilisateur;