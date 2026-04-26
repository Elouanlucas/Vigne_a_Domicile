import React, { useState, useEffect, useContext } from 'react';
import '../../styles/SuiviCommande.css';

// Import du Context pour la devise
import { CurrencyContext } from '../../context/CurrencyContext';

function HistoriqueCommande({ user }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Récupération de la fonction de formatage
    const { formatPrice } = useContext(CurrencyContext);

    useEffect(() => {
        const idToUse = user?.numUtilisateur || user?.id;
        if (idToUse) {
            fetchHistory(idToUse);
        } else {
            setLoading(false);
        }
    }, [user]);

    const toggleOrder = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const fetchHistory = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/orders/history/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Erreur historique:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Chargement de votre historique...</div>;

    return (
        <div className="suivi-container">
            <h2>📜 Mon Historique de Commande</h2>
            {orders.length === 0 ? (
                <p className="no-orders">Vous n'avez pas encore de commandes terminées.</p>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className={`order-card history-card ${expandedOrderId === order.id ? 'expanded' : ''}`}>
                            
                            <div className="order-header" onClick={() => toggleOrder(order.id)} style={{cursor: 'pointer'}}>
                                <div>
                                    <span>Commande #ID-{order.id}</span>
                                    <span className="status-badge-completed">Livré</span>
                                </div>
                                <div>
                                    <span className="order-date">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="arrow-icon" style={{marginLeft: '10px'}}>
                                        {expandedOrderId === order.id ? '▲' : '▼'}
                                    </span>
                                </div>
                            </div>

                            <div className="order-details-simple">
                                <p>Statut : <strong>Terminé</strong></p>
                                <p>Reçu le : {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>

                            {expandedOrderId === order.id && (
                                <div className="order-details-dropdown">
                                    <h4>Articles achetés :</h4>
                                    <ul className="articles-list-items">
                                        {order.articles ? order.articles.split(', ').map((item, index) => (
                                            <li key={index}>{item}</li>
                                        )) : <li>Détails indisponibles</li>}
                                    </ul>
                                </div>
                            )}

                            <div className="order-footer">
                                {/* Correction : Utilisation de formatPrice pour gérer les devises */}
                                <strong>Montant réglé : {formatPrice(order.total_price)}</strong>
                                <button className="btn-toggle" onClick={() => toggleOrder(order.id)}>
                                    {expandedOrderId === order.id ? 'Masquer détails' : 'Détails de la commande'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HistoriqueCommande;