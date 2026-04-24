import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, CircularProgress, IconButton, 
    TextField, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Button,
    Snackbar, Alert // Ajout de ces deux imports
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import '../../styles/Administrateur.css';


function Stocks() {
    const [vins, setVins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    // État pour gérer la popup (Snackbar)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // peut être 'success' ou 'error'
    });

    useEffect(() => {
        fetchVins();
    }, []);

    const fetchVins = () => {
        fetch('http://localhost:3001/api/vins')
            .then(res => res.json())
            .then(data => {
                setVins(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur chargement stocks:", err);
                setLoading(false);
            });
    };

    const handleLocalStockChange = (id, delta) => {
        setVins(prevVins => prevVins.map(vin => {
            if (vin.id === id) {
                const newQty = Math.max(0, (parseInt(vin.quantity) || 0) + delta);
                return { ...vin, quantity: newQty };
            }
            return vin;
        }));
    };

    const handleInputChange = (id, value) => {
        const newValue = value === '' ? 0 : parseInt(value);
        if (!isNaN(newValue) && newValue >= 0) {
            setVins(prevVins => prevVins.map(vin => {
                if (vin.id === id) return { ...vin, quantity: newValue };
                return vin;
            }));
        }
    };

    // Fonction pour fermer la popup
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleUpdateStock = async (vin) => {
        setUpdating(vin.id);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:3001/api/vins/update-stock/${vin.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: vin.quantity })
            });

            if (response.ok) {
                // On affiche la popup de succès
                setSnackbar({
                    open: true,
                    message: `Stock mis à jour pour ${vin.name}`,
                    severity: 'success'
                });
            } else {
                // On affiche la popup d'erreur
                setSnackbar({
                    open: true,
                    message: "Erreur lors de la mise à jour",
                    severity: 'error'
                });
            }
        } catch (error) {
            setSnackbar({ open: true, message: "Erreur serveur", severity: 'error' });
        } finally {
            setUpdating(null);
        }
    };

    const getImageUrl = (cover) => {
        if (!cover) return 'https://via.placeholder.com/50';
        return `http://localhost:3001/uploads/${cover}`;
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        
        <div className="admin-layout">
            {/* On regroupe le titre et le tableau dans un conteneur vertical */}
            <div className="stocks-container">
                <Typography variant="h4" className="stocks-title">
                    Gestion des Stocks
                </Typography>

                <TableContainer component={Paper} className="stocks-table-paper">
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Produit</TableCell>
                                <TableCell>Nom</TableCell>
                                <TableCell align="center">Stock Actuel</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vins.map((vin) => (
                                <TableRow key={vin.id} hover>
                                    <TableCell>
                                        <img 
                                            src={getImageUrl(vin.cover)} 
                                            alt={vin.name} 
                                            style={{ width: '50px', height: '50px', objectFit: 'contain' }} 
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>{vin.name}</TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <IconButton size="small" onClick={() => handleLocalStockChange(vin.id, -1)} color="error">
                                                <RemoveIcon />
                                            </IconButton>
                                            <TextField
                                                size="small" type="number" value={vin.quantity}
                                                onChange={(e) => handleInputChange(vin.id, e.target.value)}
                                                variant="outlined"
                                                sx={{ width: '90px', '& input': { textAlign: 'center' } }}
                                            />
                                            <IconButton size="small" onClick={() => handleLocalStockChange(vin.id, 1)} color="success">
                                                <AddIcon />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            startIcon={updating === vin.id ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                            onClick={() => handleUpdateStock(vin)}
                                            disabled={updating === vin.id}
                                            sx={{ bgcolor: '#4a0404', '&:hover': { bgcolor: '#630606' } }}
                                        >
                                            Sauvegarder
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* La popup Snackbar reste en dehors du flux */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={3000} // Se ferme tout seul après 3 secondes
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position en haut au centre
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Stocks;