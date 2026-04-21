import React from 'react';
import { useCart } from '../context/CartContext';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import '../styles/RecapPanier.css';

function RecapPanierPage() {
  const { panierItems, handleAjouterAuPanier, handleRetirer, handleToutRetirer } = useCart();
  const navigate = useNavigate();

  const total = panierItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="page-container">
      
      <main className="recap-main">
        <h1>Mon Panier</h1>

        {panierItems.length === 0 ? (
          <div className="panier-vide-container">
            <p>Votre panier est actuellement vide.</p>
            <Button variant="contained" onClick={() => navigate('/produits')} sx={{ backgroundColor: '#4a0404' }}>
              Retour aux produits
            </Button>
          </div>
        ) : (
          <div className="recap-content">
            {/* TABLEAU DES ARTICLES */}
            <div className="recap-items-list">
              {panierItems.map((item) => (
                <div key={item.id} className="recap-item-card">
                  <div className="recap-item-info">
                    <h3>{item.name}</h3>
                    <p className="recap-item-category">{item.category}</p>
                  </div>

                  <div className="recap-item-controls">
                    <div className="qty-selector">
                      <IconButton size="small" onClick={() => handleRetirer(item.id)}>
                        <RemoveIcon />
                      </IconButton>
                      <span>{item.quantity}</span>
                      <IconButton size="small" onClick={() => handleAjouterAuPanier(item, 1)}>
                        <AddIcon />
                      </IconButton>
                    </div>
                    <p className="recap-item-subtotal">{(item.price * item.quantity).toFixed(2)}€</p>
                    <IconButton color="error" onClick={() => handleToutRetirer(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            {/* RESUME DU PAIEMENT */}
            <aside className="recap-summary">
              <h2>Résumé</h2>
              <div className="summary-details">
                <div className="summary-line">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <hr />
                <div className="summary-line total">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              </div>
              
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                sx={{ backgroundColor: '#4a0404', mt: 3, fontWeight: 'bold' }}
              >
                Passer au paiement
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