import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
    Box, Typography, Button, Paper, Grid, 
    Divider, CircularProgress, IconButton, TextField 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import des Contexts
import { CurrencyContext } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext'; 

// Import du CSS
import '../../styles/Reservation.css';

const Reservation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Récupération des fonctions des Contexts
    const { formatPrice } = useContext(CurrencyContext);
    const { handleAjouterAuPanier } = useCart();

    // États locaux
    const [prestation, setPrestation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null); // 'matin' ou 'apres-midi'
    const [address, setAddress] = useState('');

    // Récupération des données de la prestation au chargement
    useEffect(() => {
        fetch(`http://localhost:3001/api/prestations/${id}`)
            .then(res => res.json())
            .then(data => {
                setPrestation(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération:", err);
                setLoading(false);
            });
    }, [id]);

    const handleConfirm = () => {
        // Validation pour le domicile
        if (prestation.type === 'domicile' && !address.trim()) {
            alert("Veuillez renseigner votre adresse pour la prestation à domicile.");
            return;
        }

    const itemPourPanier = {
        id: `prestation-${prestation.id}-${selectedDate.getTime()}`, 
        name: `${prestation.nom} (${selectedSlot === 'matin' ? 'Matin' : 'Aprem'} - ${selectedDate.toLocaleDateString('fr-FR')})`,
        price: prestation.prix,
        quantity: 1,
        cover: prestation.cover,
        isPrestation: true,
        details: {
            date: selectedDate.toLocaleDateString('fr-FR'),
            slot: selectedSlot,
            address: prestation.type === 'domicile' ? address : prestation.cave_adresse
        }
    };

        // Ajout au panier via le Context
        handleAjouterAuPanier(itemPourPanier, 1);
        
        alert("Réservation ajoutée au panier !");
        navigate('/prestations'); 
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress sx={{ color: '#4a0404' }} />
            </Box>
        );
    }

    if (!prestation) {
        return <Typography sx={{ p: 4, textAlign: 'center' }}>Prestation introuvable.</Typography>;
    }

    return (
        <section className="reservation-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Bouton Retour et Titre */}
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: '#4a0404' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                    Réserver votre expérience
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* COLONNE GAUCHE : Formulaire */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: '15px' }}>
                        
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>1. Choisissez une date</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <Calendar 
                                onChange={setSelectedDate} 
                                value={selectedDate} 
                                minDate={new Date()} 
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>2. Choisissez votre créneau</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button 
                                variant={selectedSlot === 'matin' ? 'contained' : 'outlined'}
                                fullWidth
                                onClick={() => setSelectedSlot('matin')}
                                sx={{ 
                                    py: 2, 
                                    borderColor: '#4a0404', 
                                    color: selectedSlot === 'matin' ? 'white' : '#4a0404',
                                    bgcolor: selectedSlot === 'matin' ? '#4a0404' : 'transparent',
                                    '&:hover': { bgcolor: '#7a0606', color: 'white', borderColor: '#7a0606' }
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 'bold' }}>MATIN</Typography>
                                    <Typography variant="caption">09:00 - 13:00</Typography>
                                </Box>
                            </Button>
                            <Button 
                                variant={selectedSlot === 'apres-midi' ? 'contained' : 'outlined'}
                                fullWidth
                                onClick={() => setSelectedSlot('apres-midi')}
                                sx={{ 
                                    py: 2, 
                                    borderColor: '#4a0404', 
                                    color: selectedSlot === 'apres-midi' ? 'white' : '#4a0404',
                                    bgcolor: selectedSlot === 'apres-midi' ? '#4a0404' : 'transparent',
                                    '&:hover': { bgcolor: '#7a0606', color: 'white', borderColor: '#7a0606' }
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 'bold' }}>APRÈS-MIDI</Typography>
                                    <Typography variant="caption">14:00 - 18:00</Typography>
                                </Box>
                            </Button>
                        </Box>

                        {/* Champ adresse si domicile */}
                        {prestation.type === 'domicile' && (
                            <Box sx={{ mt: 4 }}>
                                <Divider sx={{ mb: 3 }} />
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>3. Adresse de la dégustation</Typography>
                                <TextField
                                    fullWidth
                                    label="Indiquez votre adresse exacte"
                                    variant="outlined"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Ex: 15 rue de la Paix, 75002 Paris"
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* COLONNE DROITE : Récapitulatif */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: '15px', position: 'sticky', top: '20px', bgcolor: '#fdfdfd' }}>
                        <Typography variant="h6" sx={{ color: '#4a0404', mb: 3, fontWeight: 'bold' }}>Récapitulatif</Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <img 
                                src={`http://localhost:3001/uploads/${prestation.cover}`} 
                                alt={prestation.nom} 
                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
                            />
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{prestation.nom}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {prestation.type === 'cave' ? `📍 ${prestation.cave_nom}` : '🏠 À domicile'}
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                            <Typography variant="body1">📅 Date : <strong>{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></Typography>
                            <Typography variant="body1">⏰ Créneau : <strong>{selectedSlot ? selectedSlot.toUpperCase() : <span style={{color: 'red'}}>Non sélectionné</span>}</strong></Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Total</Typography>
                            <Typography variant="h5" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                                {formatPrice(prestation.prix)}
                            </Typography>
                        </Box>

                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            disabled={!selectedSlot || (prestation.type === 'domicile' && !address.trim())}
                            onClick={handleConfirm}
                            sx={{ 
                                bgcolor: '#4a0404', 
                                py: 2, 
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: '#7a0606' },
                                '&:disabled': { bgcolor: '#ccc' }
                            }}
                        >
                            Ajouter au panier
                        </Button>
                        
                        {!selectedSlot && (
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'orange' }}>
                                * Veuillez sélectionner un créneau (Matin ou Après-midi)
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </section>
    );
};

export default Reservation;