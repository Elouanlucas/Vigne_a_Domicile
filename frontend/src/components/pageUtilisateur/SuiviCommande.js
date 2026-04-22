import React, { useState, useEffect } from 'react';
import '../../styles/SuiviCommande.css';

function SuiviCommande({ user }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    // État pour savoir quelle commande est "déroulée" (on stocke son ID)
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const idToUse = user?.numUtilisateur || user?.id;
        if (idToUse) {
            fetchOrders(idToUse);
        } else {
            setLoading(false);
        }
    }, [user]);

    const toggleOrder = (orderId) => {
        // Si on clique sur la même, on ferme. Sinon, on ouvre la nouvelle.
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const fetchOrders = async (userId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`http://localhost:3001/api/orders/active/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Erreur fetch:", error);
        } finally {
            setLoading(false); 
        }
    };

    if (loading) return <div className="loading">Chargement de vos colis...</div>;

    return (
        <div className="suivi-container">
            <h2>📦 Suivi de mes colis</h2>
            {orders.length === 0 ? (
                <p className="no-orders">Vous n'avez aucun colis en cours.</p>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''}`}>
                            <div className="order-header" onClick={() => toggleOrder(order.id)} style={{cursor: 'pointer'}}>
                                <div>
                                    <span className="order-id-label">Commande #ID-{order.id}</span>
                                    <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <span className="arrow-icon">{expandedOrderId === order.id ? '▲' : '▼'}</span>
                            </div>
                            
                            {/* Toujours afficher le stepper */}
                            <div className="status-stepper">
                                <div className="step completed"><div className="circle">1</div><p>Attente</p></div>
                                <div className={`line ${order.status === 'en_cours' ? 'active' : ''}`}></div>
                                <div className={`step ${order.status === 'en_cours' ? 'active' : ''}`}><div className="circle">2</div><p>Envoi</p></div>
                                <div className="line"></div>
                                <div className="step"><div className="circle">3</div><p>Livré</p></div>
                            </div>

                            {/* CONTENU DÉROULANT (S'affiche seulement si expandedOrderId === order.id) */}
                            {expandedOrderId === order.id && (
                                <div className="order-details-dropdown">
                                    <h4>Détails des articles :</h4>
                                    <ul className="articles-list-items">
                                        {order.articles ? order.articles.split(', ').map((item, index) => (
                                            <li key={index}>{item}</li>
                                        )) : <li>Détails indisponibles</li>}
                                    </ul>
                                </div>
                            )}

                            <div className="order-footer">
                                <strong>Total : {parseFloat(order.total_price).toFixed(2)}€</strong>
                                <button className="btn-toggle" onClick={() => toggleOrder(order.id)}>
                                    {expandedOrderId === order.id ? 'Masquer détails' : 'Voir détails'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SuiviCommande;