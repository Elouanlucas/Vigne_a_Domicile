import React, { useState, useEffect, useContext } from 'react'; 
import '../styles/Selection_Produits.css';
import { 
    Button, TextField, Box, Dialog, DialogContent, 
    DialogTitle, IconButton, Slider, Typography, 
    Radio, RadioGroup, FormControlLabel, Switch
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star'; // Icône pour le favori
import { CurrencyContext } from '../context/CurrencyContext';

const Produits = ({ onAjouter }) => {
  const { formatPrice } = useContext(CurrencyContext);
  
  // --- ÉTATS ---
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
  const [priceRange, setPriceRange] = useState([0, 3000]);
  
  // NOUVEAUX ÉTATS DE FILTRE
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyPromos, setOnlyPromos] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    fetch('http://localhost:3001/api/vins')
      .then(res => res.json())
      .then(data => { 
          setVins(data); 
          setLoading(false); 
      })
      .catch((err) => {
          console.error("Erreur chargement vins:", err);
          setLoading(false);
      });
  }, []);

  // Ajoute cette fonction qui manque :
  const handleQtyChange = (id, value, maxStock) => {
    const numValue = parseInt(value) || 0;
    setQuantities({ 
      ...quantities, 
      [id]: Math.min(Math.max(0, numValue), maxStock) 
    });
  };

  // --- ACTIONS ---
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategories({ rouge: true, blanc: true, champagne: true, rosé: true });
    setPriceRange([0, 3000]);
    setSortBy('asc');
    setOnlyFavorites(false);
    setOnlyPromos(false);
  };

  const getFilteredVins = () => {
    return vins
      .filter(vin => {
        const matchesSearch = vin.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategories[vin.category];
        const matchesPrice = vin.price >= priceRange[0] && vin.price <= priceRange[1];
        
        // Logique additionnelle pour Favoris et Promos
        const matchesFavorite = onlyFavorites ? vin.recommandations === 1 : true;        
        const matchesPromo = onlyPromos ? (vin.promotion_percentage > 0) : true;

        return matchesSearch && matchesCategory && matchesPrice && matchesFavorite && matchesPromo;
      })
      .sort((a, b) => sortBy === 'asc' ? a.price - b.price : b.price - a.price);
  };

  // --- RENDU D'UNE CARTE VIN ---
  const renderWineCard = (vin) => {
    const isOutOfStock = vin.quantity <= 0;
    const hasPromo = vin.promotion_percentage && vin.promotion_percentage > 0;
    const isFavorite = vin.is_favorite === 1;
    const discountedPrice = hasPromo ? vin.price * (1 - vin.promotion_percentage / 100) : vin.price;
    const qty = quantities[vin.id] || (isOutOfStock ? 0 : 1);

    return (
      <div key={vin.id} className="vin-card" style={{ opacity: isOutOfStock ? 0.8 : 1 }}>
        {/* Bandeau de Rupture */}
        {isOutOfStock && <div className="out-of-stock-banner">RUPTURE</div>}
        
        {/* NOUVEAU : Bandeau de Promotion (style similaire à rupture) */}
        {hasPromo && !isOutOfStock && (
          <div className="promo-banner" style={{
            position: 'absolute',
            top: '10px',
            left: '-5px',
            backgroundColor: '#4a0404',
            color: 'white',
            padding: '5px 15px',
            fontWeight: 'bold',
            zIndex: 1,
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
            fontSize: '0.85rem'
          }}>
            -{vin.promotion_percentage}%
          </div>
        )}

        <IconButton 
          onClick={() => { setSelectedWine(vin); setIsModalOpen(true); }}
          sx={{ 
              position: 'absolute', top: 8, right: 8, 
              bgcolor: 'rgba(255,255,255,0.8)', zIndex: 2, 
              '&:hover': { bgcolor: 'white' } 
          }}
        >
          <InfoIcon sx={{ color: '#4a0404' }} />
        </IconButton>

        <img 
          src={vin.cover ? `http://localhost:3001/uploads/${vin.cover}` : '/placeholder-vin.png'} 
          alt={vin.name} 
          className="vin-image"
          onClick={() => { setSelectedWine(vin); setIsModalOpen(true); }}
        />
        
        <div className="vin-card-content">
            <h3>{vin.name}</h3>
            
            {/* Zone de Prix mise à jour */}
            <Box sx={{ mb: 1 }}>
              {hasPromo ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: '#4a0404', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {formatPrice(discountedPrice)}
                  </Typography>
                  <Typography sx={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9rem' }}>
                    {formatPrice(vin.price)}
                  </Typography>
                </Box>
              ) : (
                <p className="vin-price">{formatPrice(vin.price)}</p>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 'auto' }}>
                <TextField
                    type="number" size="small" disabled={isOutOfStock}
                    value={qty} 
                    onChange={(e) => handleQtyChange(vin.id, e.target.value, vin.quantity)}
                    sx={{ width: '65px', '& .MuiInputBase-input': { padding: '7px' } }}
                />
                <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => onAjouter(vin, qty)}
                    disabled={isOutOfStock || qty === 0}
                    startIcon={<ShoppingCartIcon />}
                    sx={{ 
                        bgcolor: isOutOfStock ? '#ccc' : '#4a0404', 
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#7a0606' }
                    }}
                >
                    {isOutOfStock ? 'Épuisé' : 'Ajouter'}
                </Button>
            </Box>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-container"><p>Chargement de la cave...</p></div>;

  const filteredVins = getFilteredVins();

  return (
    <section className="produits-tout">
      <h1>Nos Vins & Spiritueux</h1>

      {/* Barre de recherche */}
      <div className="search-section">
        <div className="search-container">
          <TextField
            placeholder="Rechercher une cuvée, un domaine..."
            fullWidth               
            value={searchTerm}
            variant="outlined"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="produits-layout">
        {/* SIDEBAR DE FILTRES */}
        <aside className="filter-sidebar">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
              Filtres
            </Typography>
            <Button 
              size="small" 
              onClick={resetFilters}
              sx={{ 
                color: '#4a0404', 
                fontSize: '0.7rem', 
                textDecoration: 'underline',
                minWidth: 'auto',
                p: 0,
                '&:hover': { backgroundColor: 'transparent', textDecoration: 'none', color: '#7a0606' }
              }}
            >
              Réinitialiser
            </Button>
          </Box>

          <div className="filter-group">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Sélection</Typography>
            <FormControlLabel
                control={<Switch checked={onlyFavorites} onChange={(e) => setOnlyFavorites(e.target.checked)} color="warning" />}
                label={<Typography variant="body2">⭐ Favoris de l'oenologue</Typography>}
            />
            <FormControlLabel
                control={<Switch checked={onlyPromos} onChange={(e) => setOnlyPromos(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4a0404' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4a0404' } }} />}
                label={<Typography variant="body2">🏷️ En promotion</Typography>}
            />
          </div>
          
          {/* Catégories */}
          <div className="filter-group">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>Catégories</Typography>
            {['rouge', 'blanc', 'champagne', 'rosé'].map(cat => (
              <div key={cat} className="filter-item">
                <input
                  type="checkbox" className="filter-checkbox" id={cat}
                  checked={selectedCategories[cat]}
                  onChange={() => setSelectedCategories({...selectedCategories, [cat]: !selectedCategories[cat]})}
                />
                <label htmlFor={cat} style={{cursor:'pointer', textTransform: 'capitalize'}}>{cat}</label>
              </div>
            ))}
          </div>

          {/* Budget */}
          <div className="filter-group">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Budget max</Typography>
            <Typography variant="body2" sx={{ color: '#4a0404', fontWeight: 'bold', mb: 1 }}>
                {formatPrice(priceRange[1])}
            </Typography>
            <Slider
              value={priceRange} 
              onChange={(e, val) => setPriceRange(val)}
              min={0} max={3000} step={10} 
              sx={{ color: '#4a0404', width: '90%', ml: 1 }}
            />
          </div>
          
          {/* Tri */}
          <div className="filter-group" style={{ borderBottom: 'none' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Tri</Typography>
            <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <FormControlLabel value="asc" control={<Radio sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>} label="Prix croissant" />
                <FormControlLabel value="desc" control={<Radio sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>} label="Prix décroissant" />
            </RadioGroup>
          </div>
        </aside>

        {/* GRILLE DE PRODUITS */}
        <div className="products-grid-container">
          {filteredVins.length > 0 ? (
            ['rouge', 'blanc', 'champagne', 'rosé']
              .filter(cat => selectedCategories[cat] && filteredVins.some(v => v.category === cat))
              .map(cat => (
                <div key={cat} className="category-section">
                  <h2 className="category-title">{cat}s</h2>
                  <div className="wine-cards-wrapper">
                    {filteredVins.filter(v => v.category === cat).map(renderWineCard)}
                  </div>
                </div>
              ))
          ) : (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography variant="h6" color="textSecondary">Aucun vin ne correspond à vos critères.</Typography>
            </Box>
          )}
        </div>
      </div>

      {/* MODAL DE DÉTAILS */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
            display: 'flex', justifyContent: 'space-between', 
            alignItems: 'center', bgcolor: '#4a0404', color: 'white' 
        }}>
          <strong>{selectedWine?.name}</strong>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWine && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <img 
                src={`http://localhost:3001/uploads/${selectedWine.cover}`} 
                alt={selectedWine.name} 
                style={{ maxHeight:'350px', objectFit:'contain', borderRadius: '8px' }} 
              />
              <Typography variant="h5" sx={{ color: '#4a0404', fontWeight: 'bold', mt: 3 }}>
                  {formatPrice(selectedWine.price)}
              </Typography>
              <Typography sx={{ mt: 2, color: '#555', lineHeight: 1.6 }}>
                  {selectedWine.description}
              </Typography>
              <Button 
                variant="contained" 
                fullWidth 
                sx={{ mt: 4, bgcolor: '#4a0404', py: 1.5 }} 
                onClick={() => { onAjouter(selectedWine, 1); setIsModalOpen(false); }}
                disabled={selectedWine.quantity <= 0}
              >
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