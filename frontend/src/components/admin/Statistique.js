import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, Cell 
} from 'recharts';
import { Rating, Box, Typography } from '@mui/material'; // Utilisation de Material-UI pour afficher la note sous forme d'étoiles
import '../../styles/Administrateur.css';

function Statistique() {
    const [dataVentes, setDataVentes] = useState([]);
    const [dataCategories, setDataCategories] = useState([]);
    
    // Nouveaux états pour le Livre d'or
    const [moyenneNotes, setMoyenneNotes] = useState(0);
    const [totalAvis, setTotalAvis] = useState(0);
    const [repartitionNotes, setRepartitionNotes] = useState([]);

    useEffect(() => {
        // 1. Simulation des données existantes (Ventes et Catégories)
        const ventesSimulees = [
            { name: 'Jan', ventes: 4000 },
            { name: 'Fév', ventes: 3000 },
            { name: 'Mar', ventes: 2000 },
            { name: 'Avr', ventes: 2780 },
            { name: 'Mai', ventes: 1890 },
            { name: 'Juin', ventes: 2390 },
        ];
        
        const categoriesSimulees = [
            { name: 'Rouge', value: 400, color: '#4a0404' },
            { name: 'Blanc', value: 300, color: '#f1c40f' },
            { name: 'Rosé', value: 200, color: '#e74c3c' },
            { name: 'Champagne', value: 100, color: '#d4af37' },
        ];

        setDataVentes(ventesSimulees);
        setDataCategories(categoriesSimulees);

        // 2. Récupération et calcul des statistiques du Livre d'or
        fetchLivreDorStats();
    }, []);

    const fetchLivreDorStats = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/livredor');
            if (response.ok) {
                const messages = await response.json();
                
                if (messages.length === 0) return;

                // Calcul de la moyenne
                const somme = messages.reduce((acc, curr) => acc + curr.note_generale, 0);
                const moyenne = somme / messages.length;
                
                setMoyenneNotes(moyenne.toFixed(1)); // Arrondi à 1 chiffre après la virgule
                setTotalAvis(messages.length);

                // Initialisation du compteur pour chaque note (de 1 à 5)
                const compteurs = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                messages.forEach(msg => {
                    if (compteurs[msg.note_generale] !== undefined) {
                        compteurs[msg.note_generale]++;
                    }
                });

                // Formatage des données pour le graphique de répartition Recharts
                const formatRepartition = [
                    { name: '5 ⭐', nombre: compteurs[5] },
                    { name: '4 ⭐', nombre: compteurs[4] },
                    { name: '3 ⭐', nombre: compteurs[3] },
                    { name: '2 ⭐', nombre: compteurs[2] },
                    { name: '1 ⭐', nombre: compteurs[1] },
                ];

                setRepartitionNotes(formatRepartition);
            }
        } catch (err) {
            console.error("Erreur lors du calcul des statistiques du livre d'or :", err);
        }
    };

    return (
        <div className="admin-layout">
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
                <div className="admin-title">
                    <h1 className="stat-title">Tableau de Bord des Ventes & Avis</h1>
                </div>

                {/* NOUVEAU BLOC KPI : Affichage de la Note Moyenne Globale */}
                {totalAvis > 0 && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 4, 
                        backgroundColor: '#f9f6f0', 
                        p: 3, 
                        borderRadius: '12px', 
                        mb: 4,
                        border: '1px solid #4a0404',
                        maxWidth: '500px',
                        mx: 'auto'
                    }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h2" sx={{ fontWeight: 'bold', color: '#4a0404' }}>
                                {moyenneNotes}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                sur 5 étoiles
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Rating value={parseFloat(moyenneNotes)} readOnly precision={0.1} size="large" sx={{ color: '#4a0404', mb: 1 }} />
                            <Typography variant="body1" sx={{ fontWeight: '500', color: '#333' }}>
                                Moyenne de satisfaction ({totalAvis} {totalAvis > 1 ? 'avis' : 'avis'})
                            </Typography>
                        </Box>
                    </Box>
                )}

                <div className="stats-grid">
                    {/* Graphique de l'évolution des ventes */}
                    <div className="stat-card">
                        <h3>Évolution du Chiffre d'Affaires (€)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={dataVentes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="ventes" stroke="#4a0404" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Graphique des ventes par catégorie */}
                    <div className="stat-card">
                        <h3>Répartition par Catégorie</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={dataCategories}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value">
                                        {dataCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* NOUVEAU GRAPHIQUE : Répartition des notes du Livre d'or */}
                    {totalAvis > 0 && (
                        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
                            <h3>Répartition des Notes du Livre d'Or</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={repartitionNotes} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis dataKey="name" type="category" />
                                        <Tooltip />
                                        <Bar dataKey="nombre" fill="#4a0404" radius={[0, 4, 4, 0]}>
                                            {repartitionNotes.map((entry, index) => (
                                                <Cell key={`cell-note-${index}`} fill="#4a0404" opacity={1 - (index * 0.15)} /> 
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Statistique;