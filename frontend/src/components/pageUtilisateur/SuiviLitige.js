import React, { useState, useEffect, useContext } from 'react';
import { 
    Box, Typography, Paper, Chip, CircularProgress, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Collapse, Tooltip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HistoryIcon from '@mui/icons-material/History';
import { ThemeContext } from '../../context/ThemeContext';
import '../../styles/SuiviLitige.css';

// Composant pour chaque ligne du tableau (avec détails pliables)
function Row({ litige, theme }) {
    const [open, setOpen] = useState(false);

    const getStatusChip = (statut) => {
        const styles = {
            ouvert: { color: 'info', label: 'Ouvert' },
            en_cours: { color: 'warning', label: 'En cours' },
            resolu: { color: 'success', label: 'Résolu' },
            rejete: { color: 'error', label: 'Rejeté' }
        };
        const current = styles[statut] || { color: 'default', label: statut };
        return <Chip label={current.label} color={current.color} size="small" sx={{ fontWeight: '500', height: 24 }} />;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '&:hover': { bgcolor: theme === 'dark' ? '#252525' : '#fafafa' } }}>
                <TableCell width="50">
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ fontWeight: '600' }}>{litige.type_motif}</TableCell>
                <TableCell align="center">
                    {litige.commande_id ? (
                        <Chip label={`📦 N°${litige.commande_id}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                    ) : '—'}
                </TableCell>
                <TableCell align="center">
                    {litige.prestation_id ? (
                        <Chip label={`📅 N°${litige.prestation_id}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                    ) : '—'}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                    {formatDate(litige.created_at)}
                </TableCell>
                <TableCell align="right">{getStatusChip(litige.statut)}</TableCell>
            </TableRow>
            
            {/* Contenu déroulant (Description du problème) */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1.5, p: 2, borderRadius: '6px', bgcolor: theme === 'dark' ? '#2d2d2d' : '#f9f9f9', borderLeft: '3px solid #4a0404' }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: 'text.secondary' }}>
                                Description du problème :
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                                {litige.description}
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function SuiviLitige() {
    const { theme } = useContext(ThemeContext);
    const token = localStorage.getItem('token');
    const [litiges, setLitiges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLitiges = async () => {
            if (!token) {
                setError('Vous devez être connecté.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('http://localhost:3001/api/litiges', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    setLitiges(await response.json());
                } else {
                    setError('Impossible de récupérer vos litiges.');
                }
            } catch (err) {
                setError('Erreur de connexion.');
            } finally {
                setLoading(false);
            }
        };
        fetchLitiges();
    }, [token]);

    return (
        <main className={`suivi-page ${theme}`}>
            <Box sx={{ width: '100%', maxWidth: 850, mx: 'auto', p: 2 }}>
                <Paper elevation={2} className="suivi-card" sx={{ p: 3, borderRadius: '12px' }}>
                    
                    {/* En-tête compact */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <HistoryIcon sx={{ color: '#4a0404', fontSize: 26 }} />
                        <Typography variant="h5" component="h1" sx={{ color: '#4a0404', fontWeight: 'bold', fontSize: '1.4rem' }}>
                            Historique des Litiges
                        </Typography>
                    </Box>

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress size={30} sx={{ color: '#4a0404' }} />
                        </Box>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {!loading && !error && (
                        litiges.length === 0 ? (
                            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontStyle: 'italic' }}>
                                Aucun litige déclaré. 🎉
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small" aria-label="tableau des litiges">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="50" />
                                            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Motif</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Commande</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Prestation</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Date</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Statut</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {litiges.map((litige) => (
                                            <Row key={litige.id} litige={litige} theme={theme} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    )}
                </Paper>
            </Box>
        </main>
    );
}

export default SuiviLitige;