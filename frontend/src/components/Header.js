import '../styles/Header.css';
import logoSommelier from '../assets/icon/logo_sommelier.png';
import { useState } from 'react';
import Panier from './Panier';
import { useCart } from '../context/CartContext';

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
  const [isHovered, setIsHovered] = useState(false);
  const { panierItems, handleRetirer, handleToutRetirer } = useCart();
  const totalQuantity = panierItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="navbar">
        <div className="logo">
            <a href="/">
              <img src={logoSommelier} className="logo-image" alt="Logo" />
            </a>
        </div>
        
        <div className="header-content"> 
            <h1>Vigne à Domicile</h1>
            <nav>
            <ul className="nav-links">
                <li><a href="/">Accueil</a></li>
                <li><a href="/produits">Produits</a></li>
                <li><a href="/APropos">A propos</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href='/Preferences'>Preferences</a></li>
                
            </ul>
            </nav>
        </div>
        <div className="header-panier" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {/* Le panier sera intégré ici */}
                <IconButton>
                  <ShoppingCartIcon 
                    fontSize="large" 
                    sx={{ color: 'var(--primary-color)' }} // Applique la couleur bordeaux/rouge
                  />
                  <CartBadge 
                      badgeContent={totalQuantity} 
                      color="primary" 
                      overlap="circular" 
                  />
                </IconButton>
                {isHovered && (
                  <div className="panier-dropdown">
                    <Panier items={panierItems} onRetirer={handleRetirer} onToutRetirer={handleToutRetirer} />
                  </div>
                )}
        </div>
    </header>
  );
};

export default Header;