import '../styles/index.css';
import '../styles/Panier.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'; 
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; 
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CurrencyContext } from '../context/CurrencyContext';

const Panier = ({ items, onRetirer, onToutRetirer }) => {
  const navigate = useNavigate();
  const { formatPrice } = useContext(CurrencyContext);
  
  // Calcul du prix total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Fonction pour envoyer le panier en BDD (Transaction)
  const handlePaiement = async () => {
    if (items.length === 0) return;

    const storedUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token'); // On récupère le token

    if (!storedUserId || !token) {
      alert("Veuillez vous connecter pour finaliser votre commande.");
      navigate('/connexion');
      return;
    }

    const commande = {
      numUtilisateur: parseInt(storedUserId),
      total_price: total,
      items: items.map(item => ({
        id_vin: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }))
    };

    try {
      // MISE À JOUR DE L'URL : /api/orders/panier
      const response = await fetch('http://localhost:3001/api/orders/panier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // AJOUT DU TOKEN
        },
        body: JSON.stringify(commande),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Commande enregistrée avec succès:', data);
        
        // On ne vide pas forcément le panier ici si on veut le voir sur RecapPanier
        // onToutRetirer(null); 
        
        navigate('/RecapPanier');
      } else {
        const errorData = await response.json();
        console.error('Erreur backend:', errorData.message);
        alert("Erreur : " + errorData.message);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert("Impossible de contacter le serveur. Vérifiez votre connexion.");
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
          {items.map((item) => (
            <div key={item.id} className="panier-item">
              {/* Bouton de suppression totale */}
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
                    <span>{item.quantity} x {formatPrice(item.price)}</span>
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
                  <span className="item-total-ligne">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
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