import '../styles/Selection_Produits.css';
import { itemList } from '../datas/itemList'; 
import React, { useState } from 'react'; // Import de useState

import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

const Produits = ({ onAjouter }) => {
  // On crée un état local pour stocker les quantités de chaque produit
  // { id_du_produit: quantite }
  const [quantities, setQuantities] = useState({});

  const handleQtyChange = (id, value) => {
    const numValue = parseInt(value) || 0;
    if ( numValue >= 0 && numValue <= 100) {
      setQuantities({
        ...quantities,
        [id]: numValue
      });
    }
  };

  const renderWineCard = (vin) => {
    const qty = quantities[vin.id] || 1; // Quantité par défaut = 1

    return (
      <div key={vin.id} className="vin-card">
        <img src={vin.cover} alt={vin.name} className="vin-image" />
        <h3>{vin.name}</h3>
        <p className="vin-price">{vin.price}€</p>
        
        {/* Conteneur Flex pour aligner Bouton + Quantité */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 1 }}>
          <Button 
            variant="contained" 
            onClick={() => onAjouter(vin, qty)} // On envoie la quantité à la fonction d'ajout
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
            slotProps={{ inputProps: { min: 0, max: 100 } }}
            sx={{ width: '80px' }}
          />
        </Box>
      </div>
    );
  };

  return (
    <section className="produits-tout">
      <h1>Produits</h1>
      <h2>Sélectionnez les produits !</h2>

      <p style={{ textDecoration: 'underline' }}>Découvrez notre sélection de vins Rouges exceptionnels</p>
      <div className="produits-container-horizontal">
        {itemList.filter(v => v.category === 'rouge' || !v.category).map(renderWineCard)}
      </div>

      <p style={{ textDecoration: 'underline' }}>Découvrez notre sélection de vins Blancs exceptionnels</p>
      <div className="produits-container-horizontal">
        {itemList.filter(v => v.category === 'blanc').map(renderWineCard)}
      </div>

      <p style={{ textDecoration: 'underline' }}>Découvrez notre sélection de Champagnes exceptionnels</p>
      <div className="produits-container-horizontal">
        {itemList.filter(v => v.category === 'champagne').map(renderWineCard)}
      </div>
    </section>
  );
};

export default Produits;