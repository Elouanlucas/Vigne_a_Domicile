import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyContext } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Material UI Imports
import {
    Accordion, AccordionSummary, AccordionDetails, Typography,
    Button, TextField, Box, CircularProgress, Tabs, Tab, InputAdornment
} from '@mui/material';

// Icons
import {
    ExpandMore as ExpandMoreIcon, Edit as EditIcon, Map as MapIcon,
    Payment as PaymentIcon, CreditCard as CreditCardIcon, Lock as LockIcon
} from '@mui/icons-material';

import '../styles/paiement.css';

// Configuration Icônes Leaflet pour éviter les bugs d'affichage
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PRIMARY_BORDEAUX = "#4a0404";

function Paiement() {
    const navigate = useNavigate();
    const { formatPrice } = useContext(CurrencyContext);
    const { panierItems, setPanierItems } = useCart();

    // États globaux
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState('panel1');
    const [paymentMethod, setPaymentMethod] = useState(0);

    // États Formulaire Profil
    const [userData, setUserData] = useState(null);
    const [editForm, setEditForm] = useState({
        nom: '', prenom: '', email: '', telephone: '', adresseDeLivraison: ''
    });

    // États Code Promo
    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [promoApplied, setPromoApplied] = useState(null);
    const [discountPercentage, setDiscountPercentage] = useState(0);

    // États Carte Bancaire
    const [cardInfos, setCardInfos] = useState({
        number: '', expiry: '', cvv: ''
    });

    // =====================================================
    // LOGIQUE DE CALCUL (Optimisée avec useMemo)
    // =====================================================
    const getEffectivePrice = (item) => {
        return (!item.isPrestation && item.promotion_percentage > 0)
            ? item.price * (1 - item.promotion_percentage / 100)
            : item.price;
    };

    const totals = useMemo(() => {
        const baseTotal = panierItems.reduce((sum, item) => sum + (getEffectivePrice(item) * item.quantity), 0);
        const discount = baseTotal * (discountPercentage / 100);
        return {
            base: baseTotal,
            discount: discount,
            final: baseTotal - discount
        };
    }, [panierItems, discountPercentage]);

    // =====================================================
    // APPELS API & HANDLERS
    // =====================================================

    // Chargement du profil au montage
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!savedUser || !token) {
            navigate('/connexion');
            return;
        }

        fetch(`http://localhost:3001/api/user/profile/${savedUser.login}`, {
            headers: { 'Authorization': `Bearer ${token}` }
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
        .catch(() => setLoading(false));
    }, [navigate]);

    // Validation Code Promo
    const handleValidatePromoCode = async () => {
        if (!promoCode.trim()) return setPromoError('Veuillez entrer un code');
        setPromoLoading(true);
        setPromoError('');

        try {
            const res = await fetch('http://localhost:3001/api/promo/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode.trim().toUpperCase() })
            });
            const data = await res.json();

            if (res.ok && data.valid) {
                setPromoApplied(promoCode.trim().toUpperCase());
                setDiscountPercentage(parseFloat(data.discountPercentage) || 0);
            } else {
                setPromoError(data.message || 'Code invalide');
            }
        } catch (err) {
            setPromoError('Erreur de connexion au serveur');
        } finally {
            setPromoLoading(false);
        }
    };

    // Gestion saisie numérique carte
    const handleCardInput = (e, field, maxLength) => {
        const val = e.target.value.replace(/\D/g, ''); // Garde uniquement les chiffres
        if (val.length <= maxLength) {
            setCardInfos(prev => ({ ...prev, [field]: val }));
        }
    };

    // Finalisation
    const handleFinaliserCommande = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const commande = {
            numUtilisateur: parseInt(userId),
            total_price: totals.final,
            promo_code: promoApplied,
            items: panierItems.map(item => ({
                [item.isPrestation ? 'id_prestation' : 'id_vin']: (item.isPrestation && typeof item.id === 'string') ? item.id.split('-')[1] : item.id,
                quantity: item.quantity,
                unit_price: getEffectivePrice(item),
                isPrestation: !!item.isPrestation,
                ...(item.isPrestation && { date: item.details?.date || item.date, address: editForm.adresseDeLivraison })
            }))
        };

        try {
            const response = await fetch('http://localhost:3001/api/orders/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(commande)
            });

            if (response.ok) {
                alert("Merci ! Commande validée.");
                setPanierItems([]);
                navigate('/');
            } else {
                const err = await response.json();
                alert("Erreur : " + err.message);
            }
        } catch (err) {
            alert("Erreur réseau");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: PRIMARY_BORDEAUX }} /></Box>;

    return (
        <div className="page-container">
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: PRIMARY_BORDEAUX }}>Finaliser ma commande</Typography>

            {/* RÉCAPITULATIF RAPIDE */}
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff', borderRadius: '12px', border: '1px solid #ddd' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>Votre Panier</Typography>
                {panierItems.map(item => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">{item.name} x{item.quantity}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatPrice(getEffectivePrice(item) * item.quantity)}</Typography>
                    </Box>
                ))}
            </Box>

            {/* ACCORDÉONS DE COMMANDE */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                
                {/* 1. INFORMATIONS */}
                <Accordion expanded={expanded === 'panel1'} onChange={() => setExpanded(expanded === 'panel1' ? '' : 'panel1')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><EditIcon sx={{ mr: 1 }} /> Vos Coordonnées</AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField label="Prénom" value={editForm.prenom} onChange={(e) => setEditForm({...editForm, prenom: e.target.value})} />
                            <TextField label="Nom" value={editForm.nom} onChange={(e) => setEditForm({...editForm, nom: e.target.value})} />
                            <TextField label="Email" fullWidth sx={{ gridColumn: 'span 2' }} value={editForm.email} disabled />
                            <Button variant="contained" fullWidth sx={{ gridColumn: 'span 2', bgcolor: PRIMARY_BORDEAUX }} onClick={() => setExpanded('panel2')}>Continuer</Button>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* 2. ADRESSE & MAP */}
                <Accordion expanded={expanded === 'panel2'} onChange={() => setExpanded(expanded === 'panel2' ? '' : 'panel2')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><MapIcon sx={{ mr: 1 }} /> Livraison</AccordionSummary>
                    <AccordionDetails>
                        <TextField fullWidth multiline rows={2} label="Adresse" value={editForm.adresseDeLivraison} onChange={(e) => setEditForm({...editForm, adresseDeLivraison: e.target.value})} sx={{ mb: 2 }} />
                        <Box sx={{ height: '200px', mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
                            <MapContainer center={[48.8566, 2.3522]} zoom={12} style={{ height: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[48.8566, 2.3522]} />
                            </MapContainer>
                        </Box>
                        <Button variant="contained" fullWidth sx={{ bgcolor: PRIMARY_BORDEAUX }} onClick={() => setExpanded('panel3')}>Valider l'adresse</Button>
                    </AccordionDetails>
                </Accordion>

                {/* 3. CODE PROMO */}
                <Accordion expanded={expanded === 'panel3'} onChange={() => setExpanded(expanded === 'panel3' ? '' : 'panel3')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><PaymentIcon sx={{ mr: 1 }} /> Code Promo</AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Code" fullWidth value={promoCode} disabled={!!promoApplied} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} />
                            <Button variant="outlined" onClick={promoApplied ? () => {setPromoApplied(null); setDiscountPercentage(0)} : handleValidatePromoCode}>
                                {promoLoading ? <CircularProgress size={20} /> : (promoApplied ? "Retirer" : "Appliquer")}
                            </Button>
                        </Box>
                        {promoError && <Typography color="error" variant="caption">{promoError}</Typography>}
                        {promoApplied && <Typography color="success.main" variant="caption">✓ Code appliqué !</Typography>}
                        <Button variant="contained" fullWidth sx={{ mt: 2, bgcolor: PRIMARY_BORDEAUX }} onClick={() => setExpanded('panel4')}>Aller au paiement</Button>
                    </AccordionDetails>
                </Accordion>

                {/* 4. PAIEMENT FINAL */}
                <Accordion expanded={expanded === 'panel4'} onChange={() => setExpanded(expanded === 'panel4' ? '' : 'panel4')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}><LockIcon sx={{ mr: 1 }} /> Paiement</AccordionSummary>
                    <AccordionDetails>
                        <Tabs value={paymentMethod} onChange={(e, v) => setPaymentMethod(v)} centered sx={{ mb: 2 }}>
                            <Tab label="Carte Bancaire" />
                            <Tab label="PayPal" />
                        </Tabs>

                        {paymentMethod === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                                <TextField label="Numéro de carte" value={cardInfos.number} onChange={(e) => handleCardInput(e, 'number', 16)} inputProps={{ inputMode: 'numeric' }} />
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                    <TextField label="MM/AA" value={cardInfos.expiry} onChange={(e) => handleCardInput(e, 'expiry', 4)} />
                                    <TextField label="CVV" type="password" value={cardInfos.cvv} onChange={(e) => handleCardInput(e, 'cvv', 3)} />
                                </Box>
                            </Box>
                        )}

                        <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: '8px', mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography>Sous-total</Typography><Typography>{formatPrice(totals.base)}</Typography></Box>
                            {discountPercentage > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'orange' }}><Typography>Réduction</Typography><Typography>-{formatPrice(totals.discount)}</Typography></Box>}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #ddd' }}><Typography variant="h6">Total</Typography><Typography variant="h6" color={PRIMARY_BORDEAUX}>{formatPrice(totals.final)}</Typography></Box>
                        </Box>

                        <Button variant="contained" fullWidth size="large" onClick={handleFinaliserCommande} disabled={paymentMethod === 0 && cardInfos.number.length < 16} sx={{ bgcolor: PRIMARY_BORDEAUX }}>
                            Payer {formatPrice(totals.final)}
                        </Button>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </div>
    );
}

export default Paiement;