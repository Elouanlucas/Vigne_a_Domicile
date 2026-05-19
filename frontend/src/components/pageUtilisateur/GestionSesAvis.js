import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Box, Typography, MenuItem, Select, FormControl, Alert, CircularProgress, Tooltip,
    TextField, InputLabel, Rating, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import '../../styles/GestionSesAvis.css';

// Configuration de l'URL API centrale
const API_URL = 'http://localhost:3001';

function GestionSesAvis() {
    // ID de l'utilisateur connecté
    const currentUserId = 1; 

    // --- ÉTATS ---
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // États pour la recherche et les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('tous'); // 'tous', 'vin', 'prestation'

    // États pour les Modales
    const [selectedAvis, setSelectedAvis] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // États pour le formulaire d'édition
    const [editNote, setEditNote] = useState(5);
    const [editCommentaire, setEditCommentaire] = useState('');

    // --- CHARGEMENT DES AVIS DE L'UTILISATEUR ---
    const fetchUserAvis = () => {
        setLoading(true);
        fetch(`${API_URL}/api/avis/utilisateur/${currentUserId}`)
            .then(res => {
                if (!res.ok) throw new Error("Erreur lors de la récupération de vos avis.");
                return res.json();
            })
            .then(data => {
                setAvis(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUserAvis();
    }, []);

    // --- ACTIONS : OUVERTURE MODALES ---
    const handleOpenEdit = (av) => {
        setSelectedAvis(av);
        setEditNote(av.note);
        setEditCommentaire(av.commentaire);
        setIsEditOpen(true);
    };

    const handleOpenDelete = (av) => {
        setSelectedAvis(av);
        setIsDeleteOpen(true);
    };

    // --- ACTION : ENREGISTRER LA MODIFICATION ---
    const handleUpdateAvis = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        fetch(`${API_URL}/api/avis/${selectedAvis.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                note: editNote,
                commentaire: editCommentaire.trim()
            })
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de la modification");
            return data;
        })
        .then(() => {
            setSuccessMessage("Votre avis a été modifié avec succès !");
            setIsEditOpen(false);
            fetchUserAvis(); // Recharger le tableau
        })
        .catch(err => setError(err.message));
    };

    // --- ACTION : SUPPRIMER L'AVIS ---
    const handleDeleteAvis = () => {
        setError('');
        setSuccessMessage('');

        fetch(`${API_URL}/api/avis/${selectedAvis.id}`, {
            method: 'DELETE'
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de la suppression");
            return data;
        })
        .then(() => {
            setSuccessMessage("L'avis a bien été supprimé.");
            setIsDeleteOpen(false);
            fetchUserAvis(); // Recharger le tableau
        })
        .catch(err => setError(err.message));
    };

    // --- FILTRAGE ET RECHERCHE EN TEMPS RÉEL ---
    const filteredAvis = avis.filter(av => {
        const matchesType = 
            filterType === 'tous' || 
            (filterType === 'vin' && av.vin_id) || 
            (filterType === 'prestation' && av.prestation_id);

        const itemNom = av.vin_nom || av.prestation_nom || '';
        const commentaireSecurise = av.commentaire || '';

        const matchesSearch = 
            itemNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            commentaireSecurise.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesSearch;
    });

    return (
        <Box className="avis-container">
            <Typography variant="h4" className="avis-title">
                Gestion de mes avis
            </Typography>
            <Typography variant="body2" color="textSecondary" className="avis-subtitle">
                Consultez, modifiez ou supprimez les retours d'expérience que vous avez partagés.
            </Typography>

            {/* Alertes Flash */}
            {successMessage && <Alert severity="success" className="avis-alert" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
            {error && <Alert severity="error" className="avis-alert" onClose={() => setError('')}>{error}</Alert>}

            {/* Barre d'outils */}
            <Box className="avis-toolbar">
                <TextField
                    placeholder="Rechercher par cuvée, expérience, mots-clés..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="avis-search-field"
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon className="avis-search-icon" />
                                </InputAdornment>
                            ),
                        }
                    }}
                />

                <FormControl size="small" className="avis-filter-select">
                    <InputLabel id="filter-type-label">Catégorie</InputLabel>
                    <Select
                        labelId="filter-type-label"
                        value={filterType}
                        label="Catégorie"
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <MenuItem value="tous">Tout afficher</MenuItem>
                        <MenuItem value="vin">Vins & Spiritueux</MenuItem>
                        <MenuItem value="prestation">Expériences & Dégustations</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Tableau principal */}
            {loading ? (
                <Box className="avis-loading-box">
                    <CircularProgress className="avis-spinner" />
                </Box>
            ) : filteredAvis.length === 0 ? (
                <Paper className="avis-empty-paper">
                    <Typography variant="body1" color="textSecondary">
                        Aucun avis ne correspond à vos critères.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper} className="avis-table-container">
                    <Table>
                        <TableHead className="avis-table-head">
                            <TableRow>
                                <TableCell className="avis-table-th">Type</TableCell>
                                <TableCell className="avis-table-th">Cible</TableCell>
                                <TableCell className="avis-table-th">Note</TableCell>
                                <TableCell className="avis-table-th-comment">Commentaire & Réponse</TableCell>
                                <TableCell className="avis-table-th">Date</TableCell>
                                <TableCell className="avis-table-th-actions">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAvis.map((av) => (
                                <TableRow key={av.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" className={`avis-type-text ${av.vin_id ? 'type-vin' : 'type-prestation'}`}>
                                            {av.vin_id ? 'Vin' : 'Prestation'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" className="avis-cible-text">
                                            {av.vin_nom || av.prestation_nom || 'Article inconnu'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Rating value={av.note} readOnly size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {/* Commentaire de l'utilisateur */}
                                        <Typography variant="body2" className="avis-comment-text">
                                            "{av.commentaire}"
                                        </Typography>

                                        {/* Réponse admin conditionnelle */}
                                        {av.reponse_admin && (
                                            <Box className="avis-admin-response-box">
                                                <Typography variant="caption" className="avis-admin-response-title">
                                                    Réponse du domaine :
                                                </Typography>
                                                <Typography variant="body2" className="avis-admin-response-text">
                                                    "{av.reponse_admin}"
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {av.created_at ? new Date(av.created_at).toLocaleDateString('fr-FR') : 'N/C'}
                                    </TableCell>
                                    <TableCell>
                                        <Box className="avis-actions-box">
                                            <Tooltip title={av.reponse_admin ? "Modification verrouillée (réponse admin présente)" : "Modifier"}>
                                                <span>
                                                    <IconButton 
                                                        color="primary" 
                                                        onClick={() => handleOpenEdit(av)}
                                                        disabled={Boolean(av.reponse_admin)}
                                                    >
                                                        <EditIcon size="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Supprimer">
                                                <IconButton color="error" onClick={() => handleOpenDelete(av)}>
                                                    <DeleteIcon size="small" />
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

            {/* MODALE 1 : MODIFICATION */}
            <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} maxWidth="sm" fullWidth>
                <Box component="form" onSubmit={handleUpdateAvis}>
                    <DialogTitle className="avis-modal-title-edit">
                        <span>Modifier mon avis</span>
                        <Typography variant="caption" className="avis-modal-tag">
                            {selectedAvis?.vin_id ? 'Vin' : 'Expérience'}
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers className="avis-modal-content">
                        <Typography variant="subtitle1" className="avis-modal-subtitle">
                            {selectedAvis?.vin_nom || selectedAvis?.prestation_nom}
                        </Typography>

                        <Box className="avis-modal-rating-box">
                            <Typography variant="body2">Ajuster votre note :</Typography>
                            <Rating 
                                name="edit-rating" 
                                value={editNote} 
                                onChange={(e, newVal) => setEditNote(newVal || 5)} 
                            />
                        </Box>

                        <TextField
                            label="Votre commentaire modifié"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={editCommentaire}
                            onChange={(e) => setEditCommentaire(e.target.value)}
                            placeholder="Mettez à jour votre ressenti..."
                            required
                        />
                    </DialogContent>
                    <DialogActions className="avis-modal-actions">
                        <Button onClick={() => setIsEditOpen(false)} color="inherit">Annuler</Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={!editCommentaire.trim()}
                            className="avis-btn-submit"
                        >
                            Enregistrer
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* MODALE 2 : CONFIRMATION DE SUPPRESSION */}
            <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DialogTitle className="avis-modal-title-delete">Supprimer l'avis ?</DialogTitle>
                <DialogContent className="avis-modal-content">
                    <Typography>
                        Êtes-vous certain de vouloir supprimer définitivement votre avis sur{" "}
                        <strong>{selectedAvis?.vin_nom || selectedAvis?.prestation_nom}</strong> ?
                    </Typography>
                    {selectedAvis?.reponse_admin && (
                        <Typography variant="body2" color="error" className="avis-delete-warning">
                            ⚠️ Attention : La réponse de l'administrateur sera également effacée.
                        </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary" className="avis-delete-irreversible">
                        Cette action est irréversible.
                    </Typography>
                </DialogContent>
                <DialogActions className="avis-modal-actions">
                    <Button onClick={() => setIsDeleteOpen(false)} color="inherit">Annuler</Button>
                    <Button onClick={handleDeleteAvis} variant="contained" color="error">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GestionSesAvis;