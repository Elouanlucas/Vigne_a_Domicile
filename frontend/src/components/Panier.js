import '../styles/index.css';
import '../styles/Panier.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'; 
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; 
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useNavigate } from 'react-router-dom';

const Panier = ({ items, onRetirer, onToutRetirer }) => {
  const navigate = useNavigate();
  
  // Calcul du prix total
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Fonction pour envoyer le panier en BDD
  const handlePaiement = async () => {
    if (items.length === 0) return;

    const storedUserId = localStorage.getItem('userId');

    if (!storedUserId) {
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
      const response = await fetch('http://localhost:3001/api/commandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commande),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Succès:', data);
        
        // --- CETTE LIGNE CI-DESSOUS EST SUPPRIMÉE POUR GARDER LE PANIER ---
        // onToutRetirer(null); 
        
        // On navigue simplement vers la page récapitulative
        navigate('/RecapPanier');
      } else {
        console.error('Erreur lors de l\'enregistrement');
        alert("Une erreur est survenue lors de la validation du panier.");
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert("Impossible de contacter le serveur.");
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
                    <p className="panier-item-price">{item.price}€ x {item.quantity}</p>
                    <p className="panier-item-total">{(item.price * item.quantity).toFixed(2)}€</p>
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
              <h3>Total: {total.toFixed(2)}€</h3>
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
              onClick={handlePaiement} // Changement ici : on appelle handlePaiement
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