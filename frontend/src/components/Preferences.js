import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Language, Payments, DarkMode } from '@mui/icons-material';
import { CurrencyContext } from '../context/CurrencyContext';
import '../styles/Preferences.css';

function Preferences() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { currency, setCurrency } = useContext(CurrencyContext);
    
    // États locaux pour la démonstration (à lier à un contexte global si besoin)
    const [language, setLanguage] = useState('FR');

    return (
        <div className={`preferences-page ${theme}`}>
            <div className="preferences-card">
                <h1>Préférences</h1>
                <p className="subtitle">Personnalisez votre expérience sur Vigne à Domicile.</p>

                <div className="pref-list">
                    {/* Thème */}
                    <div className="pref-item">
                        <div className="pref-info">
                            <DarkMode className="pref-icon" />
                            <span>Apparence</span>
                        </div>
                        <div className="toggle-switch">
                            <input 
                                type="checkbox" 
                                id="theme-toggle"
                                checked={theme === 'dark'} 
                                onChange={toggleTheme} 
                            />
                            <label htmlFor="theme-toggle" className="switch-label">
                                {theme === 'dark' ? 'Sombre' : 'Clair'}
                            </label>
                        </div>
                    </div>

                    {/* Langues */}
                    <div className="pref-item">
                        <div className="pref-info">
                            <Language className="pref-icon" />
                            <span>Langue</span>
                        </div>
                        <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)} 
                            className="pref-select"
                        >
                            <option value="FR">Francais</option>
                            <option value="EN">Anglais</option>
                            {/* ... autres options */}
                        </select>
                    </div>

                    {/* Devises */}
                    <div className="pref-item">
                        <div className="pref-info">
                            <Payments className="pref-icon" />
                            <span>Devise</span>
                        </div>
                        <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)} // Change la devise globalement
                            className="pref-select"
                        >
                            <option value="EUR">Euro (€)</option>
                            <option value="USD">Dollar ($)</option>
                            <option value="GBP">Livre (£)</option>
                            <option value="CHF">Franc Suisse (CHF)</option>
                            <option value="JPY">Yen (¥)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Preferences;