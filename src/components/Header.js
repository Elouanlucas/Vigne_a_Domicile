import '../styles/Header.css';
import logoSommelier from '../assets/icon/logo_sommelier.png';

import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Badge, { badgeClasses } from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;

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
                <li><a href="/APropos">A propos</a></li>
                <li><a href="/contact">Contact</a></li>
                
            </ul>
            </nav>
        </div>
        <div className="header-panier">
            {/* Le panier sera intégré ici */}
                <IconButton>
                    <ShoppingCartIcon fontSize="very_large" />
                    <CartBadge badgeContent={2} color="primary" overlap="circular" />
                </IconButton>
        </div>
    </header>
  );
};

export default Header;