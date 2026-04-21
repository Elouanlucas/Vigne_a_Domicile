import '../styles/Header.css';
import logoSommelier from '../assets/icon/logo_sommelier.png';
import { useEffect, useState } from 'react';
import Panier from './Panier';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Badge, { badgeClasses } from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

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

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  
  useEffect(() => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
          const userObj = JSON.parse(savedUser);
          setUser(userObj);
          // On récupère le rôle soit de l'objet user, soit du localStorage
          setRole(userObj.role || localStorage.getItem('role'));
      } else {
          setUser(null);
          setRole(null);
      }
  }, []);

  const handleCartClick = () => {
    if (onTogglePanier) {
      onTogglePanier();
    } else {
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
              <Link to="/">
                <img src={logoSommelier} className="logo-image" alt="Logo" />
              </Link>
          </div>
          
          <div className="header-content"> 
              <h1>Vigne à Domicile</h1>
              <nav>
                <ul className="nav-links">
                    <li><Link to="/">Accueil</Link></li>
                    <li><Link to="/produits">Produits</Link></li>
                    <li><Link to="/APropos">A propos</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li><Link to="/Preferences">Preferences</Link></li>
                    
                    {/* AFFICHAGE CONDITIONNEL : Menu Admin */}
                    {role === 'admin' && (
                      <li>
                        <Link to="/administrateur">
                          admin
                        </Link>
                      </li>
                    )}
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

              {user ? (
                <Link to="/Utilisateur">
                  <IconButton>
                    <SettingsIcon 
                      fontSize="large" 
                      sx={{ color: 'var(--primary-color)' }}
                    />
                  </IconButton>
                </Link>
              ) : (
                <Link to="/connexion">
                  <IconButton>
                    <AccountCircleIcon 
                      fontSize="large" 
                      sx={{ color: 'var(--primary-color)' }}
                    />
                  </IconButton>
                </Link>
              )}
          </div>
      </header>

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