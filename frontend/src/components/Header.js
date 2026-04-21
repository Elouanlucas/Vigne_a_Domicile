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
          setRole(userObj.role || localStorage.getItem('role'));
      } else {
          setUser(null);
          setRole(null);
      }
  }, []);

  // --- FONCTION MAGIQUE POUR TRANSFORMER LE BLOB EN IMAGE ---
  const renderHeaderPhoto = (photoData) => {
    if (!photoData) return null;

    // MySQL renvoie souvent un objet { type: "Buffer", data: [...] }
    if (photoData.type === 'Buffer' || photoData.data) {
        const dataArray = photoData.data || photoData;
        try {
            const uint8Array = new Uint8Array(dataArray);
            const blob = new Blob([uint8Array], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
        } catch (e) {
            console.error("Erreur de conversion d'image", e);
            return null;
        }
    }
    return null;
  };

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
                    
                    {role === 'admin' && (
                      <li>
                        <Link to="/administrateur">admin</Link>
                      </li>
                    )}
                </ul>
              </nav>
          </div>

          <div className="header-panier">
              {/* Icône Panier */}
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

              {/* Icône Utilisateur / Photo de Profil */}
              {user ? (
                <Link to="/Utilisateur">
                  <IconButton sx={{ padding: '4px' }}>
                    {user.photo ? (
                      <img 
                        src={renderHeaderPhoto(user.photo)} 
                        alt="Profil" 
                        style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '50%', 
                          objectFit: 'cover',
                          border: '2px solid var(--primary-color)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} 
                      />
                    ) : (
                      <AccountCircleIcon 
                        fontSize="large" 
                        sx={{ color: 'var(--primary-color)' }}
                      />
                    )}
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