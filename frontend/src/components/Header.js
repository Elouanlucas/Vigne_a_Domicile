import '../styles/Header.css';
import logoSommelier from '../assets/icon/logo_sommelier.png';
import { useState } from 'react';
import Panier from './Panier';
import { useCart } from '../context/CartContext';

import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Badge, { badgeClasses } from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import CloseIcon from '@mui/icons-material/Close';

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;

const Header = ({ onTogglePanier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { panierItems, handleRetirer, handleToutRetirer } = useCart();
  const totalQuantity = panierItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCartClick = () => {
    if (onTogglePanier) {
      // Page Produit : toggle le panier latéral
      onTogglePanier();
    } else {
      // Autres pages : toggle la modale
      setIsOpen(!isOpen);
    }
  };

  const closePanier = () => {
    setIsOpen(false);
  };

  return (
    <>
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
          <div className="header-panier">
              <IconButton onClick={handleCartClick}>
                <ShoppingCartIcon 
                  fontSize="large" 
                  sx={{ color: 'var(--primary-color)' }}
                />
                <CartBadge 
                    badgeContent={totalQuantity} 
                    color="primary" 
                    overlap="circular" 
                />
              </IconButton>
          </div>
      </header>

      {/* Modale Panier Fullscreen - visible sur les autres pages */}
      {isOpen && !onTogglePanier && (
        <div className="panier-modal-overlay" onClick={closePanier}>
          <div className="panier-modal" onClick={(e) => e.stopPropagation()}>
            <button className="panier-modal-close" onClick={closePanier}>
              <CloseIcon />
            </button>
            <Panier items={panierItems} onRetirer={handleRetirer} onToutRetirer={handleToutRetirer} />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;