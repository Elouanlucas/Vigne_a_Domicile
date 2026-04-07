import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importer le hook
import '../styles/Connexion.css'; // Assuming we'll create this CSS file

function Connexion() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, motDePasse: password }), // On envoie login + password
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
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
