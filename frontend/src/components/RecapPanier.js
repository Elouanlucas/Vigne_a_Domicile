import React from 'react';
import { useCart } from '../context/CartContext';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CurrencyContext } from '../context/CurrencyContext';
import '../styles/RecapPanier.css';


function RecapPanierPage() {
  const { panierItems, handleAjouterAuPanier, handleRetirer, handleToutRetirer, setPanierItems } = useCart();
  const navigate = useNavigate();

  const { formatPrice } = useContext(CurrencyContext);

  const total = panierItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // --- FONCTION DE PAIEMENT FINALE ---
  const handleFinaliserPaiement = async () => {
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
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commande),
      });

      if (response.ok) {
        alert("Paiement validé ! Merci de votre commande.");
        // Une fois payé, on vide le panier localement
        setPanierItems([]); 
        // On redirige vers l'accueil ou une page de succès
        navigate('/');
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
                      <p className="recap-item-subtotal">{formatPrice(item.price * item.quantity)}</p>                    <IconButton color="error" onClick={() => handleToutRetirer(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>

            {/* RÉSUMÉ DU PAIEMENT */}
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
                sx={{ 
                    backgroundColor: '#4a0404', 
                    mt: 3, 
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#630606' }
                }}
                onClick={handleFinaliserPaiement} // La fonction est branchée ici !
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