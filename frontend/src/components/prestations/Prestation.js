import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Button, TextField, Box, Dialog, DialogContent, 
    DialogTitle, IconButton, Typography, Radio, 
    RadioGroup, FormControlLabel, Checkbox 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import PlaceIcon from '@mui/icons-material/Place';
import BusinessIcon from '@mui/icons-material/Business';
import { CurrencyContext } from '../../context/CurrencyContext';
import '../../styles/Prestations.css';

const Prestations = () => {
    const { formatPrice } = useContext(CurrencyContext);
    const navigate = useNavigate();
    
    // États pour les données
    const [prestations, setPrestations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrestation, setSelectedPrestation] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('asc');
    const [selectedCity, setSelectedCity] = useState('Toutes');
    const [selectedTypes, setSelectedTypes] = useState({
        cave: true,
        domicile: true
    });

    // 1. Chargement des données au montage du composant
    useEffect(() => {
        fetch('http://localhost:3001/api/prestations')
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

    // 2. Logique d'extraction de la ville (basée sur ton format d'adresse SQL)
    const extractCity = (address) => {
        if (!address) return '';
        const parts = address.trim().split(' ');
        return parts[parts.length - 1]; // Prend le dernier mot de l'adresse
    };

    // Génération dynamique de la liste des villes
    const cities = ['Toutes', ...new Set(
        prestations
            .filter(p => p.type === 'cave' && p.cave_adresse)
            .map(p => extractCity(p.cave_adresse))
    )];

    // 3. Logique de filtrage et tri
    const getFilteredPrestations = () => {
        return prestations
            .filter(p => {
                const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = selectedTypes[p.type];
                
                // On garde la prestation si c'est "Toutes", 
                // ou si c'est à domicile (disponible partout), 
                // ou si la ville correspond.
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
                    {/* En-tête avec Titre et bouton RAZ */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 2 
                    }}>
                        <Typography variant="h6" sx={{ color: '#4a0404' }}>
                            Filtres
                        </Typography>
                        
                        <Button 
                            size="small" 
                            onClick={() => {
                                // Ici on réinitialise tous tes états
                                setSelectedCity('Toutes'); // Ou '' selon ta valeur par défaut
                                setSelectedTypes({ cave: true, domicile: true });
                                setSortBy('');
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    <div className="filter-group">
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
                                <div key={p.id} className="prestation-card-mui">
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
                                        src={p.cover ? `http://localhost:3001/uploads/${p.cover}` : '/default-experience.jpg'} 
                                        alt={p.nom} 
                                        className="prestation-image-mui"
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

            {/* Modale de Détails */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#4a0404', color: 'white' }}>
                    <Typography variant="h6"><strong>{selectedPrestation?.nom}</strong></Typography>
                    <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedPrestation && (
                        <Box sx={{ p: 1 }}>
                            <img 
                                src={`http://localhost:3001/uploads/${selectedPrestation.cover}`} 
                                alt="" 
                                style={{ width: '100%', borderRadius: '12px', maxHeight: '300px', objectFit: 'cover', marginBottom: '20px' }} 
                            />
                            <Typography variant="h5" sx={{ color: '#4a0404', fontWeight: 'bold' }}>
                                {formatPrice(selectedPrestation.prix)} <span style={{fontSize: '0.9rem', fontWeight: 'normal'}}>/ pers.</span>
                            </Typography>
                            
                            <Typography sx={{ mt: 2, lineHeight: 1.6, color: '#444' }}>
                                {selectedPrestation.description}
                            </Typography>
                            
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
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
                                sx={{ mt: 4, bgcolor: '#4a0404', py: 1.5 }}
                                onClick={() => navigate(`/reservation/${selectedPrestation.id}`)}
                            >
                                Confirmer et choisir une date
                            </Button>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default Prestations;