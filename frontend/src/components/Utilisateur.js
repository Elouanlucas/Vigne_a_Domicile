import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Utilisateur.css';

function UserPage() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newAddress, setNewAddress] = useState('');
    const navigate = useNavigate();
    const { handleToutRetirer } = useCart();

    useEffect(() => {
        fetchUserInfo();
    }, [navigate]);

    const fetchUserInfo = () => {
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
            if (res.status === 401 || res.status === 403) handleLogout();
            return res.json();
        })
        .then(data => {
            setUserData(data);
            setNewAddress(data.adresseDeLivraison || '');
        })
        .catch(err => console.error("Erreur:", err));
    };

    // --- FONCTION MAGIQUE POUR LE BLOB ---
    const renderPhoto = (photoData) => {
        if (!photoData) return '/default-avatar.png';

        // Gestion du Buffer MySQL
        if (photoData.type === 'Buffer' || photoData.data) {
            const dataArray = photoData.data || photoData;
            const blob = new Blob([new Uint8Array(dataArray)], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
        }

        return '/default-avatar.png';
    };

    const handleLogout = () => {
        handleToutRetirer(null);
        localStorage.clear();
        navigate('/connexion');
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);
        formData.append('login', userData.login);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/user/update-photo`, {
                method: 'POST',
                headers: { 
                    // SURTOUT PAS de 'Content-Type' ici !
                    'Authorization': `Bearer ${token}` 
                },
                body: formData // Le navigateur s'occupe du reste
            });
            
            if (response.ok) {
                fetchUserInfo(); // Rafraîchit les données
            } else {
                const errorData = await response.json();
                console.error("Détails erreur serveur:", errorData);
            }
        } catch (error) {
            console.error("Erreur réseau photo:", error);
        }
    };

    const handleUpdateAddress = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3001/api/user/update-address`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login: userData.login, adresse: newAddress })
            });
            if (response.ok) {
                setIsEditing(false);
                fetchUserInfo();
            }
        } catch (error) {
            console.error("Erreur adresse:", error);
        }
    };

    if (!userData) return <div className="loading-screen">Chargement du profil...</div>;

    return (
        <div className="profile-page-container">
            <header className="profile-header">
                <h1>Mon Espace Personnel</h1>
                <p>Gérez vos informations et vos préférences de livraison</p>
            </header>

            <div className="profile-grid">
                <aside className="profile-sidebar">
                    <div className="photo-card">
                        <div className="avatar-wrapper">
                            <img 
                                src={renderPhoto(userData.photo)} 
                                alt="Profil" 
                                className="main-profile-img"
                            />
                            <label htmlFor="upload-photo" className="upload-badge" title="Changer la photo">
                                Modifier la photo
                            </label>
                            <input type="file" id="upload-photo" hidden onChange={handlePhotoChange} accept="image/*" />
                        </div>
                        <h3>{userData.prenom} {userData.nom}</h3>
                        <span className="user-role-badge">{userData.role || 'Client'}</span>
                    </div>

                    <button onClick={handleLogout} className="btn-logout-full">
                        Déconnexion
                    </button>
                </aside>

                <main className="profile-main-content">
                    <section className="info-group">
                        <h3>Informations Personnelles</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Prénom</label>
                                <p>{userData.prenom}</p>
                            </div>
                            <div className="info-item">
                                <label>Nom</label>
                                <p>{userData.nom}</p>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <p>{userData.email}</p>
                            </div>
                            <div className="info-item">
                                <label>Téléphone</label>
                                <p>{userData.telephone || 'Non renseigné'}</p>
                            </div>
                        </div>
                    </section>

                    <section className="info-group">
                        <h3>Adresse de Livraison</h3>
                        <div className="address-box">
                            {isEditing ? (
                                <div className="address-edit-mode">
                                    <textarea 
                                        value={newAddress} 
                                        onChange={(e) => setNewAddress(e.target.value)}
                                        placeholder="Entrez votre adresse complète..."
                                    />
                                    <div className="address-actions">
                                        <button onClick={handleUpdateAddress} className="btn-save">Enregistrer</button>
                                        <button onClick={() => setIsEditing(false)} className="btn-cancel">Annuler</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="address-view-mode">
                                    <p>{userData.adresseDeLivraison || "Vous n'avez pas encore enregistré d'adresse."}</p>
                                    <button onClick={() => setIsEditing(true)} className="btn-text-edit">
                                        Modifier l'adresse
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default UserPage;