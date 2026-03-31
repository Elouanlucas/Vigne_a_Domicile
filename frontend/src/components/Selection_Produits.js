import React, { useState, useEffect } from 'react'; 
import '../styles/Selection_Produits.css';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

const Produits = ({ onAjouter }) => {
  const [quantities, setQuantities] = useState({});
  const [vins, setVins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/')
      .then(res => res.json())
      .then(data => {
        console.log("CONTENU DE DATA :", data);
        setVins(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API :", err);
        setLoading(false);
      });
  }, []);

  // Fonction pour convertir le Buffer MySQL en image Base64
  const formatImage = (blobData) => {
    if (!blobData || !blobData.data) return null;
    
    // Conversion sécurisée du buffer
    const base64 = btoa(
      new Uint8Array(blobData.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    return `data:image/jpeg;base64,${base64}`; // Utilise image/jpeg ou image/png selon tes fichiers
  };

  const handleQtyChange = (id, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setQuantities({ ...quantities, [id]: numValue });
    }
  };

  const renderWineCard = (vin) => {
    const qty = quantities[vin.id] || 1;

    return (
      <div key={vin.id} className="vin-card">
        {/* Affichage de l'image via la conversion BLOB */}
        <img 
            src={formatImage(vin.cover)} 
            alt={vin.name} 
            className="vin-image" 
            onError={(e) => e.target.src = 'path/to/fallback-image.png'} // Image par défaut si erreur
        />
        <h3>{vin.name}</h3>
        <p className="vin-price">{vin.price}€</p>
        
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
            inputProps={{ min: 0, max: 100 }}
            sx={{ width: '80px' }}
          />
        </Box>
      </div>
    );
  };

  if (loading) return <p>Chargement des produits...</p>;

  return (
    <section className="produits-tout">
      <h1>Produits</h1>
      {/* Sections filtrées par catégorie */}
      <p>Rouges</p>
      <div className="produits-container-horizontal">
        {vins.filter(v => v.category === 'rouge').map(renderWineCard)}
      </div>

      <p>Blancs</p>
      <div className="produits-container-horizontal">
        {vins.filter(v => v.category === 'blanc').map(renderWineCard)}
      </div>

      <p>Champagnes</p>
      <div className="produits-container-horizontal">
        {vins.filter(v => v.category === 'champagne').map(renderWineCard)}
      </div>
    </section>
  );
};

export default Produits;