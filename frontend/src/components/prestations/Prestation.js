import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Button, TextField, Box, Dialog, DialogContent, 
    DialogTitle, IconButton, Typography, Radio, 
    RadioGroup, FormControlLabel, Checkbox, Divider, Rating, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import PlaceIcon from '@mui/icons-material/Place';
import BusinessIcon from '@mui/icons-material/Business';
import { CurrencyContext } from '../../context/CurrencyContext';
import '../../styles/Prestations.css';

// Configuration de l'URL API centrale
const API_URL = 'http://localhost:3001';

const Prestations = () => {
    const { formatPrice } = useContext(CurrencyContext);
    const navigate = useNavigate();
    
    // --- ÉTATS POUR LES DONNÉES ---
    const [prestations, setPrestations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrestation, setSelectedPrestation] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // --- ÉTATS POUR LES FILTRES ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('asc');
    const [selectedCity, setSelectedCity] = useState('Toutes');
    const [selectedTypes, setSelectedTypes] = useState({
        cave: true,
        domicile: true
    });

    // --- ÉTATS POUR LES AVIS ---
    const [avisList, setAvisList] = useState([]);
    const [loadingAvis, setLoadingAvis] = useState(false);
    const [newNote, setNewNote] = useState(5);
    const [newCommentaire, setNewCommentaire] = useState('');
    const [avisError, setAvisError] = useState('');

    // ID de l'utilisateur connecté (Simulé, à lier à ton Context d'authentification)
    const currentUserId = 1;

    // --- CHARGEMENT DES PRESTATIONS ---
    useEffect(() => {
        fetch(`${API_URL}/api/prestations`)
            .then(res => {
                if (!res.ok) throw new Error("Erreur réseau");
                return res.json();
            })
            .then(data => {
                setPrestations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur de chargement:", err);
                setLoading(false);
            });
    }, []);

    // --- CHARGEMENT DES AVIS À L'OUVERTURE DE LA MODAL ---
    useEffect(() => {
        if (selectedPrestation) {
            setLoadingAvis(true);
            fetch(`${API_URL}/api/avis/prestation/${selectedPrestation.id}`)
                .then(res => res.json())
                .then(data => {
                    setAvisList(data);
                    setLoadingAvis(false);
                })
                .catch(err => {
                    console.error("Erreur chargement avis prestation:", err);
                    setLoadingAvis(false);
                });
        }
    }, [selectedPrestation]);

    // --- FERMETURE DE LA MODAL (RESET DES ÉTATS) ---
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPrestation(null);
        setAvisList([]);
        setAvisError('');
        setNewCommentaire('');
        setNewNote(5);
    };

    // --- SOUMISSION D'UN AVIS PRESTATION ---
    const handleAvisSubmit = (e) => {
        e.preventDefault();
        setAvisError('');

        const avisData = {
            numUtilisateur: currentUserId,
            prestation_id: selectedPrestation.id,
            note: newNote,
            commentaire: newCommentaire.trim()
        };

        fetch(`${API_URL}/api/avis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(avisData)
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
            return data;
        })
        .then(() => {
            // Rechargement immédiat de la liste locale des avis
            return fetch(`${API_URL}/api/avis/prestation/${selectedPrestation.id}`);
        })
        .then(res => res.json())
        .then(updatedAvis => {
            setAvisList(updatedAvis);
            setNewCommentaire('');
            setNewNote(5);
        })
        .catch(err => {
            setAvisError(err.message);
        });
    };

    // --- EXTRACTION DE LA VILLE ---
    const extractCity = (address) => {
        if (!address) return '';
        const parts = address.trim().split(' ');
        return parts[parts.length - 1];
    };

    // Génération de la liste des villes pour la Sidebar
    const cities = ['Toutes', ...new Set(
        prestations
            .filter(p => p.type === 'cave' && p.cave_adresse)
            .map(p => extractCity(p.cave_adresse))
    )];

    // --- FILTRAGE ET TRI ---
    const getFilteredPrestations = () => {
        return prestations
            .filter(p => {
                const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = selectedTypes[p.type];
                
                const city = extractCity(p.cave_adresse);
                const matchesCity = selectedCity === 'Toutes' || 
                                   p.type === 'domicile' || 
                                   city === selectedCity;

                return matchesSearch && matchesType && matchesCity;
            })
            .sort((a, b) => sortBy === 'asc' ? a.prix - b.prix : b.prix - a.prix);
    };

    const filteredData = getFilteredPrestations();

    if (loading) return <div className="loading-container"><p>Chargement des dégustations...</p></div>;

    return (
        <section className="prestations-tout">
            <h1>Nos Expériences Oenologiques</h1>

            {/* Barre de recherche */}
            <div className="search-section">
                <TextField
                    placeholder="Rechercher une dégustation (ex: Atelier, Grand Cru...)"
                    fullWidth 
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ bgcolor: 'white', borderRadius: '8px' }}
                />
            </div>

            <div className="produits-layout">
                {/* Sidebar de Filtres */}
                <aside className="filter-sidebar">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                            Filtres
                        </Typography>
                        <Button 
                            size="small" 
                            onClick={() => {
                                setSelectedCity('Toutes');
                                setSelectedTypes({ cave: true, domicile: true });
                                setSortBy('asc');
                                setSearchTerm('');
                            }}
                            sx={{ 
                                color: '#4a0404', 
                                fontSize: '0.75rem',
                                textDecoration: 'underline',
                                '&:hover': { textDecoration: 'none', backgroundColor: 'transparent' }
                            }}
                        >
                            Réinitialiser
                        </Button>
                    </Box>

                    <hr style={{ border: '0.5px solid #eee', marginBottom: '20px' }} />
                    
                    {/* Filtre Ville */}
                    <div className="filter-group">
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <BusinessIcon fontSize="small" /> Villes
                        </Typography>
                        <RadioGroup value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                            {cities.map(city => (
                                <FormControlLabel 
                                    key={city} value={city} 
                                    control={<Radio sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>} 
                                    label={city} 
                                />
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Filtre Type */}
                    <div className="filter-group">
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Format</Typography>
                        <FormControlLabel
                            control={<Checkbox checked={selectedTypes.cave} onChange={() => setSelectedTypes({...selectedTypes, cave: !selectedTypes.cave})} sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>}
                            label="En Cave"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={selectedTypes.domicile} onChange={() => setSelectedTypes({...selectedTypes, domicile: !selectedTypes.domicile})} sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>}
                            label="À Domicile"
                        />
                    </div>

                    {/* Tri Prix */}
                    <div className="filter-group" style={{ borderBottom: 'none' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Trier par prix</Typography>
                        <RadioGroup value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <FormControlLabel value="asc" control={<Radio sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>} label="Croissant" />
                            <FormControlLabel value="desc" control={<Radio sx={{color:'#4a0404', '&.Mui-checked': {color:'#4a0404'}}}/>} label="Décroissant" />
                        </RadioGroup>
                    </div>
                </aside>

                {/* Grille de Cartes */}
                <div className="products-grid-container">
                    {filteredData.length > 0 ? (
                        <div className="wine-cards-wrapper">
                            {filteredData.map(p => (
                                <div key={p.id} className="prestation-card-mui" style={{ position: 'relative' }}>
                                    <div className="card-badge-mui">
                                        {p.type === 'domicile' ? '🏠 Chez vous' : '🍷 En Cave'}
                                    </div>
                                    
                                    <IconButton 
                                        onClick={() => { setSelectedPrestation(p); setIsModalOpen(true); }}
                                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': {bgcolor: 'white'}, zIndex: 2 }}
                                    >
                                        <InfoIcon sx={{ color: '#4a0404' }} />
                                    </IconButton>

                                    <img 
                                        src={p.cover ? `${API_URL}/uploads/${p.cover}` : '/default-experience.jpg'} 
                                        alt={p.nom} 
                                        className="prestation-image-mui"
                                        onClick={() => { setSelectedPrestation(p); setIsModalOpen(true); }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    
                                    <div className="prestation-content-mui">
                                        <h3>{p.nom}</h3>
                                        <p className="prestation-price-mui">{formatPrice(p.prix)}</p>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, color: '#666' }}>
                                            <PlaceIcon fontSize="small" />
                                            <Typography variant="body2" noWrap>
                                                {p.type === 'cave' ? p.cave_nom : 'Partout en France'}
                                            </Typography>
                                        </Box>

                                        <Button 
                                            variant="contained" 
                                            fullWidth
                                            onClick={() => navigate(`/reservation/${p.id}`)}
                                            sx={{ bgcolor: '#4a0404', '&:hover': { bgcolor: '#7a0606' }, textTransform: 'none', borderRadius: '8px' }}
                                        >
                                            Réserver
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Box sx={{ textAlign: 'center', mt: 10, width: '100%' }}>
                            <Typography variant="h6" color="textSecondary">Aucune prestation trouvée.</Typography>
                        </Box>
                    )}
                </div>
            </div>

            {/* MODALE DE DÉTAILS MODIFIÉE AVEC SYSTEME D'AVIS */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#4a0404', color: 'white' }}>
                    <Typography variant="h6"><strong>{selectedPrestation?.nom}</strong></Typography>
                    <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPrestation && (
                        <Box sx={{ p: 1 }}>
                            {/* Infos Générales Prestation */}
                            <img 
                                src={selectedPrestation.cover ? `${API_URL}/uploads/${selectedPrestation.cover}` : '/default-experience.jpg'} 
                                alt="" 
                                style={{ width: '100%', borderRadius: '12px', maxHeight: '280px', objectFit: 'cover', marginBottom: '20px' }} 
                            />
                            <Typography variant="h5" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                                {formatPrice(selectedPrestation.prix)} <span style={{fontSize: '0.9rem', fontWeight: 'normal'}}>/ pers.</span>
                            </Typography>
                            
                            <Typography sx={{ mt: 2, lineHeight: 1.6, color: '#444', fontStyle: 'italic' }}>
                                "{selectedPrestation.description}"
                            </Typography>
                            
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: '8px', mb: 3 }}>
                                <Typography variant="subtitle1"><strong>Informations de lieu :</strong></Typography>
                                <Typography variant="body2">
                                    {selectedPrestation.type === 'cave' 
                                        ? `${selectedPrestation.cave_nom} - ${selectedPrestation.cave_adresse}` 
                                        : "Cette prestation se déroule directement à votre domicile."}
                                </Typography>
                            </Box>

                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large"
                                sx={{ mb: 4, bgcolor: '#4a0404', py: 1.2, '&:hover': { bgcolor: '#7a0606' } }}
                                onClick={() => { handleCloseModal(); navigate(`/reservation/${selectedPrestation.id}`); }}
                            >
                                Choisir une date et réserver
                            </Button>

                            <Divider sx={{ my: 3 }}><Typography variant="button" color="textSecondary">Avis Expériences</Typography></Divider>

                            {/* Section des Avis Existants */}
                            <Box sx={{ mb: 4 }}>
                                {loadingAvis ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                                        <CircularProgress sx={{ color: '#4a0404' }} size={30} />
                                    </Box>
                                ) : avisList.length === 0 ? (
                                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 2 }}>
                                        Aucun avis pour le moment. Partagez votre expérience après votre dégustation !
                                    </Typography>
                                ) : (
                                    avisList.map((av) => (
                                        <Box key={av.id} sx={{ bgcolor: '#fdfbfb', p: 1.5, borderRadius: 2, mb: 2, borderLeft: '4px solid #4a0404', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                                    {av.prenom} {av.nom ? `${av.nom.substring(0, 1)}.` : ''}
                                                </Typography>
                                                <Rating value={av.note} readOnly size="small" />
                                            </Box>
                                            <Typography variant="body2" color="textPrimary">{av.commentaire}</Typography>
                                            {av.created_at && (
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                                                    Le {new Date(av.created_at).toLocaleDateString('fr-FR')}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Formulaire de Dépôt d'Avis */}
                            <Box component="form" onSubmit={handleAvisSubmit} sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#4a0404', mb: 1 }}>
                                    Évaluer cette prestation
                                </Typography>
                                
                                {avisError && (
                                    <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                                        ⚠️ {avisError}
                                    </Typography>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Typography variant="body2">Votre note :</Typography>
                                    <Rating 
                                        name="prestation-rating" 
                                        value={newNote} 
                                        onChange={(event, newValue) => setNewNote(newValue || 5)} 
                                    />
                                </Box>

                                <TextField
                                    label="Votre retour d'expérience..."
                                    multiline
                                    rows={3}
                                    fullWidth
                                    variant="outlined"
                                    value={newCommentaire}
                                    onChange={(e) => setNewCommentaire(e.target.value)}
                                    placeholder="Qu'avez-vous pensé de l'animation, des explications ou de la sélection des bouteilles ?"
                                    sx={{ mb: 2 }}
                                />

                                <Button 
                                    type="submit" 
                                    variant="outlined" 
                                    fullWidth
                                    disabled={!newCommentaire.trim()}
                                    sx={{ color: '#4a0404', borderColor: '#4a0404', '&:hover': { bgcolor: '#fbebeb', borderColor: '#4a0404' }, textTransform: 'none' }}
                                >
                                    Soumettre l'avis
                                </Button>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default Prestations;