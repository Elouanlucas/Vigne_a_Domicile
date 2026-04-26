import React, { useState, useEffect, useContext } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { CurrencyContext } from '../context/CurrencyContext';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Alert from '@mui/material/Alert';
import '../styles/RecapPanier.css';

function RecapPanierPage() {
    const { panierItems, handleAjouterAuPanier, handleRetirer, handleToutRetirer } = useCart();
    const navigate = useNavigate();
    const { formatPrice } = useContext(CurrencyContext);
    const [stockErrors, setStockErrors] = useState([]);

    // Vérification des stocks en temps réel
    useEffect(() => {
        const verifierStock = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/vins');
                const vinsDisponibles = await response.json();
                const errors = [];

                panierItems.forEach(item => {
                    const vinBDD = vinsDisponibles.find(v => v.id === item.id);
                    if (vinBDD && item.quantity > vinBDD.quantity) {
                        errors.push({ id: item.id, name: item.name, dispo: vinBDD.quantity });
                    }
                });
                setStockErrors(errors);
            } catch (error) {
                console.error("Erreur vérification stock:", error);
            }
        };
        if (panierItems.length > 0) verifierStock();
    }, [panierItems]);

    const total = panierItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const hasStockIssue = stockErrors.length > 0;

    const handleFinaliserPaiement = async () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
            alert("Veuillez vous connecter.");
            navigate('/connexion');
            return;
        }

        // Préparation des données pour l'API
        const commande = {
            numUtilisateur: parseInt(userId),
            total_price: total,
            items: panierItems.map(item => ({
                id_vin: item.isPrestation ? null : item.id,
                id_prestation: item.isPrestation ? item.id.split('-')[1] : null,
                quantity: item.quantity,
                unit_price: item.price,
                date: item.details?.date,
                address: item.details?.address,
                isPrestation: !!item.isPrestation
            }))
        };

        try {
            const response = await fetch('http://localhost:3001/api/orders/panier', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(commande),
            });

            if (response.ok) {
                navigate('/paiement');
            } else {
                const err = await response.json();
                alert("Erreur : " + err.error);
            }
        } catch (error) {
            alert("Serveur injoignable");
        }
    };

    return (
        <div className="page-container">
            <main className="recap-main">
                <h1>Mon Panier</h1>
                {hasStockIssue && <Alert severity="error" sx={{ mb: 2 }}>Stock insuffisant pour certains articles.</Alert>}

                {panierItems.length === 0 ? (
                    <p>Votre panier est vide.</p>
                ) : (
                    <div className="recap-content">
                        <div className="recap-items-list">
                            {panierItems.map((item) => {
                                const error = stockErrors.find(e => e.id === item.id);
                                return (
                                    <div key={item.id} className="recap-item-card">
                                        <h3>{item.name}</h3>
                                        <p>{formatPrice(item.price)} x {item.quantity}</p>
                                        {error && <p style={{color: 'red'}}>Max disponible : {error.dispo}</p>}
                                        <IconButton onClick={() => handleRetirer(item.id)}><RemoveIcon /></IconButton>
                                        <IconButton onClick={() => handleAjouterAuPanier(item, 1)}><AddIcon /></IconButton>
                                        <IconButton onClick={() => handleToutRetirer(item.id)}><DeleteIcon /></IconButton>
                                    </div>
                                );
                            })}
                        </div>
                        <aside className="recap-summary">
                            <h2>Total : {formatPrice(total)}</h2>
                            <Button 
                                variant="contained" 
                                disabled={hasStockIssue} 
                                onClick={handleFinaliserPaiement}
                                sx={{ backgroundColor: '#4a0404' }}
                            >
                                Passer au paiement
                            </Button>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

export default RecapPanierPage;