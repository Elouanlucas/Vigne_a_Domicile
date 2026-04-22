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
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { CurrencyContext } from '../context/CurrencyContext';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

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
    rouge: true,
    blanc: true,
    champagne: true,
    rosé: true
  });
  
  // Plage de prix (Min: 0, Max: 200 par défaut)
  const [priceRange, setPriceRange] = useState([0, 5000]);

  useEffect(() => {
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

  const handleCategoryChange = (category) => {
    setSelectedCategories({
      ...selectedCategories,
      [category]: !selectedCategories[category]
    });
  };

  // LOGIQUE DE FILTRAGE MISE À JOUR
  const getFilteredVins = () => {
    let filtered = vins.filter(vin => {
      const matchesSearch = vin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories[vin.category];
      const matchesPrice = vin.price >= priceRange[0] && vin.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Logique de tri
    return filtered.sort((a, b) => {
      return sortBy === 'asc' ? a.price - b.price : b.price - a.price;
    });
  };

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
            type="number" size="small"
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

  const filteredVins = getFilteredVins();

  return (
    <>
      <section className="produits-tout" style={{ display: 'flex', flexDirection: 'column' }}>
        <h1>Nos Vins</h1>

        <div className="search-section">
          <div className="search-container" style={{ margin: '0 auto', maxWidth: '600px', width: '100%' }}>
            <TextField
              placeholder="Rechercher une cuvée, un domaine..."
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  '&:hover fieldset': { borderColor: '#4a0404' },
                  '&.Mui-focused fieldset': { borderColor: '#4a0404' },
                }
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
          {/* Sidebar des filtres */}
          <div style={{
            minWidth: '220px',
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '8px',
            height: 'fit-content',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#4a0404' }}>Filtres</h3>

            {/* Filtre Catégories */}
            <div style={{ marginBottom: '30px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Catégorie</Typography>
              {['rouge', 'blanc', 'champagne', 'rosé'].map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    id={`filter-${cat}`}
                    checked={selectedCategories[cat]}
                    onChange={() => handleCategoryChange(cat)}
                    style={{ marginRight: '8px', cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <label htmlFor={`filter-${cat}`} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>
                    {cat === 'rosé' ? 'Rosés' : cat + 's'}
                  </label>
                </div>
              ))}
            </div>

            {/* Filtre par Prix */}
            <div style={{ padding: '0 10px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Budget : {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                // On utilise formatPrice dans la petite bulle qui apparaît au survol
                valueLabelFormat={(value) => formatPrice(value)}
                min={0}
                max={5000} // Ajuste le max selon tes besoins
                step={10}
                sx={{
                  color: '#4a0404',
                  '& .MuiSlider-thumb': { backgroundColor: '#4a0404' },
                  '& .MuiSlider-track': { backgroundColor: '#4a0404' },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.75rem' }}>
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(2000)}</span>
              </Box>
            </div>
            
            {/* TRI CROISSANT / DECROISSANT */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Trier par prix</Typography>
              <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <FormControlLabel 
                  value="asc" 
                  control={<Radio sx={{ color: '#4a0404', '&.Mui-checked': { color: '#4a0404' } }} />} 
                  label="Croissant" 
                />
                <FormControlLabel 
                  value="desc" 
                  control={<Radio sx={{ color: '#4a0404', '&.Mui-checked': { color: '#4a0404' } }} />} 
                  label="Décroissant" 
                />
              </RadioGroup>
            </Box>

          </div>

          {/* Liste des Produits */}
          <div style={{ flex: 1 }}>
            {filteredVins.length > 0 ? (
              ['rouge', 'blanc', 'champagne', 'rosé']
                .filter(cat => selectedCategories[cat] && filteredVins.some(v => v.category === cat))
                .map(cat => (
                  <div key={cat} style={{ marginBottom: '40px' }}>
                    <h2 style={{ 
                      textTransform: 'capitalize', borderBottom: '2px solid #4a0404', 
                      display: 'inline-block', paddingBottom: '5px' 
                    }}>
                      {cat === 'rosé' ? 'Rosés' : cat + 's'}
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' }}>
                      {filteredVins.filter(v => v.category === cat).map(renderWineCard)}
                    </div>
                  </div>
                ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                Aucun vin ne correspond à vos critères.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Modale */}
      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>{selectedWine?.name}</strong>
          <IconButton onClick={closeModal} sx={{ color: '#4a0404' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWine && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={getImageUrl(selectedWine.cover)} alt={selectedWine.name}
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </Box>
              <Typography><strong>Prix :</strong> {formatPrice(selectedWine.price)}</Typography>
              <Typography><strong>Catégorie :</strong> {selectedWine.category}</Typography>
              {selectedWine.description && (
                <Box sx={{ bgcolor: '#f9f9f9', p: 2, borderRadius: 2, borderLeft: '4px solid #4a0404' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{selectedWine.description}"</Typography>
                </Box>
              )}
              <Button 
                variant="contained" 
                onClick={() => { onAjouter(selectedWine, quantities[selectedWine.id] || 1); closeModal(); }}
                fullWidth sx={{ bgcolor: '#4a0404', py: 1.5 }}
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

export default Produits;