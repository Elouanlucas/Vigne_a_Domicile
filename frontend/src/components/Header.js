import '../styles/Header.css';
import logoSommelier from '../assets/icon/logo_sommelier.png';
import { useEffect, useState } from 'react';
import Panier from './Panier';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';

// Importations MUI
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Badge, { badgeClasses } from '@mui/material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/material/Box';

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
    background-color: #4a0404;
    color: white;
  }
`;

const Header = ({ onTogglePanier }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { panierItems, handleRetirer, handleToutRetirer } = useCart();
  const totalQuantity = panierItems.reduce((sum, item) => sum + item.quantity, 0);
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const openInfo = Boolean(anchorEl);

  const handleOpenInfo = (event) => setAnchorEl(event.currentTarget);
  const handleCloseInfo = () => setAnchorEl(null);

  useEffect(() => {
    const updateUserData = () => {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (savedUser && token) {
        const userObj = JSON.parse(savedUser);
        setUser(userObj);
        setRole(userObj.role);
        // On utilise le binaire stocké dans le user du localStorage
        setPhotoUrl(userObj.photo ? renderHeaderPhoto(userObj.photo) : null);
      } else {
        setUser(null);
        setRole(null);
        setPhotoUrl(null);
      }
    };

    updateUserData();

    // Écoute les changements du localStorage
    window.addEventListener('storage', updateUserData);
    return () => window.removeEventListener('storage', updateUserData);
  }, [location.pathname]); // Garde location pour le changement de page

  const renderHeaderPhoto = (photoData) => {
    try {
      if (!photoData) return null;
      const dataArray = photoData.data || (Array.isArray(photoData) ? photoData : null);
      if (dataArray) {
        const uint8Array = new Uint8Array(dataArray);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      }
    } catch (e) {
      console.error("Erreur image", e);
    }
    return null;
  };

  const handleCartClick = () => {
    onTogglePanier ? onTogglePanier() : setIsOpen(!isOpen);
  };

  const closePanier = () => setIsOpen(false);

  return (
    <>
      <header className="navbar">
        {/* LOGO À GAUCHE */}
        <div className="logo">
          <Link to="/">
            <img src={logoSommelier} className="logo-image" alt="Logo" />
          </Link>
        </div>
        
        {/* TITRE ET LIENS CENTRÉS */}
        <div className="header-center-content"> 
          <h1>Vigne à Domicile</h1>
          <nav>
            <ul className="nav-links">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/produits">Produits</Link></li>
              <li><Link to="/prestations">Prestations</Link></li>


              <li 
                onMouseEnter={handleOpenInfo} 
                onMouseLeave={handleCloseInfo}
              >
                <span className="nav-item-dropdown">
                  Informations <KeyboardArrowDownIcon fontSize="small" />
                </span>
                <Menu
                  anchorEl={anchorEl}
                  open={openInfo}
                  onClose={handleCloseInfo}
                  disableScrollLock={true}
                  MenuListProps={{ onMouseEnter: () => {}, onMouseLeave: handleCloseInfo }}
                  PaperProps={{ className: "info-menu-paper" }}
                  sx={{ pointerEvents: 'none' }}
                >
                  <Box sx={{ pointerEvents: 'auto' }}>
                    <MenuItem onClick={handleCloseInfo} component={Link} to="/APropos">À propos</MenuItem>
                    <MenuItem onClick={handleCloseInfo} component={Link} to="/contact">Contact</MenuItem>
                  </Box>
                </Menu>
              </li>

              {user !== null && <li><Link to="/Preferences">Préférences</Link></li>}
              {role === 'admin' && <li><Link to="/administrateur" className="admin-link">Admin</Link></li>}
            </ul>
          </nav>
        </div>

        {/* PANIER ET PROFIL À DROITE */}
        <div className="header-right-icons">
          <IconButton onClick={handleCartClick}>
            <CartBadge badgeContent={totalQuantity} color="error" overlap="circular">
              <ShoppingCartIcon fontSize="large" sx={{ color: 'var(--primary-color)' }} />
            </CartBadge>
          </IconButton>

          <Link to={user ? "/Utilisateur" : "/connexion"}>
            <IconButton sx={{ padding: '4px' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Profil" className="profile-img-nav" />
              ) : (
                <AccountCircleIcon fontSize="large" sx={{ color: 'var(--primary-color)' }} />
              )}
            </IconButton>
          </Link>
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