import React, { useState, useEffect } from 'react';
import '../../styles/SuiviCommande.css'; // On réutilise les styles pour les détails déroulants

function Commande() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // États pour les filtres
    const [filterId, setFilterId] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchAllOrders();
    }, []);

    // Logique de filtrage
    useEffect(() => {
        let tempOrders = orders;
        if (filterId) {
            tempOrders = tempOrders.filter(o => o.id.toString().includes(filterId));
        }
        if (filterStatus) {
            tempOrders = tempOrders.filter(o => o.status === filterStatus);
        }
        setFilteredOrders(tempOrders);
    }, [filterId, filterStatus, orders]);

    const fetchAllOrders = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/orders/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
                setFilteredOrders(data);
            }
        } catch (error) {
            console.error("Erreur admin orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3001/api/orders/admin/status', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ orderId, newStatus })
            });
            if (response.ok) {
                // Update local state pour éviter un re-fetch complet
                setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
            }
        } catch (error) {
            alert("Erreur lors du changement de statut");
        }
    };

    if (loading) return <div className="loading">Chargement du tableau de bord...</div>;

    return (
        <div className="admin-orders-container">
            <h2 className="admin-title">🛠 Gestion des Commandes</h2>

            {/* --- SECTION FILTRES --- */}
            <div className="filters-bar">
                <input 
                    type="text" 
                    placeholder="Rechercher par N° Commande..." 
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="filter-input"
                />
                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Tous les statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="en_cours">En cours / Envoi</option>
                    <option value="terminee">Livré / Terminé</option>
                </select>
            </div>

            {/* --- LISTE DES COMMANDES --- */}
            <div className="orders-list">
                {filteredOrders.map(order => (
                    <div key={order.id} className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''}`}>
                        <div className="order-header admin-header">
                            <div>
                                <strong>#{order.id}</strong> - {order.prenom} {order.nom}
                                <span className={`status-tag ${order.status}`}>{order.status}</span>
                            </div>
                            <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>

                        <div className="admin-actions">
                            <label>Changer le statut : </label>
                            <select 
                                value={order.status} 
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="status-updater"
                            >
                                <option value="en_attente">En attente</option>
                                <option value="en_cours">En cours</option>
                                <option value="terminee">Terminée</option>
                            </select>
                            
                            <button 
                                className="btn-toggle" 
                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            >
                                {expandedOrderId === order.id ? 'Masquer détails' : 'Voir détails'}
                            </button>
                        </div>

                        {/* Détails déroulants */}
                        {expandedOrderId === order.id && (
                            <div className="order-details-dropdown admin-dropdown">
                                <h4>Contenu de la commande :</h4>
                                <ul className="articles-list-items">
                                    {order.articles ? order.articles.split(', ').map((art, i) => (
                                        <li key={i}>{art}</li>
                                    )) : <li>Aucun article trouvé</li>}
                                </ul>
                                <div className="total-admin">Total: {parseFloat(order.total_price).toFixed(2)}€</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Commande;