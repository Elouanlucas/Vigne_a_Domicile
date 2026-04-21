import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Connexion.css';

function Inscription() {
    const [formData, setFormData] = useState({
        login: '',
        motDePasse: '',
        confirmerMotDePasse: '', // Nouveau champ
        nom: '',
        prenom: '',
        dateDeNaissance: '',
        email: '',
        telephone: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { id, value } = e.target;

        // Restriction pour le téléphone : on ne garde que les chiffres
        if (id === "telephone") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Supprime tout ce qui n'est pas un chiffre
            setFormData({ ...formData, [id]: onlyNums });
        } else {
            setFormData({
                ...formData,
                [id]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérification de la correspondance des mots de passe
        if (formData.motDePasse !== formData.confirmerMotDePasse) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        
        try {
            // On retire confirmerMotDePasse avant d'envoyer au backend
            const { confirmerMotDePasse, ...dataToSend } = formData;

            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Inscription réussie !");
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
                    {/* Champs Nom et Prénom */}
                    <div className="form-group">
                        <label htmlFor="nom">Nom</label>
                        <input type="text" id="nom" value={formData.nom} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prenom">Prénom</label>
                        <input type="text" id="prenom" value={formData.prenom} onChange={handleChange} required />
                    </div>
                    
                    {/* Login et Email */}
                    <div className="form-group">
                        <label htmlFor="login">Login</label>
                        <input type="text" id="login" value={formData.login} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    {/* Mots de passe */}
                    <div className="form-group">
                        <label htmlFor="motDePasse">Mot de passe</label>
                        <input type="password" id="motDePasse" value={formData.motDePasse} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmerMotDePasse">Confirmer le mot de passe</label>
                        <input type="password" id="confirmerMotDePasse" value={formData.confirmerMotDePasse} onChange={handleChange} required />
                    </div>

                    {/* Infos complémentaires */}
                    <div className="form-group">
                        <label htmlFor="dateDeNaissance">Date de naissance</label>
                        <input type="date" id="dateDeNaissance" value={formData.dateDeNaissance} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="telephone">Téléphone (chiffres uniquement)</label>
                        <input 
                            type="tel" 
                            id="telephone" 
                            value={formData.telephone} 
                            onChange={handleChange} 
                            placeholder="0612345678"
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