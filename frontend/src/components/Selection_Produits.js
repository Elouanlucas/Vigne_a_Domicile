import React, { useState, useEffect, useContext } from 'react'; 
import '../styles/Selection_Produits.css';
import { 
    Button, TextField, Box, Dialog, DialogContent, 
    DialogTitle, IconButton, Slider, Typography, 
    Radio, RadioGroup, FormControlLabel, Switch, Divider, Rating, CircularProgress
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { CurrencyContext } from '../context/CurrencyContext';

const API_URL = 'http://localhost:3001';

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
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyPromos, setOnlyPromos] = useState(false);

  const [avisList, setAvisList] = useState([]);
  const [loadingAvis, setLoadingAvis] = useState(false);
  const [newNote, setNewNote] = useState(5);
  const [newCommentaire, setNewCommentaire] = useState('');
  const [avisError, setAvisError] = useState('');

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetch(`${API_URL}/api/vins`)
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

  useEffect(() => {
    if (selectedWine) {
      setLoadingAvis(true);
      fetch(`${API_URL}/api/avis/vin/${selectedWine.id}`)
        .then(res => res.json())
        .then(data => {
          setAvisList(data);
          setLoadingAvis(false);
        })
        .catch(err => {
          console.error("Erreur chargement avis:", err);
          setLoadingAvis(false);
        });
    }
  }, [selectedWine]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWine(null);
    setAvisList([]);
    setAvisError('');
    setNewCommentaire('');
    setNewNote(5);
  };

  const handleQtyChange = (id, value, maxStock) => {
    const numValue = parseInt(value) || 0;
    setQuantities({ 
      ...quantities, 
      [id]: Math.min(Math.max(0, numValue), maxStock) 
    });
  };

  // --- SOUMISSION D'UN AVIS MODIFIÉE ---
  const handleAvisSubmit = (e) => {
    e.preventDefault();
    setAvisError('');

    if (!currentUserId) {
        setAvisError("Vous devez être connecté pour laisser un avis.");
        return;
    }

    const avisData = {
        numUtilisateur: currentUserId, 
        vin_id: selectedWine.id,
        note: newNote,
        commentaire: newCommentaire.trim()
    };

    fetch(`${API_URL}/api/avis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avisData)
    })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
        return data;
    })
    .then((data) => {
        // Alerte l'utilisateur du succès de la soumission et de l'attente admin
        alert(data.message || "Avis soumis avec succès ! Il sera visible après validation.");
        
        // Vider le formulaire
        setNewCommentaire('');
        setNewNote(5);

        // Recharger la liste (qui ne contiendra toujours que les avis validés)
        return fetch(`${API_URL}/api/avis/vin/${selectedWine.id}`);
    })
    .then(res => res.json())
    .then(updatedAvis => {
        setAvisList(updatedAvis);
    })
    .catch(err => {
        setAvisError(err.message);
    });
  };

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
        const matchesFavorite = onlyFavorites ? vin.recommandations === 1 : true;        
        const matchesPromo = onlyPromos ? (vin.promotion_percentage > 0) : true;

        return matchesSearch && matchesCategory && matchesPrice && matchesFavorite && matchesPromo;
      })
      .sort((a, b) => sortBy === 'asc' ? a.price - b.price : b.price - a.price);
  };

  const renderWineCard = (vin) => {
    const isOutOfStock = vin.quantity <= 0;
    const hasPromo = vin.promotion_percentage && vin.promotion_percentage > 0;
    const discountedPrice = hasPromo ? vin.price * (1 - vin.promotion_percentage / 100) : vin.price;
    const qty = quantities[vin.id] || (isOutOfStock ? 0 : 1);

    return (
      <div key={vin.id} className="vin-card" style={{ opacity: isOutOfStock ? 0.8 : 1 }}>
        {isOutOfStock && <div className="out-of-stock-banner">RUPTURE</div>}
        
        {hasPromo && !isOutOfStock && (
          <div className="promo-banner" style={{
            position: 'absolute', top: '10px', left: '-5px',
            backgroundColor: '#4a0404', color: 'white', padding: '5px 15px',
            fontWeight: 'bold', zIndex: 1, boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', fontSize: '0.85rem'
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
          src={vin.cover ? `${API_URL}/uploads/${vin.cover}` : '/placeholder-vin.png'} 
          alt={vin.name} 
          className="vin-image"
          onClick={() => { setSelectedWine(vin); setIsModalOpen(true); }}
        />
        
        <div className="vin-card-content">
            <h3>{vin.name}</h3>
            
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
        <aside className="filter-sidebar">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
              Filtres
            </Typography>
            <Button size="small" onClick={resetFilters} sx={{ color: '#4a0404', fontSize: '0.7rem', textDecoration: 'underline', minWidth: 'auto', p: 0, '&:hover': { backgroundColor: 'transparent', textDecoration: 'none', color: '#7a0606' } }}>
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

          <div className="filter-group">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Budget max</Typography>
            <Typography variant="body2" sx={{ color: '#4a0404', fontWeight: 'bold', mb: 1 }}>
                {formatPrice(priceRange[1])}
            </Typography>
            <Slider value={priceRange} onChange={(e, val) => setPriceRange(val)} min={0} max={3000} step={10} sx={{ color: '#4a0404', width: '90%', ml: 1 }} />
          </div>
          
          <div className="filter-group" style={{ borderBottom: 'none' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Tri</Typography>
            <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <FormControlLabel value="asc" control={<Radio sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>} label="Prix croissant" />
                <FormControlLabel value="desc" control={<Radio sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>} label="Prix décroissant" />
            </RadioGroup>
          </div>
        </aside>

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

      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#4a0404', color: 'white' }}>
          <strong>{selectedWine?.name}</strong>
          <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}>
              <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWine && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={selectedWine.cover ? `${API_URL}/uploads/${selectedWine.cover}` : '/placeholder-vin.png'} 
                  alt={selectedWine.name} 
                  style={{ maxHeight:'280px', objectFit:'contain', borderRadius: '8px' }} 
                />
                <Typography variant="h5" sx={{ color: '#4a0404', fontWeight: 'bold', mt: 2 }}>
                    {formatPrice(selectedWine.price)}
                </Typography>
                <Typography sx={{ mt: 1, color: '#555', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{selectedWine.description}"
                </Typography>
                <Button 
                  variant="contained" fullWidth sx={{ mt: 2, mb: 4, bgcolor: '#4a0404', py: 1 }} 
                  onClick={() => { onAjouter(selectedWine, 1); handleCloseModal(); }}
                  disabled={selectedWine.quantity <= 0}
                >
                  Ajouter au Panier
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}><Typography variant="button" color="textSecondary">Avis Clients</Typography></Divider>

              <Box sx={{ mb: 4 }}>
                {loadingAvis ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress sx={{ color: '#4a0404' }} size={30} />
                  </Box>
                ) : avisList.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 2 }}>
                    Aucun avis pour le moment. Soyez le premier à partager votre expérience !
                  </Typography>
                ) : (
                  avisList.map((av) => (
                    <Box key={av.id} sx={{ bgcolor: '#fdfbfb', p: 1.5, borderRadius: 2, mb: 2, borderLeft: '4px solid #4a0404', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {av.prenom} {av.nom ? `${av.nom.substring(0, 1)}.` : ''}
                        </Typography>
                        <Rating value={av.note} readOnly size="small" />
                      </Box>
                      <Typography variant="body2" color="textPrimary" sx={{ fontStyle: 'italic', color: '#333' }}>
                        "{av.commentaire}"
                      </Typography>

                      {av.reponse_admin && (
                        <Box sx={{ 
                          mt: 1.5, 
                          pl: 2, 
                          borderLeft: '3px solid #ff9800', 
                          bgcolor: '#fffbf5', 
                          p: 1, 
                          borderRadius: '0 4px 4px 0' 
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#e65100', display: 'block' }}>
                            Réponse du domaine :
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>
                            "{av.reponse_admin}"
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box component="form" onSubmit={handleAvisSubmit} sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4a0404', mb: 1 }}>
                  Donner votre avis
                </Typography>
                
                {avisError && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                    ⚠️ {avisError}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body2">Votre note :</Typography>
                  <Rating 
                    name="simple-controlled" 
                    value={newNote} 
                    onChange={(event, newValue) => setNewNote(newValue || 5)} 
                  />
                </Box>

                <TextField
                  label="Votre commentaire..."
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  value={newCommentaire}
                  onChange={(e) => setNewCommentaire(e.target.value)}
                  placeholder="Qu'avez-vous pensé de la robe, du nez ou de la bouche de ce vin ?"
                  sx={{ mb: 2 }}
                />

                <Button 
                  type="submit" 
                  variant="outlined" 
                  fullWidth
                  disabled={!newCommentaire.trim()}
                  sx={{ color: '#4a0404', borderColor: '#4a0404', '&:hover': { bgcolor: '#fbebeb', borderColor: '#4a0404' }, textTransform: 'none' }}
                >
                  Soumettre l'avis
                </Button>
              </Box>

            </Box>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Produits;