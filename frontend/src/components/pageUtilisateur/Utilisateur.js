import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import MaPage from './MaPage';
import SuiviCommande from './SuiviCommande';
import HistoriqueCommande from './HistoriqueCommande';
import GestionPrestation from './GestionPrestation';
import DeclarationLitiges from './DeclarationLitiges';
import SuiviLitige from './SuiviLitige';

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
            case 'prestation': return <GestionPrestation user={user} />;
            case 'litige': return <DeclarationLitiges user={user} />;
            case 'suivi-litige': return <SuiviLitige user={user} />;
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

                </ul>
                <h3>Commandes</h3>
                <ul>
                    <li className={currentPage === 'commande' ? 'active' : ''} 
                        onClick={() => setCurrentPage('commande')}>Suivi des commandes</li>
                    <li className={currentPage === 'historique' ? 'active' : ''} 
                        onClick={() => setCurrentPage('historique')}>Historique des commandes</li>
                </ul>
                <h3>Prestations</h3>
                <ul>
                    <li className={currentPage === 'prestation' ? 'active' : ''} 
                        onClick={() => setCurrentPage('prestation')}>Gestion des prestations</li>
                </ul>
                <h3>Litiges</h3>
                <ul>
                    <li className={currentPage === 'litige' ? 'active' : ''} 
                        onClick={() => setCurrentPage('litige')}>Declaration des litiges</li>
                    <li className={currentPage === 'suivi-litige' ? 'active' : ''}
                        onClick={() => setCurrentPage('suivi-litige')}>Suivi des litiges</li>
                </ul>
            </nav>

            <div className="user-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default Utilisateur;