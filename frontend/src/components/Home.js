import React, { useState, useEffect } from 'react'; 
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
import { CurrencyContext } from '../context/CurrencyContext'; // Importe le contexte
import { useContext } from 'react';

const Home = ({ onAjouter }) => {
  const { formatPrice } = useContext(CurrencyContext); // Récupère la fonction
  const [quantities, setQuantities] = useState({});
  const [vins, setVins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupération de l'utilisateur
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Récupération des vins
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
    if (cover.type === 'Buffer' || cover.data) {
      try {
        const dataArray = cover.data || cover;
        const uint8Array = new Uint8Array(dataArray);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      } catch (e) {
        return 'https://via.placeholder.com/150';
      }
    }
    return `http://localhost:3001/uploads/${cover}`;
  };

  const handleQtyChange = (id, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setQuantities({ ...quantities, [id]: numValue });
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

  // --- LA FONCTION RENDERWINECARD EST MAINTENANT PROPRE ---
  const renderWineCard = (vin) => {
    const qty = quantities[vin.id] || 1;

    return (
      <div key={vin.id} className="vin-card" style={{ position: 'relative' }}>
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
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 1 }}>
          <Button 
            variant="contained" 
            onClick={() => onAjouter(vin, qty)}
            startIcon={<ShoppingCartIcon />}
            sx={{ backgroundColor: '#4a0404', textTransform: 'none', minWidth: '120px' }}
          >
            Ajouter
          </Button>

          <TextField
            type="number"
            size="small"
            value={qty}
            onChange={(e) => handleQtyChange(vin.id, e.target.value)}
            inputProps={{ min: 1, max: 100 }}
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

      {/* Modale Détails du Vin */}
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
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={getImageUrl(selectedWine.cover)} 
                  alt={selectedWine.name}
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '350px', objectFit: 'contain' }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                <span><strong>Prix :</strong> {selectedWine.price}€</span>
                <span style={{ textTransform: 'capitalize' }}><strong>Catégorie :</strong> {selectedWine.category}</span>
              </Box>
              {selectedWine.description && (
                <Box sx={{ backgroundColor: '#f9f9f9', p: 2, borderRadius: '8px', borderLeft: '4px solid #4a0404' }}>
                  <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>"{selectedWine.description}"</p>
                </Box>
              )}
              <Button 
                variant="contained" 
                onClick={() => {
                  onAjouter(selectedWine, quantities[selectedWine.id] || 1);
                  closeModal();
                }}
                startIcon={<ShoppingCartIcon />}
                sx={{ backgroundColor: '#4a0404', mt: 2, py: 1.5 }}
                fullWidth
              >
                Ajouter au Panier
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Home;