import '../styles/index.css';
import '../styles/Panier.css';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'; // Import pour le bouton icône
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; // L'icône de croix
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';


const Panier = ({ items, onRetirer, onToutRetirer }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <aside className="panier-tout"> {/* Remplacement de header par aside, plus sémantique pour une barre latérale */}
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
                textTransform: 'none', // Évite d'avoir tout en majuscule
                '&:hover': {
                  backgroundColor: '#630606', 
                }
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
                  
                  {/* BOUTON CROIX "TOUT RETIRER" (Positionné en absolu via CSS) */}
                  <IconButton
                    aria-label="tout retirer"
                    size="small"
                    onClick={() => onToutRetirer(item.id)}
                    className="panier-item-remove-all" // Classe pour le CSS
                    sx={{ 
                        color: 'rgba(255, 255, 255, 0.6)', // Blanc un peu transparent
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

                  {/* Bouton pour retirer 1 seule unité */}
                  <Button
                    size="small"
                    variant="outlined" // Outlined rend mieux sur fond sombre
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