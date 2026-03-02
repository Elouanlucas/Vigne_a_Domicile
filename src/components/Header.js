import '../styles/Header.css';
import logoSommelier from '../assets/icon/logo_sommelier.png';

const Header = () => {
  return (
    <header className="navbar">
        <div className="logo">
            <img src={logoSommelier} className="logo-image" alt="Logo" />
        </div>
        
        <div className="header-content"> 
            <h1>Vigne à Domicile</h1>
            <nav>
            <ul className="nav-links">
                <li><a href="/">Accueil</a></li>
                <li><a href="/produits">Produits</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
            </nav>
        </div>
    </header>
  );
};

export default Header;