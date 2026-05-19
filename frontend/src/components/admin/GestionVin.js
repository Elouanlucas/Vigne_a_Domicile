import React, { useState, useEffect, useContext } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, IconButton, TextField, Button, Dialog, DialogTitle, 
    DialogContent, DialogActions, Box, Typography, FormControlLabel, Switch 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';

// Importation du contexte de devise
import { CurrencyContext } from '../../context/CurrencyContext';
import '../../styles/GestionVin.css';

function GestionVin() {
    // Utilisation du contexte pour formater les prix dynamiquement
    const { formatPrice } = useContext(CurrencyContext);

    const [vins, setVins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVin, setSelectedVin] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [newVin, setNewVin] = useState({
        name: '',
        cover: '',
        price: '',
        quantity: '', 
        category: '',
        description: '',
        promotion_percentage: '', 
        recommandations: false
    });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchVins();
    }, []);

    const fetchVins = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/vins/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setVins(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur chargement vins:", error);
        }
    };

    const handleAddVin = async () => {
        if (!newVin.name || !newVin.price || !newVin.category || newVin.quantity === '') {
            alert("Veuillez remplir les champs obligatoires");
            return;
        }

        const formData = new FormData();
        formData.append('name', newVin.name);
        formData.append('price', newVin.price);
        formData.append('quantity', newVin.quantity);
        formData.append('category', newVin.category);
        formData.append('description', newVin.description);
        formData.append('promotion_percentage', newVin.promotion_percentage);
        formData.append('recommandations', newVin.recommandations);
        
        if (newVin.cover instanceof File) {
            formData.append('cover', newVin.cover);
        }

        try {
            const url = isEditing 
                ? `http://localhost:3001/api/vins/update/${selectedVin.id}`
                : 'http://localhost:3001/api/vins/add';

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                setOpenDialog(false);
                fetchVins();
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const handleEdit = (vin) => {
        setSelectedVin(vin);
        setNewVin({
            name: vin.name,
            cover: vin.cover || '',
            price: vin.price,
            quantity: vin.quantity, 
            category: vin.category,
            description: vin.description || '',
            promotion_percentage: vin.promotion_percentage || '',
            recommandations: vin.recommandations === 1 || vin.recommandations === true
        });
        setIsEditing(true);
        setOpenDialog(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce vin ?")) {
            try {
                const response = await fetch(`http://localhost:3001/api/vins/delete/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) fetchVins();
            } catch (error) { console.error(error); }
        }
    };

    const handleOpenDialog = () => {
        setIsEditing(false);
        setSelectedVin(null);
        setNewVin({ name: '', cover: '', price: '', quantity: '', category: '', description: '', promotion_percentage: '', recommandations: false });
        setOpenDialog(true);
    };

    const filteredVins = vins.filter(v => 
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box className="gv-container">
            <Typography variant="h4" className="gv-title">
                Gestion Stocks & Promos
            </Typography>

            <Box className="gv-toolbar">
                <TextField label="Rechercher..." variant="outlined" fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleOpenDialog}
                    className="gv-btn-add"
                >
                    Ajouter un vin
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead className="gv-table-head">
                        <TableRow>
                            <TableCell><strong>Nom</strong></TableCell>
                            <TableCell><strong>Catégorie</strong></TableCell>
                            <TableCell><strong>Prix Base</strong></TableCell>
                            <TableCell><strong>Promo (%)</strong></TableCell>
                            <TableCell><strong>Prix Final</strong></TableCell>
                            <TableCell><strong>Stock</strong></TableCell>
                            <TableCell align="center"><strong>Favori</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredVins.map((v) => {
                            // Calcul du prix final remisé
                            const prixFinal = v.promotion_percentage 
                                ? (v.price * (1 - v.promotion_percentage / 100)) 
                                : v.price;

                            return (
                                <TableRow key={v.id} hover>
                                    <TableCell>
                                        <Box className="gv-cell-name">
                                            <img 
                                                src={`http://localhost:3001/uploads/${v.cover}`} 
                                                alt="" 
                                                className="gv-img-cover"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/40'} 
                                            />
                                            {v.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{v.category}</TableCell>
                                    
                                    {/* Utilisation de formatPrice pour le prix de base */}
                                    <TableCell className={v.promotion_percentage ? 'gv-price-promo' : ''}>
                                        {formatPrice(v.price)}
                                    </TableCell>

                                    <TableCell className="gv-promo-percent">
                                        {v.promotion_percentage ? `-${v.promotion_percentage}%` : '-'}
                                    </TableCell>

                                    {/* Utilisation de formatPrice pour le prix final */}
                                    <TableCell className={v.promotion_percentage ? 'gv-price-final' : ''}>
                                        {formatPrice(prixFinal)}
                                    </TableCell>

                                    <TableCell className={v.quantity <= 5 ? 'gv-stock-low' : ''}>
                                        {v.quantity}
                                    </TableCell>
                                    <TableCell align="center" className="gv-recommandation">
                                        {v.recommandations ? <StarIcon className="gv-star" /> : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton color="info" onClick={() => handleEdit(v)}><EditIcon /></IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(v.id)}><DeleteIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle className="gv-dialog-title">
                    {isEditing ? 'Modifier le vin' : 'Ajouter un nouveau vin'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box className="gv-dialog-form">
                        <TextField label="Nom" required value={newVin.name} onChange={(e) => setNewVin({...newVin, name: e.target.value})} className="gv-form-fullwidth" />
                        <TextField label="Catégorie" required value={newVin.category} onChange={(e) => setNewVin({...newVin, category: e.target.value})} />
                        <TextField label="Stock" type="number" required value={newVin.quantity} onChange={(e) => setNewVin({...newVin, quantity: e.target.value})} />
                        <TextField label="Prix de base" type="number" required value={newVin.price} onChange={(e) => setNewVin({...newVin, price: e.target.value})} />
                        
                        <TextField 
                            label="Promotion (%)" 
                            type="number" 
                            value={newVin.promotion_percentage} 
                            onChange={(e) => setNewVin({...newVin, promotion_percentage: e.target.value})} 
                            helperText="Ex: 20 pour -20%" 
                        />
                        
                        <Box className="gv-form-actions">
                            <Button variant="outlined" component="label">
                                {newVin.cover instanceof File ? newVin.cover.name : "Changer l'image"}
                                <input type="file" hidden accept="image/*" onChange={(e) => setNewVin({ ...newVin, cover: e.target.files[0] })} />
                            </Button>
                            <FormControlLabel
                                control={<Switch checked={newVin.recommandations} onChange={(e) => setNewVin({...newVin, recommandations: e.target.checked})} color="warning" />}
                                label="Favori (Recommandé)"
                            />
                        </Box>

                        <TextField label="Description" multiline rows={3} value={newVin.description} onChange={(e) => setNewVin({...newVin, description: e.target.value})} className="gv-form-fullwidth" />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
                    <Button variant="contained" onClick={handleAddVin} sx={{ backgroundColor: '#4a0404' }}>
                        {isEditing ? 'Sauvegarder' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default GestionVin;