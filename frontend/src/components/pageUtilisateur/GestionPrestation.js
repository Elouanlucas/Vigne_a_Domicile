import React, { useState, useEffect, useContext } from 'react'; // Ajout de useContext ici
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../styles/GestionPrestation.css';
import { 
    Dialog, DialogContent, DialogTitle, IconButton, Typography, 
    Box, Chip, Divider, Tooltip 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Import du Context de devise
import { CurrencyContext } from '../../context/CurrencyContext';

function GestionPrestation({ user }) {
    const [date, setDate] = useState(new Date());
    const [prestations, setPrestations] = useState([]);
    const [selectedDayPrestations, setSelectedDayPrestations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Récupération de la fonction de formatage
    const { formatPrice } = useContext(CurrencyContext);
    
    const [selectedPres, setSelectedPres] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const idToUse = user?.numUtilisateur || user?.id;
        if (idToUse) fetchUserPrestations(idToUse);
        else setLoading(false);
    }, [user]);

    const fetchUserPrestations = async (userId) => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        try {
            const response = await fetch(`http://localhost:3001/api/prestations/user/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map(p => ({
                    ...p,
                    date: new Date(p.date_prestation).toLocaleDateString('en-CA') 
                }));
                setPrestations(formattedData);
            }
        } catch (error) { console.error("Erreur fetch:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const clickedDate = date.toLocaleDateString('en-CA');
        const filtered = prestations.filter(p => p.date === clickedDate);
        setSelectedDayPrestations(filtered);
    }, [date, prestations]);

    const handleOpenDetails = (pres) => {
        setSelectedPres(pres);
        setIsModalOpen(true);
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toLocaleDateString('en-CA');
            return prestations.some(p => p.date === dateStr) ? <div className="dot-indicator"></div> : null;
        }
    };

    if (loading) return <div className="loading">Chargement de votre agenda...</div>;

    return (
        <div className="suivi-container">
            <h2>📜 Mon Agenda de réservations</h2>
            <div className="calendar-layout">
                <div className="calendar-box">
                    <Calendar onChange={setDate} value={date} tileContent={tileContent} />
                </div>
                
                <div className="details-box">
                    <h3>Détails du {date.toLocaleDateString()}</h3>
                    {selectedDayPrestations.length > 0 ? (
                        <ul className="articles-list-items">
                            {selectedDayPrestations.map(p => (
                                <li key={p.id} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '10px',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <strong style={{ color: '#4a0404' }}>{p.titre}</strong>
                                    <Tooltip title="Voir les détails">
                                        <IconButton 
                                            onClick={() => handleOpenDetails(p)}
                                            sx={{ color: '#4a0404', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-orders">Aucune prestation prévue ce jour-là.</p>
                    )}
                </div>
            </div>

            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#4a0404', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Détails de la réservation
                    <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPres && (
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                            {selectedPres.cover && (
                                <img 
                                    src={`http://localhost:3001/uploads/${selectedPres.cover}`} 
                                    alt={selectedPres.titre}
                                    style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }}
                                />
                            )}
                            <Typography variant="h5" sx={{ color: '#4a0404', fontWeight: 'bold' }}>{selectedPres.titre}</Typography>
                            
                            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={selectedPres.type} color="secondary" variant="outlined" />
                                <Chip label={new Date(selectedPres.date_prestation).toLocaleDateString()} color="default" />
                                {selectedPres.heure_prestation && (
                                    <Chip 
                                        icon={<AccessTimeIcon style={{ fontSize: '1rem' }} />} 
                                        label={selectedPres.heure_prestation.substring(0, 5)} 
                                        variant="outlined" 
                                    />
                                )}
                            </Box>

                            <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#555', mb: 2 }}>
                                "{selectedPres.description || "Aucune description disponible."}"
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', mb: 1 }}>
                                <LocationOnIcon sx={{ mr: 1, color: '#4a0404' }} />
                                <Typography>{selectedPres.adresse_prestation || "Lieu à confirmer"}</Typography>
                            </Box>

                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: '#4a0404' }}>
                                {/* Utilisation de formatPrice avec le prix de la prestation sélectionnée */}
                                Prix payé : {formatPrice(selectedPres.unit_price)}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default GestionPrestation;