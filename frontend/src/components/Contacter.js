import React, { useContext } from 'react';
import { Email, Phone, LocationOn, Instagram, LinkedIn, Facebook } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/Contacter.css';

function Contacter() {
  const { theme } = useContext(ThemeContext);

  return (
    <main className={`contact-page ${theme}`}>
      <div className="contact-card">
        <header className="contact-header">
          <h1>Nous contacter</h1>
          <p className="subtitle">Une question ? Une envie de découvrir nos vins ? Nous sommes là pour vous.</p>
        </header>
        
        <div className="contact-info-list">
          <div className="info-item">
            <div className="icon-circle"><Email className="icon" /></div>
            <a href="mailto:contact@VigneADomicile.fr" className="contact-link">contact@VigneADomicile.fr</a>
          </div>
          
          <div className="info-item">
            <div className="icon-circle"><Phone className="icon" /></div>
            <a href="tel:+33642178933" className="contact-link">+33 6 42 17 89 33</a>
          </div>
          
          <div className="info-item">
            <div className="icon-circle"><LocationOn className="icon" /></div>
            <address className="contact-address">10 Bd Jean Jeanneteau, 49100 Angers</address>
          </div>
        </div>

        <footer className="social-section">
          <h3>Suivez-nous</h3>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link"><Instagram className="social-btn insta" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link"><LinkedIn className="social-btn linked" /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link"><Facebook className="social-btn fb" /></a>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default Contacter;