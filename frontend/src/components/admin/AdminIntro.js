import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WineBarIcon from '@mui/icons-material/WineBar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import '../../styles/AdminIntro.css';

function AdminIntro({ user }) {
  const [stats, setStats] = useState({
    users: 0,
    vins: 0,
    orders: 0
  });

  const token = localStorage.getItem('token');

  // On récupère les chiffres pour donner vie au tableau de bord
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resUsers, resVins] = await Promise.all([
          fetch('http://localhost:3001/api/user/all', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:3001/api/vins/all', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const dataUsers = await resUsers.json();
        const dataVins = await resVins.json();

        setStats({
          users: Array.isArray(dataUsers) ? dataUsers.length : 0,
          vins: Array.isArray(dataVins) ? dataVins.length : 0,
          orders: 0 // Tu pourras fetch tes commandes ici plus tard
        });
      } catch (error) {
        console.error("Erreur stats:", error);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <Box className="admin-intro-container">
      {/* En-tête de bienvenue */}
      <Box className="admin-intro-header">
        <Typography variant="h3" className="admin-intro-title">
          Tableau de bord
        </Typography>
        <Typography variant="h5" className="admin-intro-subtitle">
          Bonjour, {user?.prenom || 'Administrateur'} ! 
        </Typography>
        <Typography variant="body1" className="admin-intro-welcome-text">
          Voici un aperçu de l'activité de "Vigne à Domicile".
        </Typography>
      </Box>

      <Divider className="admin-intro-divider" />

      {/* Cartes de statistiques */}
      <Grid container spacing={3}>
        {/* Carte Utilisateurs */}
        <Grid item xs={12} sm={4}>
          <Paper className="admin-intro-card">
            <PeopleIcon className="admin-intro-card-icon" />
            <Typography variant="h6">Utilisateurs</Typography>
            <Typography variant="h4" className="admin-intro-card-value">{stats.users}</Typography>
          </Paper>
        </Grid>

        {/* Carte Vins */}
        <Grid item xs={12} sm={4}>
          <Paper className="admin-intro-card">
            <WineBarIcon className="admin-intro-card-icon" />
            <Typography variant="h6">Vins en cave</Typography>
            <Typography variant="h4" className="admin-intro-card-value">{stats.vins}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Section Information système */}
      <Box className="admin-intro-system-box">
        <Typography variant="h6" className="admin-intro-system-title">Statut du système</Typography>
        <Typography variant="body2">
          • Serveur Backend : <strong>Connecté (Port 3001)</strong><br />
          • Base de données : <strong>MySQL Active</strong><br />
          • Dernière synchronisation : {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
}

export default AdminIntro;