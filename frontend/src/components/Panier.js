import React, { useContext } from 'react';
import '../styles/index.css';
import '../styles/Panier.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'; 
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; 
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { CurrencyContext } from '../context/CurrencyContext';

const Panier = ({ items, onRetirer, onToutRetirer }) => {
  const navigate = useNavigate();
  const { formatPrice } = useContext(CurrencyContext);
  
  // --- LOGIQUE DE CALCUL DU PRIX RÉEL ---
  // Calcule le prix après promotion pour un article donné
  const getEffectivePrice = (item) => {
    if (!item.isPrestation && item.promotion_percentage > 0) {
      return item.price * (1 - item.promotion_percentage / 100);
    }
    return item.price;
  };

  // Calcul du prix total global (somme des prix remisés * quantités)
  const total = items.reduce((sum, item) => {
    const priceToUse = getEffectivePrice(item);
    return sum + (priceToUse * item.quantity);
  }, 0);

  // --- ACTION DE PAIEMENT ---
  const handlePaiement = async () => {
    if (items.length === 0) return;

    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!storedUserId || !token) {
        alert("Veuillez vous connecter pour finaliser votre commande.");
        navigate('/connexion');
        return;
    }

    // Préparation des données pour le backend
    const commande = {
        numUtilisateur: parseInt(storedUserId),
        total_price: total,
        items: items.map(item => {
            const finalUnitPrice = getEffectivePrice(item); // On envoie le prix remisé
            
            if (item.isPrestation) {
                return {
                    id_prestation: item.id.split('-')[1], 
                    quantity: item.quantity,
                    unit_price: finalUnitPrice,
                    date: item.details.date,
                    slot: item.details.slot,
                    address: item.details.address,
                    isPrestation: true
                };
            } else {
                return {
                    id_vin: item.id,
                    quantity: item.quantity,
                    unit_price: finalUnitPrice, // On enregistre le prix promo en BDD
                    isPrestation: false
                };
            }
        })
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
            navigate('/RecapPanier');
        } else {
            const errorData = await response.json();
            alert("Erreur : " + errorData.message);
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
    }
  };

  return (
  <aside className="panier-tout">
    <div className="panier-header">
      <h1>Mon Panier</h1>
      <Button
        variant="text"
        size="small"
        sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none', '&:hover': { color: '#fff' } }}
        onClick={() => onToutRetirer(null)}
        startIcon={<DeleteSweepIcon />}
      >
        Vider
      </Button>
    </div>

    {items.length === 0 ? (
      <p className="panier-vide">Votre panier est vide.</p>
    ) : (
      <>
        <div className="panier-items">
          {items.map((item) => {
            const effectivePrice = getEffectivePrice(item);
            const hasPromo = !item.isPrestation && item.promotion_percentage > 0;

            return (
              <div key={item.id} className="panier-item">
                <IconButton
                  size="small"
                  onClick={() => onToutRetirer(item.id)}
                  className="btn-supprimer-tout"
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>

                <div className="panier-item-content">
                  <h4>{item.name}</h4>
                  
                  <div className="panier-item-details">
                    <div className="qty-zone">
                      <span>{item.quantity} x </span>
                      
                      {/* Affichage du prix : barré si promo, normal sinon */}
                      {hasPromo ? (
                        <Box component="span" sx={{ display: 'inline-flex', flexDirection: 'column', ml: 0.5 }}>
                          <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
                            {formatPrice(effectivePrice)}
                          </span>
                          <span style={{ textDecoration: 'line-through', fontSize: '0.7rem', color: '#999' }}>
                            {formatPrice(item.price)}
                          </span>
                        </Box>
                      ) : (
                        <span>{formatPrice(item.price)}</span>
                      )}

                      <Button
                        size="small"
                        onClick={() => onRetirer(item.id)}
                        sx={{ 
                          minWidth: 'auto', 
                          ml: 1, 
                          color: '#4a0404', 
                          bgcolor: '#fff',
                          fontSize: '0.7rem',
                          px: 1,
                          '&:hover': { bgcolor: '#eee' }
                        }}
                      >
                        - 1
                      </Button>
                    </div>
                    {/* Total de la ligne basé sur le prix effectif */}
                    <span className="item-total-ligne">
                        {formatPrice(effectivePrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="panier-footer">
          <div className="panier-total-section">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <Button
            variant="contained"
            fullWidth
            className="btn-paiement"
            onClick={handlePaiement}
            sx={{
                bgcolor: '#4a0404',
                '&:hover': { bgcolor: '#7a0606' },
                mt: 2
            }}
          >
            Valider la commande
          </Button>
        </div>
      </>
    )}
  </aside>
  );
};

export default Panier;