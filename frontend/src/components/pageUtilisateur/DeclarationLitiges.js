import React, { useState, useContext } from 'react';
import { 
    Box, Typography, TextField, Button, MenuItem, 
    FormControl, InputLabel, Select, Alert, CircularProgress 
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import SendIcon from '@mui/icons-material/Send';
import { ThemeContext } from '../../context/ThemeContext';
import '../../styles/DeclarationLitiges.css';

function DeclarationLitiges() {
    const { theme } = useContext(ThemeContext);
    const token = localStorage.getItem('token');

    // États pour les champs du formulaire (alignés sur ta table SQL)
    const [litigeData, setLitigeData] = useState({
        commande_id: '',
        prestation_id: '',
        type_motif: '',
        description: ''
    });

    // États pour la gestion de l'envoi et des messages d'erreur/succès
    const [status, setStatus] = useState({ type: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    // Gestion des changements dans les inputs
    const handleChange = (e) => {
        setLitigeData({
            ...litigeData,
            [e.target.name]: e.target.value
        });
    };

    // Soumission du formulaire au backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus({ type: '', message: '' });

        if (!token) {
            setStatus({ 
                type: 'error', 
                message: 'Vous devez être connecté pour déclarer un litige.' 
            });
            setSubmitting(false);
            return;
        }

        // --- SÉCURISATION ET NETTOYAGE DES DONNÉES ENTRÉES ---
        const commandeIdParsed = parseInt(litigeData.commande_id, 10);
        const prestationIdParsed = parseInt(litigeData.prestation_id, 10);

        // Si la valeur n'est pas un nombre, ou est <= 0, on force un "null" propre pour la BDD
        const cleanCommandeId = (!isNaN(commandeIdParsed) && commandeIdParsed > 0) ? commandeIdParsed : null;
        const cleanPrestationId = (!isNaN(prestationIdParsed) && prestationIdParsed > 0) ? prestationIdParsed : null;

        try {
            const response = await fetch('http://localhost:3001/api/litiges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    commande_id: cleanCommandeId,
                    prestation_id: cleanPrestationId,
                    type_motif: litigeData.type_motif,
                    description: litigeData.description
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ 
                    type: 'success', 
                    message: 'Votre litige a bien été enregistré. Notre équipe va l’étudier rapidement.' 
                });
                // Réinitialisation du formulaire
                setLitigeData({ commande_id: '', prestation_id: '', type_motif: '', description: '' });
            } else if (response.status === 401 || response.status === 403) {
                console.error('Déclaration de litige échouée (authentification)', data);
                setStatus({ 
                    type: 'error', 
                    message: 'Vous n’êtes pas connecté ou votre session a expiré. Veuillez vous reconnecter.' 
                });
            } else {
                setStatus({ 
                    type: 'error', 
                    message: data.message || 'Une erreur est survenue lors de l’envoi.' 
                });
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            setStatus({ 
                type: 'error', 
                message: 'Impossible de joindre le serveur. Veuillez réessayer plus tard.' 
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className={`contact-page ${theme}`}>
            <div className="contact-card">
                
                {/* En-tête du formulaire */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, justifyContent: 'center' }}>
                    <GavelIcon sx={{ fontSize: 32, color: '#4a0404' }} />
                    <Typography variant="h4" component="h1" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                        Déclarer un Litige
                    </Typography>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
                    Un problème avec une bouteille, une livraison ou une dégustation ? 
                    Remplissez ce formulaire pour qu'un administrateur prenne en charge votre demande.
                </Typography>

                {/* Affichage des messages de statut (Succès / Erreur) */}
                {status.message && (
                    <Alert severity={status.type} sx={{ mb: 3, borderRadius: '8px' }}>
                        {status.message}
                    </Alert>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {/* ID Commande (Optionnel) */}
                            <TextField
                                label="N° de Commande (Vins)"
                                name="commande_id"
                                variant="outlined"
                                type="number"
                                sx={{ flex: 1, minWidth: '200px' }}
                                value={litigeData.commande_id}
                                onChange={handleChange}
                            />

                            {/* ID Prestation (Optionnel) */}
                            <TextField
                                label="N° de Prestation (Dégustation)"
                                name="prestation_id"
                                variant="outlined"
                                type="number"
                                sx={{ flex: 1, minWidth: '200px' }}
                                value={litigeData.prestation_id}
                                onChange={handleChange}
                            />
                        </Box>

                        {/* Motif (Obligatoire) */}
                        <FormControl fullWidth required>
                            <InputLabel id="motif-label">Motif du litige</InputLabel>
                            <Select
                                labelId="motif-label"
                                name="type_motif"
                                value={litigeData.type_motif}
                                label="Motif du litige"
                                onChange={handleChange}
                            >
                                <MenuItem value="Bouteille cassée ou défectueuse">🍷 Bouteille cassée ou défectueuse</MenuItem>
                                <MenuItem value="Erreur de produits dans la commande">📦 Erreur d'articles reçus</MenuItem>
                                <MenuItem value="Prestation non honorée / Absence">📅 Prestation non honorée</MenuItem>
                                <MenuItem value="Problème de comportement / Déroulement">🗣️ Problème lors de l'événement</MenuItem>
                                <MenuItem value="Autre réclamation">❓ Autre réclamation</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Description (Obligatoire) */}
                        <TextField
                            label="Description détaillée de votre problème"
                            name="description"
                            multiline
                            rows={4}
                            fullWidth
                            required
                            value={litigeData.description}
                            onChange={handleChange}
                            placeholder="Donnez un maximum d'explications (ex: heure, état du colis, nom du vin...) pour accélérer la résolution."
                        />

                        {/* Bouton d'envoi */}
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                            sx={{ 
                                bgcolor: '#4a0404', 
                                '&:hover': { bgcolor: '#7a0606' },
                                py: 1.5,
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}
                        >
                            {submitting ? 'Traitement en cours...' : 'Envoyer la réclamation'}
                        </Button>

                    </Box>
                </form>

            </div>
        </main>
    );
}

export default DeclarationLitiges;