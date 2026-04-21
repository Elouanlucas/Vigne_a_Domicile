import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Utilisateur.css';

function UserPage() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        nom: '', prenom: '', email: '', telephone: '', adresseDeLivraison: ''
    });

    const navigate = useNavigate();
    const { handleToutRetirer } = useCart();

    useEffect(() => {
        fetchUserInfo();
    }, [navigate]);

    const fetchUserInfo = () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!savedUser || !token) { navigate('/connexion'); return; }

        fetch(`http://localhost:3001/api/user/profile/${savedUser.login}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(data => {
            setUserData(data);
            setEditForm({
                nom: data.nom || '',
                prenom: data.prenom || '',
                email: data.email || '',
                telephone: data.telephone || '',
                adresseDeLivraison: data.adresseDeLivraison || ''
            });
        })
        .catch(err => console.error("Erreur récupération profil:", err));
    };

    const handleLogout = () => {
        handleToutRetirer(null);
        localStorage.clear();
        navigate('/connexion');
    };

    const handleSaveAll = async () => {
        const token = localStorage.getItem('token');
        try {
            const resProfile = await fetch(`http://localhost:3001/api/user/update-profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: userData.login, ...editForm, adresse: undefined })
            });

            const resAddress = await fetch(`http://localhost:3001/api/user/update-address`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: userData.login, adresse: editForm.adresseDeLivraison })
            });

            if (resProfile.ok && resAddress.ok) {
                setIsEditing(false);
                fetchUserInfo();
                alert("Modifications enregistrées !");
            }
        } catch (error) { console.error("Erreur sauvegarde:", error); }
    };

    const handleDeleteUser = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:3001/api/user/delete/${userData.login}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    localStorage.clear();
                    navigate('/inscription');
                }
            } catch (error) { console.error("Erreur suppression:", error); }
        }
    };

    if (!userData) return <div className="loading-screen">Chargement...</div>;

    return (
        <div className="profile-page-container">
            <header className="profile-header">
                <div className="header-top-row">
                    <h1>Mon Espace Personnel</h1>
                    <button onClick={handleLogout} className="btn-logout-top">Déconnexion</button>
                </div>
            </header>

            <div className="profile-grid">
                <aside className="profile-sidebar">
                    <div className="photo-card">
                        <img 
                            src={userData.photo ? URL.createObjectURL(new Blob([new Uint8Array(userData.photo.data)])) : '/default-avatar.png'} 
                            alt="Profil" 
                            className="main-profile-img" 
                        />
                        <label htmlFor="upload-photo" className="upload-badge">Changer la photo</label>
                        <input type="file" id="upload-photo" hidden accept="image/*" />
                        <h3>{userData.prenom} {userData.nom}</h3>
                        <p className="role-text">{userData.role}</p>
                    </div>
                </aside>

                <main className="profile-main-content">
                    <section className="info-group">
                        <h3>Détails du compte</h3>
                        <div className="info-grid">
                            {[
                                { label: 'Prénom', key: 'prenom' },
                                { label: 'Nom', key: 'nom' },
                                { label: 'Email', key: 'email' },
                                { label: 'Téléphone', key: 'telephone' }
                            ].map((field) => (
                                <div className="info-item" key={field.key}>
                                    <label>{field.label}</label>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            className="edit-input" 
                                            value={editForm[field.key]} 
                                            onChange={(e) => setEditForm({...editForm, [field.key]: e.target.value})} 
                                        />
                                    ) : ( <p>{userData[field.key] || 'Non renseigné'}</p> )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="info-group">
                        <h3>Adresse de Livraison</h3>
                        <div className="address-box">
                            {isEditing ? (
                                <textarea 
                                    className="edit-textarea" 
                                    value={editForm.adresseDeLivraison} 
                                    onChange={(e) => setEditForm({...editForm, adresseDeLivraison: e.target.value})} 
                                />
                            ) : ( <p>{userData.adresseDeLivraison || "Aucune adresse enregistrée."}</p> )}
                        </div>
                    </section>

                    {/* ACTIONS EN BAS */}
                    <div className="profile-actions-footer">
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveAll} className="btn-save-confirm">Valider les changements</button>
                                <button onClick={() => setIsEditing(false)} className="btn-cancel-edit">Annuler</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="btn-action-edit">Modifier mes informations</button>
                                <button onClick={handleDeleteUser} className="btn-action-delete">Supprimer mon compte</button>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default UserPage;