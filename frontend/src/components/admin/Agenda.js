import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
    Box, Typography, Paper, Grid, Divider, Dialog, 
    DialogTitle, DialogContent, IconButton, Chip, List, ListItem, ListItemText, ListItemIcon 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete'; // Importation de l'icône Corbeille
import '../../styles/Agenda.css';

function Agenda() {
    const [date, setDate] = useState(new Date());
    const [prestations, setPrestations] = useState([]);
    const [selectedPres, setSelectedPres] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [token] = useState(localStorage.getItem('token'));

    useEffect(() => {
        fetchAllPrestations();
    }, []);

    const fetchAllPrestations = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/prestations/details-complets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (Array.isArray(data)) {
                const formatted = data.map(p => ({
                    ...p,
                    dateKey: new Date(p.date_prestation).toLocaleDateString('en-CA')
                }));
                setPrestations(formatted);

                // Si la modale est ouverte, on rafraîchit aussi l'objet sélectionné
                if (selectedPres) {
                    const updatedSelected = formatted.find(p => p.id === selectedPres.id);
                    if (updatedSelected) setSelectedPres(updatedSelected);
                }
            } else {
                console.error("Format de données invalide :", data);
                setPrestations([]);
            }
        } catch (error) {
            console.error("Erreur chargement agenda:", error);
        }
    };

    // --- NOUVELLE FONCTION : SUPPRESSION D'UN PARTICIPANT ---
    const handleDeleteParticipant = async (participant) => {
        if (!window.confirm(`Voulez-vous vraiment désinscrire ${participant.nom_complet || participant.email} de cette prestation ?`)) {
            return;
        }

        try {
            // Appel de la nouvelle route avec l'ID de la prestation et l'email du participant
            const response = await fetch(`http://localhost:3001/api/prestations/${selectedPres.id}/participants/${participant.email}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await fetchAllPrestations(); // Recharge les données
            } else {
                const errData = await response.json();
                alert(errData.error || "Erreur lors de la suppression du participant.");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            alert("Impossible de joindre le serveur.");
        }
    };

    const handleOpenDetails = (pres) => {
        setSelectedPres(pres);
        setIsModalOpen(false); // Sécurité reset
        setTimeout(() => setIsModalOpen(true), 50);
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toLocaleDateString('en-CA');
            const count = prestations.filter(p => p.dateKey === dateStr).length;
            return count > 0 ? (
                <Box className="dot-indicator-container">
                    <div className="dot-indicator"></div>
                    {count > 1 && <span className="event-count">x{count}</span>}
                </Box>
            ) : null;
        }
    };

    const selectedDayPrestations = prestations.filter(
        p => p.dateKey === date.toLocaleDateString('en-CA')
    );

    return (
        <Box sx={{ p: 3, maxWidth: '1000px', margin: '0 auto' }}>
            <Typography variant="h4" sx={{ mb: 3, color: '#4a0404', fontWeight: 'bold', textAlign: 'center' }}>
                Agenda des Réservations
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                        <Calendar 
                            onChange={setDate} 
                            value={date} 
                            tileContent={tileContent}
                            className="admin-large-calendar"
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h5" sx={{ mb: 2, color: '#4a0404', fontWeight: 'medium' }}>
                            Prestations du {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                        <Divider sx={{ mb: 3, bgcolor: '#4a0404', height: 2 }} />
                        
                        <Grid container spacing={2}>
                            {selectedDayPrestations.length > 0 ? (
                                selectedDayPrestations.map(p => (
                                    <Grid item xs={12} sm={6} md={4} key={p.id}>
                                        <Paper 
                                            elevation={2} 
                                            sx={{ 
                                                p: 2, 
                                                cursor: 'pointer', 
                                                transition: '0.3s',
                                                borderLeft: '5px solid #4a0404',
                                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
                                            }}
                                            onClick={() => handleOpenDetails(p)}
                                        >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4a0404' }}>
                                                {p.nom}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                                <Chip size="small" icon={<PeopleIcon />} label={`${p.participants?.length || 0} inscrits`} />
                                                <Chip size="small" variant="outlined" label={p.type} />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                ))
                            ) : (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                                        <Typography sx={{ fontStyle: 'italic', color: 'gray' }}>
                                            Aucun événement prévu pour cette date.
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>

            {/* MODALE DE DÉTAILS PARTICIPANTS AVEC OPTION DE SUPPRESSION */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#4a0404', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Détails de la Prestation
                    <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPres && (
                        <Box>
                            <Typography variant="h5" gutterBottom>{selectedPres.nom}</Typography>
                            
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                        <Typography variant="caption">Places Restantes</Typography>
                                        <Typography variant="h6" color="primary">
                                            {selectedPres.quantity - (selectedPres.participants?.length || 0)} / {selectedPres.quantity}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                                        <Typography variant="caption">Total Revenus</Typography>
                                        <Typography variant="h6">
                                            {(selectedPres.participants?.length || 0) * selectedPres.prix} €
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                                <PeopleIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> 
                                Liste des Participants ({selectedPres.participants?.length || 0})
                            </Typography>
                            <Divider sx={{ mb: 1 }} />
                            
                            <List dense>
                                {selectedPres.participants && selectedPres.participants.length > 0 ? (
                                    selectedPres.participants.map((user, index) => (
                                        <ListItem 
                                            key={index}
                                            secondaryAction={
                                                // AJOUT DU BOUTON DE SUPPRESSION À DROITE
                                                <IconButton 
                                                    edge="end" 
                                                    aria-label="delete" 
                                                    color="error" 
                                                    onClick={() => handleDeleteParticipant(user)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
                                            <ListItemText 
                                                primary={user.nom_complet || user.email} 
                                                secondary={`Réservé le ${new Date(user.date_achat).toLocaleDateString()}`}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'gray' }}>
                                        Aucun inscrit pour le moment.
                                    </Typography>
                                )}
                            </List>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default Agenda;