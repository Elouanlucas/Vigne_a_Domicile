import React, { useState, useEffect, useContext } from 'react'; 
import '../styles/Selection_Produits.css';
import { Button, TextField, Box, Dialog, DialogContent, DialogTitle, IconButton, Slider, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { CurrencyContext } from '../context/CurrencyContext';

const Produits = ({ onAjouter }) => {
  const { formatPrice } = useContext(CurrencyContext);
  const [quantities, setQuantities] = useState({});
  const [vins, setVins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWine, setSelectedWine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('asc');
  const [selectedCategories, setSelectedCategories] = useState({
    rouge: true, blanc: true, champagne: true, rosé: true
  });
  const [priceRange, setPriceRange] = useState([0, 5000]);

  useEffect(() => {
    fetch('http://localhost:3001/api/vins')
      .then(res => res.json())
      .then(data => { setVins(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleQtyChange = (id, value, maxStock) => {
    const numValue = parseInt(value) || 0;
    setQuantities({ ...quantities, [id]: Math.min(Math.max(0, numValue), maxStock) });
  };

  const getFilteredVins = () => {
    return vins
      .filter(vin => 
        vin.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        selectedCategories[vin.category] &&
        vin.price >= priceRange[0] && vin.price <= priceRange[1]
      )
      .sort((a, b) => sortBy === 'asc' ? a.price - b.price : b.price - a.price);
  };

  const renderWineCard = (vin) => {
    const isOutOfStock = vin.quantity <= 0;
    const qty = quantities[vin.id] || (isOutOfStock ? 0 : 1);

    return (
      <div key={vin.id} className="vin-card" style={{ opacity: isOutOfStock ? 0.7 : 1 }}>
        {isOutOfStock && <div className="out-of-stock-banner">RUPTURE</div>}

        <IconButton 
          onClick={() => { setSelectedWine(vin); setIsModalOpen(true); }}
          className="info-button-overlay"
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)', zIndex: 2 }}
        >
          <InfoIcon sx={{ color: '#4a0404' }} />
        </IconButton>

        <img 
          src={vin.cover ? `http://localhost:3001/uploads/${vin.cover}` : 'https://via.placeholder.com/150'} 
          alt={vin.name} 
          className="vin-image"
          onClick={() => { setSelectedWine(vin); setIsModalOpen(true); }}
        />
        
        <h3>{vin.name}</h3>
        <p className="vin-price">{formatPrice(vin.price)}</p>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 1 }}>
          <Button 
            variant="contained" 
            onClick={() => onAjouter(vin, qty)}
            disabled={isOutOfStock || qty === 0}
            startIcon={<ShoppingCartIcon />}
            sx={{ bgcolor: isOutOfStock ? '#ccc' : '#4a0404', textTransform: 'none' }}
          >
            {isOutOfStock ? 'Épuisé' : 'Ajouter'}
          </Button>
          <TextField
            type="number" size="small" disabled={isOutOfStock}
            value={qty} onChange={(e) => handleQtyChange(vin.id, e.target.value, vin.quantity)}
            sx={{ width: '70px' }}
          />
        </Box>
      </div>
    );
  };

  if (loading) return <p className="loading-text">Chargement...</p>;

  const filteredVins = getFilteredVins();

  return (
    <section className="produits-tout">
      <h1>Nos Vins</h1>

      <div className="search-section">
        <div className="search-container">
          <TextField
            placeholder="Rechercher une cuvée..."
            fullWidth value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="produits-layout">
        {/* Sidebar */}
        <aside className="filter-sidebar">
          <h3>Filtres</h3>
          <div className="filter-group">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Catégorie</Typography>
            {['rouge', 'blanc', 'champagne', 'rosé'].map(cat => (
              <div key={cat} className="filter-item">
                <input
                  type="checkbox" className="filter-checkbox" id={cat}
                  checked={selectedCategories[cat]}
                  onChange={() => setSelectedCategories({...selectedCategories, [cat]: !selectedCategories[cat]})}
                />
                <label htmlFor={cat} style={{cursor:'pointer'}}>{cat}</label>
              </div>
            ))}
          </div>

          <div className="filter-group">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Budget max : {formatPrice(priceRange[1])}</Typography>
            <Slider
              value={priceRange} onChange={(e, val) => setPriceRange(val)}
              min={0} max={5000} step={10} sx={{ color: '#4a0404' }}
            />
          </div>
          
          <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <FormControlLabel value="asc" control={<Radio sx={{color:'#4a0404'}}/>} label="Prix croissant" />
            <FormControlLabel value="desc" control={<Radio sx={{color:'#4a0404'}}/>} label="Prix décroissant" />
          </RadioGroup>
        </aside>

        {/* Grille */}
        <div className="products-grid-container">
          {filteredVins.length > 0 ? (
            ['rouge', 'blanc', 'champagne', 'rosé']
              .filter(cat => selectedCategories[cat] && filteredVins.some(v => v.category === cat))
              .map(cat => (
                <div key={cat}>
                  <h2 className="category-title">{cat}s</h2>
                  <div className="wine-cards-wrapper">
                    {filteredVins.filter(v => v.category === cat).map(renderWineCard)}
                  </div>
                </div>
              ))
          ) : <p>Aucun résultat.</p>}
        </div>
      </div>

      {/* Modale simplifiée */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{selectedWine?.name}</strong>
          <IconButton onClick={() => setIsModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWine && (
            <Box sx={{ textAlign: 'center' }}>
              <img src={`http://localhost:3001/uploads/${selectedWine.cover}`} alt="" style={{maxHeight:'300px', objectFit:'contain'}} />
              <Typography sx={{ mt: 2 }}>{selectedWine.description}</Typography>
              <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: '#4a0404' }} onClick={() => onAjouter(selectedWine, 1)}>
                Ajouter au Panier
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Produits;