import '../styles/Preferences.css';
import { useState } from 'react';

function Preferences() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <div className='preferences-page'>
        <h1>Préférences Utilisateur</h1>
        <label>
        <input 
            type="checkbox" 
            checked={isDarkMode} 
            onChange={(e) => setIsDarkMode(e.target.checked)} 
        />
        Mode Sombre
        </label>
        </div>
    );
};
export default Preferences;