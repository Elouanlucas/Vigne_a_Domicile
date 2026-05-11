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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import '../styles/RecapPanier.css';

function RecapPanierPage() {
    const { panierItems, handleAjouterAuPanier, handleRetirer, handleToutRetirer } = useCart();
    const navigate = useNavigate();
    const { formatPrice } = useContext(CurrencyContext);
    const [stockErrors, setStockErrors] = useState([]);

    // --- LOGIQUE DE CALCUL DU PRIX RÉEL (PROMO) ---
    const getEffectivePrice = (item) => {
        if (!item.isPrestation && item.promotion_percentage > 0) {
            return item.price * (1 - item.promotion_percentage / 100);
        }
        return item.price;
    };

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

    // Calcul du total basé sur les prix remisés
    const total = panierItems.reduce((sum, item) => sum + getEffectivePrice(item) * item.quantity, 0);
    const hasStockIssue = stockErrors.length > 0;

    const handleFinaliserPaiement = async () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
            alert("Veuillez vous connecter.");
            navigate('/connexion');
            return;
        }

        // Préparation des données pour l'API avec les prix unitaires remisés
        const commande = {
            numUtilisateur: parseInt(userId),
            total_price: total,
            items: panierItems.map(item => ({
                id_vin: item.isPrestation ? null : item.id,
                id_prestation: item.isPrestation ? item.id.split('-')[1] : null,
                quantity: item.quantity,
                unit_price: getEffectivePrice(item), // ON ENVOIE LE PRIX RÉEL PAYÉ
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
                <h1>Récapitulatif de ma commande</h1>
                {hasStockIssue && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Attention : Certains articles ne sont plus disponibles en quantité suffisante.
                    </Alert>
                )}

                {panierItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <p>Votre panier est actuellement vide.</p>
                        <Button onClick={() => navigate('/produits')} sx={{ color: '#4a0404' }}>
                            Retourner à la boutique
                        </Button>
                    </Box>
                ) : (
                    <div className="recap-content">
                        <div className="recap-items-list">
                            {panierItems.map((item) => {
                                const error = stockErrors.find(e => e.id === item.id);
                                const effectivePrice = getEffectivePrice(item);
                                const hasPromo = !item.isPrestation && item.promotion_percentage > 0;

                                return (
                                    <div key={item.id} className="recap-item-card" style={{ borderLeft: hasPromo ? '4px solid #e67e22' : '1px solid #ddd' }}>
                                        <div className="recap-item-info">
                                            <h3>{item.name}</h3>
                                            
                                            {/* Affichage du prix remisé */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <Typography sx={{ fontWeight: 'bold', color: hasPromo ? '#e67e22' : 'inherit' }}>
                                                    {formatPrice(effectivePrice)}
                                                </Typography>
                                                {hasPromo && (
                                                    <Typography sx={{ textDecoration: 'line-through', color: '#999', fontSize: '0.85rem' }}>
                                                        {formatPrice(item.price)}
                                                    </Typography>
                                                )}
                                                <Typography variant="body2">x {item.quantity}</Typography>
                                            </Box>

                                            {error && <Typography color="error" variant="caption">Max disponible : {error.dispo}</Typography>}
                                        </div>

                                        <div className="recap-item-actions">
                                            <IconButton onClick={() => handleRetirer(item.id)} color="primary"><RemoveIcon /></IconButton>
                                            <span className="qty-display">{item.quantity}</span>
                                            <IconButton 
                                                onClick={() => handleAjouterAuPanier(item, 1)} 
                                                disabled={error} // Bloque l'ajout si le stock est atteint
                                                color="primary"
                                            >
                                                <AddIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleToutRetirer(item.id)} sx={{ ml: 2, color: '#888' }}><DeleteIcon /></IconButton>
                                        </div>
                                        
                                        <div className="recap-item-subtotal">
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {formatPrice(effectivePrice * item.quantity)}
                                            </Typography>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <aside className="recap-summary">
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Résumé</Typography>
                            <div className="summary-row">
                                <span>Sous-total</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Livraison</span>
                                <span style={{ color: 'green' }}>Gratuite</span>
                            </div>
                            <hr />
                            <div className="summary-row total">
                                <strong>Total TTC</strong>
                                <strong>{formatPrice(total)}</strong>
                            </div>

                            <Button 
                                variant="contained" 
                                fullWidth
                                disabled={hasStockIssue} 
                                onClick={handleFinaliserPaiement}
                                sx={{ 
                                    backgroundColor: '#4a0404', 
                                    mt: 3, 
                                    py: 1.5,
                                    '&:hover': { backgroundColor: '#7a0606' } 
                                }}
                            >
                                Valider et Payer
                            </Button>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

export default RecapPanierPage;