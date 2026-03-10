import '../styles/Preferences.css';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function Preferences() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className= {`preferences-page ${theme}`}>
            <h1>Préférences Utilisateur</h1>
            <label>
                <input 
                    type="checkbox" 
                    checked={theme === 'dark'} 
                    onChange={toggleTheme} 
                />
                Mode Sombre
            </label>
        </div>
    );
};
export default Preferences;