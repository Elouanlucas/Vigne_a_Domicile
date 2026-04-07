import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import pour la redirection
import '../styles/Utilisateur.css';

function UserPage() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token'); // Récupère le token

        if (!savedUser || !token) {
            navigate('/connexion');
            return;
        }

        fetch(`http://localhost:3001/api/user/${savedUser.login}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // <--- ENVOI DU TOKEN
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                handleLogout(); // Déconnexion si le token est expiré
            }
            return res.json();
        })
        .then(data => setUserData(data))
        .catch(err => console.error("Erreur:", err));
    }, [navigate]);

    // Dans handleLogout, pense à supprimer le token aussi :
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // <--- NETTOYAGE
        navigate('/connexion');
    };

    if (!userData) return <div className="connexion-container">Chargement...</div>;

    return (
        <div className="connexion-container">
            <div className="connexion-form">
                <h2>Mon Profil</h2>
                <div className="user-info-display">
                    <p><strong>Nom :</strong> {userData.nom}</p>
                    <p><strong>Prénom :</strong> {userData.prenom}</p>
                    <p><strong>Login :</strong> {userData.login}</p>
                    <p><strong>Email :</strong> {userData.email}</p>
                    <p><strong>Téléphone :</strong> {userData.telephone}</p>
                    <p><strong>Date de naissance :</strong> {new Date(userData.dateDeNaissance).toLocaleDateString()}</p>
                    <p><strong>Rôle :</strong> {userData.role}</p>
                </div>
                
                {/* Bouton de déconnexion */}
                <button 
                    onClick={handleLogout} 
                    className="submit-btn" 
                    style={{ marginTop: '20px', backgroundColor: 'var(--primary-color)' }}
                >
                    Se déconnecter
                </button>
            </div>
        </div>
    );
}

export default UserPage;