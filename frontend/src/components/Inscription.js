import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importer le hook
import '../styles/Connexion.css'; // On réutilise le même CSS pour la cohérence

function Inscription() {
    // État initial regroupant tous les champs
    const [formData, setFormData] = useState({
        login: '',
        motDePasse: '',
        nom: '',
        prenom: '',
        dateDeNaissance: '',
        email: '',
        telephone: ''
    });
    const navigate = useNavigate();

    // Gestionnaire de changement générique
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/connexion');
            } else {
                alert("Erreur: " + data.message);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi:", error);
        }
    };

    return (
        <div className="connexion-container">
            <div className="connexion-form">
                <h2>Inscription</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nom">Nom</label>
                        <input
                            type="text"
                            id="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prenom">Prénom</label>
                        <input
                            type="text"
                            id="prenom"
                            value={formData.prenom}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="login">Login</label>
                        <input
                            type="text"
                            id="login"
                            value={formData.login}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="motDePasse">Mot de passe</label>
                        <input
                            type="password"
                            id="motDePasse"
                            value={formData.motDePasse}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dateDeNaissance">Date de naissance</label>
                        <input
                            type="date"
                            id="dateDeNaissance"
                            value={formData.dateDeNaissance}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telephone">Téléphone</label>
                        <input
                            type="tel"
                            id="telephone"
                            value={formData.telephone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">S'inscrire</button>
                </form>
            </div>
        </div>
    );
}

export default Inscription;