import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyContext } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext'; 
import '../styles/paiement.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { 
    Accordion, AccordionSummary, AccordionDetails, 
    Typography, Button, TextField, Box, CircularProgress,
    Tabs, Tab, InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import MapIcon from '@mui/icons-material/Map';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';

// Config icône Leaflet
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function Paiement() {
    const navigate = useNavigate();
    const { formatPrice } = useContext(CurrencyContext);
    const { panierItems, setPanierItems } = useCart(); 
    
    const [userData, setUserData] = useState(null);
    const [editForm, setEditForm] = useState({
        nom: '', prenom: '', email: '', telephone: '', adresseDeLivraison: ''
    });
    const [expanded, setExpanded] = useState('panel1');
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(0);

    const primaryBordeaux = "#4a0404";

    // --- CALCUL DU TOTAL RÉEL ---
    const total = panierItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!savedUser || !token) { navigate('/connexion'); return; }

        fetch(`http://localhost:3001/api/user/profile/${savedUser.login}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            setUserData(data);
            setEditForm({
                nom: data.nom || '',
                prenom: data.prenom || '',
                email: data.email || '',
                telephone: data.telephone || '',
                adresseDeLivraison: data.adresseDeLivraison || ''
            });
            setLoading(false);
        })
        .catch(err => {
            console.error("Erreur profil:", err);
            setLoading(false);
        });
    }, [navigate]);

    const handleUpdateInfo = async () => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:3001/api/user/update-profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: userData.login, ...editForm })
            });
            setExpanded('panel2'); 
        } catch (error) {
            console.error("Erreur sauvegarde:", error);
        }
    };

    const handleFinaliserCommande = async () => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
            alert("Session expirée. Veuillez vous reconnecter.");
            navigate('/connexion');
            return;
        }

        const commande = {
            numUtilisateur: parseInt(userId),
            total_price: total,
            items: panierItems.map(item => ({
                id_vin: item.id,
                quantity: item.quantity,
                unit_price: item.price
            }))
        };

        try {
            const response = await fetch('http://localhost:3001/api/orders/validate', { // Chemin mis à jour
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(commande),
            });

            if (response.ok) {
                alert("Merci ! Votre commande a été enregistrée dans la base de données.");
                setPanierItems([]); 
                navigate('/'); 
            } else {
                alert("Erreur lors de la validation.");
            }
        } catch (error) {
            console.error(error);
        }
        
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress sx={{ color: primaryBordeaux }} />
        </Box>
    );

    return (
        <div className="page-container">
            <h1>Finaliser ma commande</h1>

            {/* 1. INFORMATIONS */}
            <Accordion expanded={expanded === 'panel1'} onChange={() => setExpanded(expanded === 'panel1' ? false : 'panel1')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: primaryBordeaux }} />}>
                    <Typography sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <EditIcon sx={{ mr: 1, color: primaryBordeaux }} /> 1. Vos Informations
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField label="Prénom" value={editForm.prenom} onChange={(e) => setEditForm({...editForm, prenom: e.target.value})} />
                        <TextField label="Nom" value={editForm.nom} onChange={(e) => setEditForm({...editForm, nom: e.target.value})} />
                        <TextField label="Email" fullWidth sx={{ gridColumn: { sm: 'span 2' } }} value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                        <Button variant="contained" sx={{ gridColumn: { sm: 'span 2' }, mt: 2, bgcolor: primaryBordeaux }} onClick={handleUpdateInfo}>Confirmer et continuer</Button>
                    </Box>
                </AccordionDetails>
            </Accordion>

            {/* 2. ADRESSE */}
            <Accordion expanded={expanded === 'panel2'} onChange={() => setExpanded(expanded === 'panel2' ? false : 'panel2')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: primaryBordeaux }} />}>
                    <Typography sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <MapIcon sx={{ mr: 1, color: primaryBordeaux }} /> 2. Adresse de livraison
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <TextField fullWidth label="Adresse" multiline rows={2} value={editForm.adresseDeLivraison} onChange={(e) => setEditForm({...editForm, adresseDeLivraison: e.target.value})} sx={{ mb: 3 }} />
                    <Box sx={{ height: '250px', width: '100%', mb: 3, borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
                        <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[48.8566, 2.3522]}><Popup>Livraison ici</Popup></Marker>
                        </MapContainer>
                    </Box>
                    <Button variant="contained" fullWidth sx={{ bgcolor: primaryBordeaux }} onClick={() => setExpanded('panel3')}>Valider l'adresse</Button>
                </AccordionDetails>
            </Accordion>

            {/* 3. PAIEMENT RÉEL */}
            <Accordion expanded={expanded === 'panel3'} onChange={() => setExpanded(expanded === 'panel3' ? false : 'panel3')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: primaryBordeaux }} />}>
                    <Typography sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                        <PaymentIcon sx={{ mr: 1, color: primaryBordeaux }} /> 3. Paiement Sécurisé
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ width: '100%', mb: 3 }}>
                        <Tabs 
                            value={paymentMethod} 
                            onChange={(e, v) => setPaymentMethod(v)} 
                            centered 
                            TabIndicatorProps={{ style: { background: primaryBordeaux } }}
                        >
                            <Tab icon={<CreditCardIcon />} label="Carte" />
                            <Tab label={<span style={{ fontWeight: 'bold', color: '#003087' }}>PayPal</span>} />
                        </Tabs>
                    </Box>

                    {paymentMethod === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField fullWidth label="Numéro de carte" placeholder="0000 0000 0000 0000" InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon /></InputAdornment> }} />
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <TextField label="MM/AA" />
                                <TextField label="CVV" type="password" />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f9f9f9', borderRadius: '8px' }}>
                            <Button variant="contained" sx={{ bgcolor: '#FFB113', color: '#003087' }}>Payer avec PayPal</Button>
                        </Box>
                    )}
                    
                    <Box sx={{ mt: 4, p: 3, borderTop: '2px solid #eee' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="textSecondary">Sous-total :</Typography>
                            <Typography>{formatPrice(total)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography color="textSecondary">Frais de livraison :</Typography>
                            <Typography sx={{ color: 'green' }}>Gratuit</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                             <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total à régler :</Typography>
                             <Typography variant="h5" sx={{ fontWeight: 'bold', color: primaryBordeaux }}>
                                {formatPrice(total)}
                            </Typography>
                        </Box>
                        
                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large"
                            startIcon={<LockIcon />}
                            sx={{ py: 1.5, fontSize: '1.1rem', backgroundColor: primaryBordeaux }}
                            onClick={handleFinaliserCommande}
                            disabled={panierItems.length === 0}
                        >
                            Payer en toute sécurité
                        </Button>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}

export default Paiement;