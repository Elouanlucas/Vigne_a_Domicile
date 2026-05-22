import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Box, Typography, Alert, CircularProgress, Tooltip, TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RateReviewIcon from '@mui/icons-material/RateReview';
import '../../styles/GestionLivreDOR.css';

const API_URL = 'http://localhost:3001';

function GestionLivreDOR() {
    const [messagesTempo, setMessagesTempo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // États pour la popup de validation/réponse
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [reponseAdmin, setReponseAdmin] = useState('');

    useEffect(() => {
        fetchMessagesTempo();
    }, []);

    // Récupérer les messages en attente (table tempo)
    const fetchMessagesTempo = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/livredor/tempo`);
            if (response.ok) {
                const data = await response.json();
                setMessagesTempo(data);
            } else {
                setError('Impossible de charger les messages en attente.');
            }
        } catch (err) {
            console.error(err);
            setError('Erreur réseau lors de la récupération des messages.');
        } finally {
            setLoading(false);
        }
    };

    // Ouvrir la boîte de dialogue pour traiter un message précis
    const handleOpenDialog = (msg) => {
        setSelectedMsg(msg);
        setReponseAdmin('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedMsg(null);
        setReponseAdmin('');
    };

    // Action : Valider et transférer vers la table finale (avec ou sans réponse admin)
    const handleValider = async () => {
        if (!selectedMsg) return;
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/api/livredor/valider/${selectedMsg.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reponse_admin: reponseAdmin.trim() || null })
            });

            if (response.ok) {
                setSuccess(`Le message de @${selectedMsg.login} a été approuvé et publié !`);
                fetchMessagesTempo();
                handleCloseDialog();
            } else {
                const errData = await response.json();
                setError(errData.message || 'Erreur lors de la validation du message.');
            }
        } catch (err) {
            console.error(err);
            setError('Erreur réseau lors de la validation.');
        }
    };

    // Action : Refuser et supprimer définitivement de la table tempo
    const handleRefuser = async (msgId, login) => {
        const confirmation = window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le message de @${login} ?`);
        if (!confirmation) return;

        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/api/livredor/tempo/${msgId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setSuccess(`Le message de @${login} a été refusé et supprimé.`);
                fetchMessagesTempo();
                if (openDialog) handleCloseDialog();
            } else {
                setError('Erreur lors de la suppression du message temporaire.');
            }
        } catch (err) {
            console.error(err);
            setError('Erreur réseau lors du refus.');
        }
    };

    return (
        <Box className="livredor-admin-container" sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" className="livredor-admin-title" sx={{ mb: 3, fontWeight: 'bold', color: '#4a0404' }}>
                Gestion des messages du Livre d'Or
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress sx={{ color: '#4a0404' }} />
                </Box>
            ) : messagesTempo.length === 0 ? (
                <Alert severity="info">Aucun message en attente de modération pour le moment.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: '10px' }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#fbfaf8' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Auteur</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date de dépôt</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Note générale</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Critères positifs</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {messagesTempo.map((msg) => (
                                <TableRow key={msg.id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>@{msg.login}</TableCell>
                                    <TableCell>{new Date(msg.created_at).toLocaleDateString('fr-FR')}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#4a0404' }}>{msg.note_generale} / 5</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {msg.avis_vin === 1 && <span className="admin-badge">🍷 Vin</span>}
                                            {msg.avis_prestation === 1 && <span className="admin-badge">⭐ Prest.</span>}
                                            {msg.avis_site === 1 && <span className="admin-badge">💻 Site</span>}
                                            {msg.avis_livraison === 1 && <span className="admin-badge">📦 Livr.</span>}
                                            {msg.avis_SAV === 1 && <span className="admin-badge">🛠️ SAV</span>}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {msg.message}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="Traiter / Répondre">
                                                <IconButton color="primary" onClick={() => handleOpenDialog(msg)}>
                                                    <RateReviewIcon sx={{ color: '#4a0404' }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Refuser directement">
                                                <IconButton color="error" onClick={() => handleRefuser(msg.id, msg.login)}>
                                                    <CancelIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* POPUP DE TRAITEMENT, MODÉRATION ET RÉPONSE */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                    Modération du message de @{selectedMsg?.login}
                </DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    {/* Rappel du message utilisateur */}
                    <Box sx={{ bg: '#fbfaf8', p: 2, borderRadius: '8px', borderLeft: '4px solid #4a0404' }}>
                        <Typography variant="caption" color="textSecondary" block>
                            Note : {selectedMsg?.note_generale}/5
                        </Typography>
                        <Typography variant="body1" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                            "{selectedMsg?.message}"
                        </Typography>
                    </Box>

                    {/* Formulaire de réponse de l'admin */}
                    <TextField
                        label="Votre réponse (facultatif)"
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        placeholder="Écrivez votre réponse ici avant de valider..."
                        value={reponseAdmin}
                        onChange={(e) => setReponseAdmin(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<CancelIcon />}
                        onClick={() => handleRefuser(selectedMsg.id, selectedMsg.login)}
                    >
                        Refuser le message
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
                            Annuler
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<CheckCircleIcon />}
                            onClick={handleValider}
                            sx={{ backgroundColor: '#4a0404', '&:hover': { backgroundColor: '#6b0707' } }}
                        >
                            Valider & Publier
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GestionLivreDOR;