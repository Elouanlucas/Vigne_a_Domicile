import React, { useState, useEffect } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import '../../styles/Administrateur.css';

function Statistique() {
    const [dataVentes, setDataVentes] = useState([]);
    const [dataCategories, setDataCategories] = useState([]);

    useEffect(() => {
        // Simulation de données - À remplacer plus tard par tes appels API (fetch)
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
    }, []);

    return (
        <div className="admin-layout">
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
                <div className="admin-title">
                    <h1 className="stat-title">Tableau de Bord des Ventes</h1>
                </div>

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
                </div>
            </div>
        </div>
    );
}

export default Statistique;