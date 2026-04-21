import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Import du hook panier
import '../styles/Connexion.css';

function Connexion() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { setPanierItems } = useCart(); // Récupération de la fonction de mise à jour

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, motDePasse: password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Stockage des infos de session
                // Attention : vérifie si ta BDD utilise 'numUtilisateur' ou 'id_utilisateur'
                const userId = data.user.id_utilisateur || data.user.numUtilisateur;
                
                localStorage.setItem('userId', userId);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('token', data.token);

                // 2. RÉCUPÉRATION DU PANIER ENREGISTRÉ
                try {
                    // On ajoute le header Authorization pour passer le verifyToken
                    const cartResponse = await fetch(`http://localhost:3001/api/orders/recuperer/${userId}`, {
                        method: 'GET',
                        headers: { 
                            'Authorization': `Bearer ${data.token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (cartResponse.ok) {
                        const savedItems = await cartResponse.json();
                        if (savedItems.length > 0) {
                            setPanierItems(savedItems);
                        }
                    }
                } catch (cartError) {
                    console.error("Erreur lors de la récupération du panier:", cartError);
                }

                navigate('/');
            } else {
                alert("Erreur : " + data.message);
            }
        } catch (error) {
            console.error("Erreur connexion:", error);
        }
    };

    return (
        <div className="connexion-container">
            <div className="connexion-form">
                <h2>Connexion</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="login">Login</label>
                        <input
                            type="text"
                            id="login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Se connecter</button>
                </form>
                <p className="inscription-link">
                    Pas de compte ? <a href="/inscription">Inscrivez-vous ici</a>
                </p>
            </div>
        </div>
    );
}

export default Connexion;