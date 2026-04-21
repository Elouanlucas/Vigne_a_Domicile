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
      // MISE À JOUR DE L'URL : /api/orders
      const response = await fetch('http://localhost:3001/api/orders', {
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
      <div className="panier">
        <div className="panier-header">
          <div className="panier-title">
            <h1>Panier</h1>
          </div>
          
          <div className="panier-actions">
            <Button
              variant="contained"
              size="small"
              sx={{ 
                backgroundColor: '#4a0404', 
                color: '#fff',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#630606' }
              }}
              onClick={() => onToutRetirer(null)}
              startIcon={<DeleteSweepIcon />}
            >
              Vider
            </Button>
          </div>
        </div>       

        {items.length === 0 ? (
          <p className="panier-vide">Votre panier est vide.</p>
        ) : (
          <>
            <div className="panier-items">
              {items.map((item) => (
                <div key={item.id} className="panier-item">
                  
                  <IconButton
                    aria-label="tout retirer"
                    size="small"
                    onClick={() => onToutRetirer(item.id)}
                    className="panier-item-remove-all"
                    sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)',
                        '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } 
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>

                  <div className="panier-item-info">
                    <h4>{item.name}</h4>
                    <p className="panier-item-price">{formatPrice(item.price)} x {item.quantity}</p>
                    <p className="panier-item-total">{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onRetirer(item.id)}
                    startIcon={<DeleteIcon />}
                    sx={{ 
                        color: '#fff', 
                        borderColor: 'rgba(255,255,255,0.5)',
                        textTransform: 'none',
                        marginTop: '10px',
                        '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)'}
                    }}
                  >
                    Retirer 1
                  </Button>
                </div>
              ))}
            </div>

            <div className="panier-total">
              <h3>Total: {formatPrice(total)}</h3>
            </div>

            <Button
              variant="contained"
              fullWidth
              sx={{ 
                backgroundColor: '#fff', 
                color: '#4a0404', 
                fontWeight: 'bold', 
                marginTop: '15px',
                '&:hover': { backgroundColor: '#eee' }
              }}
              onClick={handlePaiement}
            >
              Payer maintenant
            </Button>
          </>
        )}
      </div>
    </aside>
  );
};

export default Panier;