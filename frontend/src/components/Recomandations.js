import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Card, CardMedia, CardContent, 
  CardActions, Button, CircularProgress, Alert, Badge,
  Dialog, DialogContent, DialogTitle, IconButton, TextField, Divider, Rating
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { CurrencyContext } from '../context/CurrencyContext';
import '../styles/Recomandations.css'; 

const API_URL = 'http://localhost:3001';

const Recommandations = ({ onAjouter }) => {
  const { formatPrice } = useContext(CurrencyContext);

  const [vinsRecommandes, setVinsRecommandes] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la modale de détails et les avis
  const [selectedWine, setSelectedWine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avisList, setAvisList] = useState([]);
  const [loadingAvis, setLoadingAvis] = useState(false);
  const [newNote, setNewNote] = useState(5);
  const [newCommentaire, setNewCommentaire] = useState('');
  const [avisError, setAvisError] = useState('');

  const currentUserId = localStorage.getItem('userId');

  // Chargement des recommandations
  useEffect(() => {
    setLoading(true);
    setError('');

    fetch(`${API_URL}/api/vins/recommandations`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Impossible de récupérer les recommandations de l'œnologue.");
        }
        return res.json();
      })
      .then((data) => {
        setVinsRecommandes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur Fetch Recommandations:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Chargement des avis quand un vin est sélectionné dans la modale
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

  const handleVoirFiche = (vin) => {
    setSelectedWine(vin);
    setIsModalOpen(true);
  };

  // Soumission d'un avis (calqué sur Produits)
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
        alert(data.message || "Avis soumis avec succès ! Il sera visible après validation.");
        setNewCommentaire('');
        setNewNote(5);
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

  return (
    <Box component="main" className="recommandations-container">
      {/* Hero Section */}
      <Box className="hero-content">
        <Typography variant="h1" className="recommandations-title">
          Nos recommandations
        </Typography>
        <Typography variant="body1" className="hero-subtitle">
          Les sélections exclusives de notre œnologue pour sublimer vos tables.
        </Typography>
      </Box>

      {/* Chargement / Erreurs */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: '#4a0404' }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Liste des Vins Recommandés */}
      {!loading && !error && (
        vinsRecommandes.length === 0 ? (
          <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
            Aucun vin n'est recommandé pour le moment. Revenez très vite !
          </Typography>
        ) : (
          <div className="products-grid-container">
            <div className="wine-cards-wrapper">
              {vinsRecommandes.map((vin) => {
                const estEnRupture = Number(vin.quantity) === 0;
                const aUnePromo = vin.promotion_percentage && Number(vin.promotion_percentage) > 0;
                const prixInitial = Number(vin.price);
                const prixFinal = aUnePromo 
                  ? prixInitial * (1 - Number(vin.promotion_percentage) / 100) 
                  : prixInitial;
                const qty = quantities[vin.id] || (estEnRupture ? 0 : 1);

                return (
                  <Card key={vin.id} style={{ opacity: estEnRupture ? 0.8 : 1, position: 'relative' }}>
                    {/* Conteneur Image + Badges */}
                    <div 
                      className="vin-image-box" 
                      onClick={() => !estEnRupture && handleVoirFiche(vin)} 
                      style={{ cursor: estEnRupture ? 'default' : 'pointer' }}
                    >
                      {estEnRupture && (
                        <div className="recommandations-rupture">RUPTURE</div>
                      )}
                      
                      {aUnePromo && !estEnRupture && (
                        <Badge 
                          badgeContent={`-${vin.promotion_percentage}%`} 
                          color="error" 
                          sx={{ position: 'absolute', top: 20, right: 25 }}
                        />
                      )}
                      
                      <CardMedia
                        component="img"
                        image={vin.cover ? `${API_URL}/uploads/${vin.cover}` : '/placeholder-vin.png'}
                        alt={vin.name}
                      />
                    </div>

                    {/* Contenu textuel */}
                    <CardContent>
                      <Typography 
                        variant="h2" 
                        onClick={() => !estEnRupture && handleVoirFiche(vin)} 
                        style={{ cursor: estEnRupture ? 'default' : 'pointer' }}
                      >
                        {vin.name}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="textSecondary" sx={{ fontStyle: 'italic', mb: 1, textTransform: 'capitalize' }}>
                        {vin.category || 'Catégorie non spécifiée'}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '4.5em',
                          lineHeight: 1.5,
                          mb: 2
                        }}
                      >
                        {vin.description || 'Aucune description disponible pour cette cuvée.'}
                      </Typography>

                      {/* Zone Prix synchronisée avec formatPrice */}
                      <div className="vin-price-box">
                        {aUnePromo ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography className="vin-price-final" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                              {formatPrice(prixFinal)}
                            </Typography>
                            <Typography sx={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9rem' }}>
                              {formatPrice(prixInitial)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography className="vin-price-final">
                            {formatPrice(prixInitial)}
                          </Typography>
                        )}
                      </div>
                    </CardContent>

                    {/* Zone Actions : Fiche + Quantité + Panier */}
                    <CardActions className="vin-card-actions" sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        className="btn-voir-fiche"
                        fullWidth
                        onClick={() => handleVoirFiche(vin)}
                        sx={{ color: '#4a0404', borderColor: '#4a0404', textTransform: 'none' }}
                      >
                        Voir la fiche
                      </Button>
                      
                      <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
                        <TextField
                          type="number" 
                          size="small" 
                          disabled={estEnRupture}
                          value={qty} 
                          onChange={(e) => handleQtyChange(vin.id, e.target.value, vin.quantity)}
                          sx={{ width: '65px', '& .MuiInputBase-input': { padding: '7px' } }}
                        />
                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={() => onAjouter(vin, qty)}
                          disabled={estEnRupture || qty === 0}
                          startIcon={<ShoppingCartIcon />}
                          sx={{ 
                            bgcolor: estEnRupture ? '#ccc' : '#4a0404', 
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#7a0606' }
                          }}
                        >
                          {estEnRupture ? 'Épuisé' : 'Ajouter'}
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* --- MODALE DIALOG ALIGNÉE SUR PRODUITS --- */}
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
                    {formatPrice(selectedWine.promotion_percentage > 0 
                      ? selectedWine.price * (1 - selectedWine.promotion_percentage / 100) 
                      : selectedWine.price)}
                </Typography>
                <Typography sx={{ mt: 1, color: '#555', lineHeight: 1.6, fontStyle: 'italic' }}>
                    "{selectedWine.description}"
                </Typography>
                <Button 
                  variant="contained" fullWidth sx={{ mt: 2, mb: 4, bgcolor: '#4a0404', py: 1 }} 
                  onClick={() => { onAjouter(selectedWine, quantities[selectedWine.id] || 1); handleCloseModal(); }}
                  disabled={selectedWine.quantity <= 0}
                >
                  Ajouter au Panier
                </Button>
              </Box>

              <Divider sx={{ my: 3 }}><Typography variant="button" color="textSecondary">Avis Clients</Typography></Divider>

              {/* Affichage des Avis */}
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
                        <Box sx={{ mt: 1.5, pl: 2, borderLeft: '3px solid #ff9800', bgcolor: '#fffbf5', p: 1, borderRadius: '0 4px 4px 0' }}>
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

              {/* Formulaire de dépôt d'avis */}
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
                    name="recommandations-note" 
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
    </Box>
  );
};

export default Recommandations;