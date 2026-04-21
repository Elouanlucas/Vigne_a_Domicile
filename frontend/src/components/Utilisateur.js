import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // 1. Vérifie bien cet import !
import '../styles/Utilisateur.css';

function UserPage() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    
    // 2. APPEL DU HOOK ICI (au début du composant, pas dans le useEffect)
    const { handleToutRetirer } = useCart(); 

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');

        if (!savedUser || !token) {
            navigate('/connexion');
            return;
        }

        fetch(`http://localhost:3001/api/user/${savedUser.login}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                handleLogout(); 
            }
            return res.json();
        })
        .then(data => setUserData(data))
        .catch(err => console.error("Erreur:", err));
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]); 

    const handleLogout = () => {
        // 3. Maintenant handleToutRetirer est bien accessible ici
        handleToutRetirer(null);
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
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
                
                <button 
                    onClick={handleLogout} 
                    className="submit-btn" 
                    style={{ marginTop: '20px', backgroundColor: '#4a0404' }}
                >
                    Se déconnecter
                </button>
            </div>
        </div>
    );
}

export default UserPage;