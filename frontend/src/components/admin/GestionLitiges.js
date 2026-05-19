import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Box, Typography, MenuItem, Select, FormControl, Alert, CircularProgress, Tooltip,
    TextField, InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';

function GestionLitiges() {
    const token = localStorage.getItem('token');
    
    // États pour les données
    const [litiges, setLitiges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionStatus, setActionStatus] = useState({ type: '', message: '' });

    // NOUVEAU : États pour la recherche et le tri
    const [searchTerm, setSearchTerm] = useState('');
    const [orderByDate, setOrderByDate] = useState('desc'); // 'desc' (plus récent) ou 'asc' (plus ancien)

    // Modale : On stocke directement le litige sélectionné
    const [openUserModal, setOpenUserModal] = useState(false);
    const [selectedLitige, setSelectedLitige] = useState(null);

    // Charger TOUS les litiges au démarrage
    const fetchAllLitiges = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/litiges', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLitiges(data);
            } else {
                setError('Impossible de récupérer l’ensemble des litiges.');
            }
        } catch (err) {
            console.error(err);
            setError('Erreur de connexion au serveur.');
        } finally {
            withLoading(false);
        }
    };

    const withLoading = (val) => setLoading(val);

    useEffect(() => {
        fetchAllLitiges();
    }, [token]);

    // Changer le statut du litige en direct
    const handleStatusChange = async (id, newStatut) => {
        setActionStatus({ type: '', message: '' });
        try {
            const response = await fetch(`http://localhost:3001/api/litiges/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ statut: newStatut })
            });

            if (response.ok) {
                setActionStatus({ type: 'success', message: 'Statut mis à jour avec succès.' });
                setLitiges(litiges.map(l => l.id === id ? { ...l, statut: newStatut } : l));
            } else {
                setActionStatus({ type: 'error', message: 'Échec de la mise à jour.' });
            }
        } catch (err) {
            setActionStatus({ type: 'error', message: 'Erreur réseau.' });
        }
    };

    // Supprimer un litige définitivement
    const handleDeleteLitige = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce litige ?')) return;
        setActionStatus({ type: '', message: '' });

        try {
            const response = await fetch(`http://localhost:3001/api/litiges/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setActionStatus({ type: 'success', message: 'Litige supprimé.' });
                setLitiges(litiges.filter(l => l.id !== id));
            } else {
                setActionStatus({ type: 'error', message: 'Erreur lors de la suppression.' });
            }
        } catch (err) {
            setActionStatus({ type: 'error', message: 'Erreur réseau.' });
        }
    };

    const handleOpenUserDetail = (litige) => {
        setSelectedLitige(litige);
        setOpenUserModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // NOUVEAU : Logique de filtrage et de tri combinée
    const filteredAndSortedLitiges = litiges
        .filter(litige => {
            const searchLower = searchTerm.toLowerCase();
            return (
                litige.id.toString().includes(searchLower) ||
                (litige.login && litige.login.toLowerCase().includes(searchLower)) ||
                (litige.nom && litige.nom.toLowerCase().includes(searchLower)) ||
                (litige.prenom && litige.prenom.toLowerCase().includes(searchLower)) ||
                (litige.type_motif && litige.type_motif.toLowerCase().includes(searchLower)) ||
                (litige.description && litige.description.toLowerCase().includes(searchLower))
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return orderByDate === 'desc' ? dateB - dateA : dateA - dateB;
        });

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 1, color: '#4a0404', fontWeight: 'bold' }}>
                Gestion des Litiges (Admin)
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                Consultez, gérez les statuts et accédez aux coordonnées des clients ayant déclaré une réclamation.
            </Typography>

            {/* NOUVEAU : Barre de Recherche et Filtre de Tri */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    label="Rechercher un litige"
                    variant="outlined"
                    size="small"
                    placeholder="ID, Client, Motif, Description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                        },
                    }}
                    sx={{ flexGrow: 1, maxWidth: '400px' }}
                />

                <FormControl size="small" sx={{ minWidth: '200px' }}>
                    <InputLabel id="tri-date-label">Ordre chronologique</InputLabel>
                    <Select
                        labelId="tri-date-label"
                        label="Ordre chronologique"
                        value={orderByDate}
                        onChange={(e) => setOrderByDate(e.target.value)}
                    >
                        <MenuItem value="desc">📅 Du plus récent au plus ancien</MenuItem>
                        <MenuItem value="asc">📅 Du plus ancien au plus récent</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {actionStatus.message && (
                <Alert severity={actionStatus.type} sx={{ mb: 3 }} onClose={() => setActionStatus({ type: '', message: '' })}>
                    {actionStatus.message}
                </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress sx={{ color: '#4a0404' }} /></Box>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: '10px' }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#fcfaf7' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Motif</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Liaisons</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date Déclaration</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', minWidth: '130px' }}>Statut</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAndSortedLitiges.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                                        {litiges.length === 0 ? "Aucun litige en base de données." : "Aucun litige ne correspond à votre recherche."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedLitiges.map((litige) => (
                                    <TableRow key={litige.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                                        <TableCell>{litige.id}</TableCell>
                                        
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                                    👤 {litige.login || `ID: ${litige.numUtilisateur}`}
                                                </Typography>
                                                <IconButton 
                                                    size="small" 
                                                    color="primary" 
                                                    onClick={() => handleOpenUserDetail(litige)} 
                                                    title="Infos Client"
                                                >
                                                    <InfoIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ fontWeight: '500' }}>{litige.type_motif}</TableCell>
                                        
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                {litige.commande_id && <Typography variant="caption" sx={{ color: '#7a0606' }}>📦 Cmd N°{litige.commande_id}</Typography>}
                                                {litige.prestation_id && <Typography variant="caption" sx={{ color: '#0066cc' }}>📅 Prest N°{litige.prestation_id}</Typography>}
                                                {!litige.commande_id && !litige.prestation_id && <Typography variant="caption" color="textSecondary">—</Typography>}
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <Tooltip title={litige.description} placement="top">
                                                <span>{litige.description}</span>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{formatDate(litige.created_at)}</TableCell>
                                        
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={litige.statut}
                                                    onChange={(e) => handleStatusChange(litige.id, e.target.value)}
                                                    sx={{ 
                                                        height: '30px', 
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold',
                                                        color: litige.statut === 'ouvert' ? '#0288d1' : litige.statut === 'en_cours' ? '#ed6c02' : litige.statut === 'resolu' ? '#2e7d32' : '#d32f2f'
                                                    }}
                                                >
                                                    <MenuItem value="ouvert">🔴 Ouvert</MenuItem>
                                                    <MenuItem value="en_cours">🟠 En cours</MenuItem>
                                                    <MenuItem value="resolu">🟢 Résolu</MenuItem>
                                                    <MenuItem value="rejete">⚫ Rejeté</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>

                                        <TableCell align="center">
                                            <IconButton color="error" size="small" onClick={() => handleDeleteLitige(litige.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* MODALE DES INFOS CLIENT */}
            <Dialog open={openUserModal} onClose={() => setOpenUserModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', color: '#4a0404' }}>
                    Détails du Client
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedLitige ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Typography variant="body2"><strong>Numéro Client :</strong> {selectedLitige.numUtilisateur}</Typography>
                            <Typography variant="body2"><strong>Pseudo / Login :</strong> {selectedLitige.login || 'Non fourni'}</Typography>
                            <Typography variant="body2"><strong>Nom Complet :</strong> {selectedLitige.prenom || ''} {selectedLitige.nom || ''}</Typography>
                            <Typography variant="body2"><strong>Email :</strong> {selectedLitige.email || 'Non renseigné'}</Typography>
                            <Typography variant="body2"><strong>Téléphone :</strong> {selectedLitige.telephone || 'Non renseigné'}</Typography>
                            <Typography variant="body2"><strong>Rôle :</strong> {selectedLitige.role || 'client'}</Typography>
                            <Typography variant="body2"><strong>Adresse enregistrée :</strong> {selectedLitige.adresseDeLivraison || 'Aucune adresse'}</Typography>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="textSecondary">Aucune donnée disponible.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUserModal(false)} color="primary" variant="contained" sx={{ bgcolor: '#4a0404', '&:hover': { bgcolor: '#7a0606' } }}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GestionLitiges;