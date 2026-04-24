import React, { useState, useEffect, useContext } from 'react';
import { useCart } from '../context/CartContext';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Alert from '@mui/material/Alert'; // Ajout pour les messages d'erreur
import { useNavigate } from 'react-router-dom';
import { CurrencyContext } from '../context/CurrencyContext';
import '../styles/RecapPanier.css';

function RecapPanierPage() {
  const { panierItems, handleAjouterAuPanier, handleRetirer, handleToutRetirer } = useCart();
  const navigate = useNavigate();
  const { formatPrice } = useContext(CurrencyContext);
  
  // État pour stocker les erreurs de stock
  const [stockErrors, setStockErrors] = useState([]);

  // --- VÉRIFICATION DU STOCK ---
  useEffect(() => {
    const verifierStock = async () => {
      const errors = [];
      try {
        // On récupère les stocks à jour depuis le serveur pour chaque item du panier
        const response = await fetch('http://localhost:3001/api/vins'); 
        const vinsDisponibles = await response.json();

        panierItems.forEach(item => {
          const vinBDD = vinsDisponibles.find(v => v.id === item.id);
          if (vinBDD && item.quantity > vinBDD.quantity) {
            errors.push({
              id: item.id,
              name: item.name,
              dispo: vinBDD.quantity
            });
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
    if (hasStockIssue) {
      alert("Certains articles ne sont plus disponibles en quantité suffisante.");
      return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      alert("Veuillez vous connecter pour finaliser la commande.");
      navigate('/connexion');
      return;
    }

    const commande = {
      numUtilisateur: parseInt(userId),
      total_price: total,
      items: panierItems.map(item => ({
        id_vin: item.id,
        quantity: item.quantity,
        unit_price: item.price
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
        const errorData = await response.json();
        alert("Erreur lors du paiement : " + errorData.message);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Impossible de contacter le serveur de paiement.");
    }
  };

  return (
    <div className="page-container">
      <main className="recap-main">
        <h1>Mon Panier</h1>

        {/* Message d'alerte global si problème de stock */}
        {hasStockIssue && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Certains produits de votre panier dépassent le stock disponible. 
            Veuillez ajuster les quantités pour continuer.
          </Alert>
        )}

        {panierItems.length === 0 ? (
          <div className="panier-vide-container">
            <p>Votre panier est actuellement vide.</p>
            <Button 
              variant="contained" 
              onClick={() => navigate('/produits')} 
              sx={{ backgroundColor: '#4a0404' }}
            >
              Retour aux produits
            </Button>
          </div>
        ) : (
          <div className="recap-content">
            <div className="recap-items-list">
              {panierItems.map((item) => {
                // Vérifier si cet item précis a une erreur
                const error = stockErrors.find(e => e.id === item.id);
                
                return (
                  <div key={item.id} className={`recap-item-card ${error ? 'item-error' : ''}`}>
                    <div className="recap-item-info">
                      <h3>{item.name}</h3>
                      <p className="recap-item-category">{item.category}</p>
                      {error && (
                        <p className="stock-warning">
                          ⚠️ Seulement {error.dispo} bouteilles en stock.
                        </p>
                      )}
                    </div>

                    <div className="recap-item-controls">
                      <div className="qty-selector">
                        <IconButton size="small" onClick={() => handleRetirer(item.id)}>
                          <RemoveIcon />
                        </IconButton>
                        <span style={{ color: error ? 'red' : 'inherit', fontWeight: error ? 'bold' : 'normal' }}>
                            {item.quantity}
                        </span>
                        <IconButton size="small" onClick={() => handleAjouterAuPanier(item, 1)}>
                          <AddIcon />
                        </IconButton>
                      </div>
                      <p className="recap-item-subtotal">{formatPrice(item.price * item.quantity)}</p>
                      <IconButton color="error" onClick={() => handleToutRetirer(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="recap-summary">
              <h2>Résumé</h2>
              <div className="summary-details">
                <div className="summary-line">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <hr />
                <div className="summary-line total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                disabled={hasStockIssue} // BLOQUE LE BOUTON
                sx={{ 
                    backgroundColor: hasStockIssue ? '#ccc' : '#4a0404', 
                    mt: 3, 
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#630606' }
                }}
                onClick={handleFinaliserPaiement}
              >
                {hasStockIssue ? "Stock insuffisant" : "Passer au paiement"}
              </Button>
              
              <Button 
                variant="text" 
                fullWidth 
                sx={{ color: '#4a0404', mt: 1 }}
                onClick={() => navigate('/produits')}
              >
                Continuer mes achats
              </Button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default RecapPanierPage;