import React from 'react';
import { Email, Phone, LocationOn, Instagram, LinkedIn, Facebook } from '@mui/icons-material';
import '../styles/Contacter.css'; // Crée ce fichier pour le style

function Contacter() {
  return (
    <main className="contact-page">
      <div className="contact-card">
        <h1>Nous contacter</h1>
        <p className="subtitle">Une question ? Une envie de découvrir nos vins ? Nous sommes là pour vous.</p>
        
        <div className="contact-info">
          <div className="info-item">
            <Email className="icon" />
            <a href="mailto:contact@VigneADomicile.fr">contact@VigneADomicile.fr</a>
          </div>
          <div className="info-item">
            <Phone className="icon" />
            <a href="tel:+33642178933">+33 6 42 17 89 33</a>
          </div>
          <div className="info-item">
            <LocationOn className="icon" />
            <span>10 Bd Jean Jeanneteau, 49100 Angers, France</span>
          </div>
        </div>

        <div className="social-section">
          <h3>Suivez-nous</h3>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram className="social-btn insta" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><LinkedIn className="social-btn linked" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><Facebook className="social-btn fb" /></a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Contacter;