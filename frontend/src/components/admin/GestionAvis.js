import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Box, Typography, MenuItem, Select, FormControl, Alert, CircularProgress, Tooltip,
    TextField, InputLabel, Rating, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../../styles/GestionAvis.css';

const API_URL = 'http://localhost:3001';

function GestionAvis() {
    // --- ÉTATS ---
    const [allAvis, setAllAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // États pour la recherche et les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('tous'); // 'tous', 'vin', 'prestation'
    const [filterStatus, setFilterStatus] = useState('tous'); // 'tous', 'attente', 'valide'

    // États pour les Modales
    const [selectedAvis, setSelectedAvis] = useState(null);
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // État pour le formulaire de réponse admin
    const [adminResponse, setAdminResponse] = useState('');

    // --- CHARGEMENT DE TOUS LES AVIS ---
    const fetchAllAvis = () => {
        setLoading(true);
        fetch(`${API_URL}/api/avis`) 
            .then(res => {
                if (!res.ok) throw new Error("Erreur lors de la récupération de la liste globale des avis.");
                return res.json();
            })
            .then(data => {
                setAllAvis(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAllAvis();
    }, []);

    // --- ACTIONS : OUVERTURE MODALES ---
    const handleOpenReply = (av) => {
        setSelectedAvis(av);
        setAdminResponse(av.reponse_admin || '');
        setIsReplyOpen(true);
    };

    const handleOpenDelete = (av) => {
        setSelectedAvis(av);
        setIsDeleteOpen(true);
    };

    // --- ACTION : VALIDER UN AVIS CORRIGÉE (PUT /api/avis/:id/validation) ---
    const handleValidateAvis = (id) => {
        setError('');
        setSuccessMessage('');

        // Correction de l'URL pour correspondre à router.put('/:id/validation')
        // et envoi du body { accept: true } requis par ton contrôleur validateAvis
        fetch(`${API_URL}/api/avis/${id}/validation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accept: true })
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de la validation de l'avis.");
            return data;
        })
        .then(() => {
            setSuccessMessage("L'avis a été validé et est maintenant visible sur le site.");
            fetchAllAvis(); 
        })
        .catch(err => setError(err.message));
    };

    // --- ACTION : ENREGISTRER LA RÉPONSE ADMIN (PUT /:id/reponse) ---
    const handleSaveReply = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        fetch(`${API_URL}/api/avis/${selectedAvis.id}/reponse`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reponse_admin: adminResponse.trim()
            })
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement de la réponse.");
            return data;
        })
        .then(() => {
            setSuccessMessage("Réponse enregistrée avec succès !");
            setIsReplyOpen(false);
            fetchAllAvis(); 
        })
        .catch(err => setError(err.message));
    };

    // --- ACTION : MODÉRATION (SUPPRIMER L'AVIS TOTALEMENT) ---
    const handleDeleteAvis = () => {
        setError('');
        setSuccessMessage('');

        fetch(`${API_URL}/api/avis/${selectedAvis.id}`, {
            method: 'DELETE'
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de la suppression de l'avis.");
            return data;
        })
        .then(() => {
            setSuccessMessage("L'avis a bien été supprimé du site (modération).");
            setIsDeleteOpen(false);
            fetchAllAvis(); 
        })
        .catch(err => setError(err.message));
    };

    // --- FILTRAGE ET RECHERCHE EN TEMPS RÉEL CORRIGÉS ---
    const filteredAvis = allAvis.filter(av => {
        // 1. Filtre par catégorie
        const matchesType = 
            filterType === 'tous' || 
            (filterType === 'vin' && av.vin_id) || 
            (filterType === 'prestation' && av.prestation_id);

        // 2. CORRECTION : On utilise la propriété 'valider' (reçue de la BDD SQL) et non 'valide'
        // On force la comparaison numérique ou booléenne (0 / false vs 1 / true)
        const isAvisValide = Number(av.valider) === 1 || av.valider === true;

        const matchesStatus = 
            filterStatus === 'tous' ||
            (filterStatus === 'attente' && !isAvisValide) ||
            (filterStatus === 'valide' && isAvisValide);

        // 3. Recherche textuelle
        const itemNom = av.vin_nom || av.prestation_nom || '';
        const clientNom = `${av.prenom || ''} ${av.nom || ''}`.toLowerCase();
        const commentaireSecurise = av.commentaire || '';

        const matchesSearch = 
            itemNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientNom.includes(searchTerm.toLowerCase()) ||
            commentaireSecurise.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesStatus && matchesSearch;
    });

    return (
        <Box className="gestion-avis-container">
            <Typography variant="h4" className="gestion-avis-title">
                Gestion des avis
            </Typography>
            <Typography variant="body2" color="textSecondary" className="gestion-avis-subtitle">
                Modérez, validez les avis de vos clients et répondez à leurs retours d'expériences.
            </Typography>

            {/* Alertes Flash */}
            {successMessage && <Alert severity="success" className="gestion-avis-alert" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
            {error && <Alert severity="error" className="gestion-avis-alert" onClose={() => setError('')}>{error}</Alert>}

            {/* Outils de recherche et filtres */}
            <Box className="gestion-avis-toolbar" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <TextField
                    placeholder="Rechercher par client, cuvée, commentaire..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="gestion-avis-search-field"
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon className="gestion-avis-search-icon" />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl size="small" className="gestion-avis-filter-control" sx={{ minWidth: 150 }}>
                    <InputLabel id="admin-filter-label">Catégorie</InputLabel>
                    <Select
                        labelId="admin-filter-label"
                        value={filterType}
                        label="Catégorie"
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <MenuItem value="tous">Tout afficher</MenuItem>
                        <MenuItem value="vin">🍷 Vins & Spiritueux</MenuItem>
                        <MenuItem value="prestation">🏠 Expériences & Dégustations</MenuItem>
                    </Select>
                </FormControl>

                {/* CORRECTION : Filtre Statut synchronisé avec 'valider' */}
                <FormControl size="small" className="gestion-avis-filter-control" sx={{ minWidth: 150 }}>
                    <InputLabel id="admin-status-filter-label">Statut</InputLabel>
                    <Select
                        labelId="admin-status-filter-label"
                        value={filterStatus}
                        label="Statut"
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="tous">Tous les statuts</MenuItem>
                        <MenuItem value="attente">⏳ En attente ({allAvis.filter(a => Number(a.valider) === 0 || a.valider === false).length})</MenuItem>
                        <MenuItem value="valide">✅ Validés ({allAvis.filter(a => Number(a.valider) === 1 || a.valider === true).length})</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Tableau principal */}
            {loading ? (
                <Box className="gestion-avis-loading-box">
                    <CircularProgress className="gestion-avis-loading-spinner" />
                </Box>
            ) : filteredAvis.length === 0 ? (
                <Paper className="gestion-avis-empty-paper">
                    <Typography variant="body1" color="textSecondary">
                        Aucun avis à modérer ou ne correspond à vos critères.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} className="gestion-avis-table-container">
                    <Table>
                        <TableHead className="gestion-avis-table-header">
                            <TableRow>
                                <TableCell className="gestion-avis-header-cell">Statut</TableCell>
                                <TableCell className="gestion-avis-header-cell">Client</TableCell>
                                <TableCell className="gestion-avis-header-cell">Cible</TableCell>
                                <TableCell className="gestion-avis-header-cell">Note / Commentaire</TableCell>
                                <TableCell className="gestion-avis-header-cell">Réponse Admin</TableCell>
                                <TableCell className="gestion-avis-header-cell">Date</TableCell>
                                <TableCell className="gestion-avis-header-cell-center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAvis.map((av) => {
                                // Variable locale pour simplifier le rendu des conditions de validation
                                const isValide = Number(av.valider) === 1 || av.valider === true;

                                return (
                                    <TableRow 
                                        key={av.id} 
                                        hover 
                                        sx={{ 
                                            backgroundColor: !isValide ? 'rgba(255, 152, 0, 0.05)' : 'inherit',
                                            '&:hover': { backgroundColor: !isValide ? 'rgba(255, 152, 0, 0.1) !important' : '' }
                                        }}
                                    >
                                        {/* CORRECTION : Colonne Statut de Validation mise à jour */}
                                        <TableCell>
                                            <Box 
                                                sx={{ 
                                                    display: 'inline-block', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    backgroundColor: isValide ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                    color: isValide ? '#2e7d32' : '#ed6c02',
                                                    border: isValide ? '1px solid #2e7d32' : '1px solid #ed6c02'
                                                }}
                                            >
                                                {isValide ? 'En ligne' : 'En attente'}
                                            </Box>
                                        </TableCell>

                                        {/* Client */}
                                        <TableCell>
                                            <Typography variant="body2" className="gestion-avis-client-name">
                                                {av.prenom} {av.nom}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                ID User: {av.numUtilisateur}
                                            </Typography>
                                        </TableCell>

                                        {/* Cible */}
                                        <TableCell>
                                            <Typography variant="caption" className={av.vin_id ? "gestion-avis-target-badge-vin" : "gestion-avis-target-badge-prestation"}>
                                                {av.vin_id ? '🍷 VIN' : '🏠 PRESTATION'}
                                            </Typography>
                                            <Typography variant="body2" className="gestion-avis-target-name">
                                                {av.vin_nom || av.prestation_nom || 'Article inconnu'}
                                            </Typography>
                                        </TableCell>

                                        {/* Note et Commentaire */}
                                        <TableCell>
                                            <Rating value={av.note} readOnly size="small" className="gestion-avis-rating" />
                                            <Typography variant="body2" className="gestion-avis-comment-text">
                                                "{av.commentaire || 'Pas de texte'}"
                                            </Typography>
                                        </TableCell>

                                        {/* Réponse Admin Actuelle */}
                                        <TableCell>
                                            {av.reponse_admin ? (
                                                <Box className="gestion-avis-box-container">
                                                    <Box className="gestion-avis-response-box">
                                                        <Typography variant="body2" className="gestion-avis-response-text">
                                                            "{av.reponse_admin}"
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary" className="gestion-avis-no-response">
                                                    Aucune réponse enregistrée.
                                                </Typography>
                                            )}
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell>
                                            {av.created_at ? new Date(av.created_at).toLocaleDateString('fr-FR') : 'N/C'}
                                        </TableCell>

                                        {/* Actions Administrateur */}
                                        <TableCell className="gestion-avis-actions-cell">
                                            <Box className="gestion-avis-actions-wrapper" sx={{ display: 'flex', gap: 0.5 }}>
                                                
                                                {/* CORRECTION : Bouton de Validation affiché si non validé */}
                                                {!isValide && (
                                                    <Tooltip title="Valider et publier l'avis">
                                                        <IconButton color="success" onClick={() => handleValidateAvis(av.id)}>
                                                            <CheckCircleIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}

                                                <Tooltip title={av.reponse_admin ? "Modifier la réponse" : "Répondre"}>
                                                    <IconButton color="warning" onClick={() => handleOpenReply(av)}>
                                                        <ReplyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Supprimer (Modération)">
                                                    <IconButton color="error" onClick={() => handleOpenDelete(av)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* MODALE 1 : RÉPONDRE À UN AVIS */}
            <Dialog open={isReplyOpen} onClose={() => setIsReplyOpen(false)} maxWidth="sm" fullWidth>
                <Box component="form" onSubmit={handleSaveReply}>
                    <DialogTitle className="gestion-avis-dialog-title-reply">
                        Répondre à l'avis de {selectedAvis?.prenom} {selectedAvis?.nom}
                    </DialogTitle>
                    <DialogContent dividers className="gestion-avis-dialog-content-reply">
                        <Box className="gestion-avis-client-comment-recall" sx={{ mb: 2 }}>
                            <Typography variant="caption" className="gestion-avis-client-comment-recall-title" sx={{ fontWeight: 'bold', display: 'block' }}>
                                Commentaire du client :
                            </Typography>
                            <Typography variant="body2" className="gestion-avis-client-comment-recall-text" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                "{selectedAvis?.commentaire}"
                            </Typography>
                        </Box>

                        <TextField
                            label="Votre réponse officielle"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={adminResponse}
                            onChange={(e) => setAdminResponse(e.target.value)}
                            placeholder="Écrivez votre message ici (laissez vide pour effacer une réponse existante)..."
                        />
                    </DialogContent>
                    <DialogActions className="gestion-avis-dialog-actions">
                        <Button onClick={() => setIsReplyOpen(false)} color="inherit">Annuler</Button>
                        <Button type="submit" variant="contained" className="gestion-avis-submit-button">
                            Enregistrer la réponse
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* MODALE 2 : CONFIRMATION DE SUPPRESSION */}
            <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DialogTitle className="gestion-avis-dialog-title-delete">Supprimer l'avis définitivement ?</DialogTitle>
                <DialogContent className="gestion-avis-dialog-content-delete">
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer cet avis client ? Cet acte de modération est <strong>irréversible</strong> et supprimera également toute réponse associée.
                    </Typography>
                </DialogContent>
                <DialogActions className="gestion-avis-dialog-actions">
                    <Button onClick={() => setIsDeleteOpen(false)} color="inherit">Annuler</Button>
                    <Button onClick={handleDeleteAvis} variant="contained" color="error">
                        Supprimer l'avis
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GestionAvis;