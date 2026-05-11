import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import '../styles/Home.css'; 

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Box component="main" className="home-container">
      <div className="hero-content">
        {user ? (
          <Typography variant="h2" className="home-title">
            Ravi de vous revoir, <span className="user-name">{user.prenom}</span> !
          </Typography>
        ) : (
          <Typography variant="h2" className="home-title">
            Bienvenue chez <span className="brand-name">Vigne à Domicile</span>
          </Typography>
        )}

        <Typography variant="h5" className="home-subtitle">
          "Une sélection rigoureuse des plus beaux domaines, livrée directement à votre porte."
        </Typography>
        
        <div className="divider" />
        
        <Typography variant="body1" className="home-scroll-hint">
            Découvrez notre collection dans l'onglet Produits
        </Typography>
      </div>
    </Box>
  );
};

export default Home;