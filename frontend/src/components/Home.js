import React, { useState, useEffect, useContext } from 'react'; 
import '../styles/Selection_Produits.css';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import Typography from '@mui/material/Typography';
import { CurrencyContext } from '../context/CurrencyContext';

const Home = ({ onAjouter }) => {
  const { formatPrice } = useContext(CurrencyContext);
  const [quantities, setQuantities] = useState({});
  const [vins, setVins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetch('http://localhost:3001/api/vins')
      .then(res => {
        if (!res.ok) throw new Error("Erreur de récupération des produits");
        return res.json();
      })
      .then(data => {
        setVins(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API :", err);
        setLoading(false);
      });
  }, []);

  const getImageUrl = (cover) => {
    if (!cover) return 'https://via.placeholder.com/150';
    return `http://localhost:3001/uploads/${cover}`;
  };

  const handleQtyChange = (id, value, maxStock) => {
    const numValue = parseInt(value) || 0;
    // On limite la saisie au stock disponible
    if (numValue >= 0 && numValue <= maxStock) {
      setQuantities({ ...quantities, [id]: numValue });
    } else if (numValue > maxStock) {
      setQuantities({ ...quantities, [id]: maxStock });
    }
  };

  const openModal = (vin) => {
    setSelectedWine(vin);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWine(null);
  };

  const renderWineCard = (vin) => {
    const isOutOfStock = vin.quantity <= 0;
    const qty = quantities[vin.id] || (isOutOfStock ? 0 : 1);

    return (
      <div key={vin.id} className="vin-card" style={{ 
        position: 'relative', 
        opacity: isOutOfStock ? 0.7 : 1, // Légère transparence si rupture
        filter: isOutOfStock ? 'grayscale(0.5)' : 'none' // Un peu plus gris
      }}>
        
        {/* BANDEAU RUPTURE DE STOCK */}
        {isOutOfStock && (
          <Box sx={{
            position: 'absolute',
            top: 20,
            left: -10,
            backgroundColor: '#d32f2f',
            color: 'white',
            padding: '5px 15px',
            transform: 'rotate(-15deg)',
            zIndex: 3,
            fontWeight: 'bold',
            boxShadow: 3,
            borderRadius: '4px'
          }}>
            RUPTURE
          </Box>
        )}

        <IconButton 
          onClick={() => openModal(vin)}
          sx={{ 
            position: 'absolute', top: 8, right: 8, 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { backgroundColor: '#f5f5f5' },
            zIndex: 2, boxShadow: 1
          }}
          size="small"
        >
          <InfoIcon sx={{ color: '#4a0404', fontSize: '1.1rem' }} />
        </IconButton>

        <img 
          src={getImageUrl(vin.cover)} 
          alt={vin.name} 
          className="vin-image" 
          onClick={() => openModal(vin)}
          style={{ width: '100%', height: '200px', objectFit: 'contain', cursor: 'pointer' }}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
        />
        
        <h3 style={{ cursor: 'pointer' }} onClick={() => openModal(vin)}>{vin.name}</h3>
        <p className="vin-price">{formatPrice(vin.price)}</p>
        
        {/* INDICATEUR DE STOCK SI BAS */}
        {!isOutOfStock && vin.quantity <= 5 && (
          <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 'bold', display: 'block', mb: 1 }}>
            Plus que {vin.quantity} en stock !
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 1 }}>
          <Button 
            variant="contained" 
            onClick={() => onAjouter(vin, qty)}
            disabled={isOutOfStock || qty === 0} // Désactivé si rupture
            startIcon={<ShoppingCartIcon />}
            sx={{ 
              backgroundColor: isOutOfStock ? '#ccc' : '#4a0404', 
              textTransform: 'none', 
              minWidth: '120px',
              '&:hover': { backgroundColor: '#630606' }
            }}
          >
            {isOutOfStock ? 'Épuisé' : 'Ajouter'}
          </Button>

          <TextField
            type="number"
            size="small"
            disabled={isOutOfStock}
            value={qty}
            onChange={(e) => handleQtyChange(vin.id, e.target.value, vin.quantity)}
            inputProps={{ min: isOutOfStock ? 0 : 1, max: vin.quantity }}
            sx={{ width: '80px' }}
          />
        </Box>
      </div>
    );
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Chargement des produits...</p>;

  return (
    <>
      <main style={{ padding: '40px 20px', textAlign: 'center' }}>
        {user ? (
          <h2 style={{ fontSize: '2rem', color: '#4a0404' }}>Ravi de vous revoir, {user.prenom} !</h2>
        ) : (
          <h2 style={{ fontSize: '2rem', color: '#4a0404' }}>Bienvenue dans la cave de Vigne à Domicile</h2>
        )}
        <p style={{ fontSize: '1.2rem', color: '#555', fontStyle: 'italic', marginTop: '1px' }}>
          "Une sélection rigoureuse des plus beaux domaines, livrée directement à votre porte."
        </p>
      </main>

      <section className="produits-tout" style={{ padding: '20px' }}>
        <h1>Nos Vins</h1>
        
        {['rouge', 'blanc', 'champagne', 'rosé'].map(cat => (
          <div key={cat} style={{ marginBottom: '40px' }}>
            <h2 style={{ textTransform: 'capitalize', borderBottom: '2px solid #4a0404', display: 'inline-block', paddingBottom: '5px' }}>
                {cat === 'rosé' ? 'Rosés' : cat + 's'}
            </h2>
            <div className="produits-container-horizontal" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' }}>
              {vins.filter(v => v.category === cat).map(renderWineCard)}
            </div>
          </div>
        ))}
      </section>

      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{selectedWine?.name}</strong>
          <IconButton onClick={closeModal} sx={{ color: '#4a0404' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedWine && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                {selectedWine.quantity <= 0 && (
                   <Typography sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-10deg)', backgroundColor: 'rgba(211, 47, 47, 0.9)', color: 'white', px: 4, py: 1, zIndex: 1, fontWeight: 'bold', fontSize: '1.5rem', borderRadius: '4px' }}>
                     HORS STOCK
                   </Typography>
                )}
                <img 
                  src={getImageUrl(selectedWine.cover)} 
                  alt={selectedWine.name}
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '350px', objectFit: 'contain', opacity: selectedWine.quantity <= 0 ? 0.4 : 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                <span><strong>Prix :</strong> {selectedWine.price}€</span>
                <span><strong>Stock disponible :</strong> {selectedWine.quantity}</span>
              </Box>
              {selectedWine.description && (
                <Box sx={{ backgroundColor: '#f9f9f9', p: 2, borderRadius: '8px', borderLeft: '4px solid #4a0404' }}>
                  <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>"{selectedWine.description}"</p>
                </Box>
              )}
              <Button 
                variant="contained" 
                disabled={selectedWine.quantity <= 0}
                onClick={() => {
                  onAjouter(selectedWine, quantities[selectedWine.id] || 1);
                  closeModal();
                }}
                startIcon={<ShoppingCartIcon />}
                sx={{ backgroundColor: '#4a0404', mt: 2, py: 1.5 }}
                fullWidth
              >
                {selectedWine.quantity <= 0 ? 'Indisponible' : 'Ajouter au Panier'}
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Home;