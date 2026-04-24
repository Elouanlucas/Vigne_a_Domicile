import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WineBarIcon from '@mui/icons-material/WineBar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

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
    <Box sx={{ p: 4 }}>
      {/* En-tête de bienvenue */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ color: '#4a0404', fontWeight: 'bold', mb: 1 }}>
          Tableau de bord
        </Typography>
        <Typography variant="h5" sx={{ color: '#555' }}>
          Bonjour, {user?.prenom || 'Administrateur'} ! 
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic', color: '#888' }}>
          Voici un aperçu de l'activité de "Vigne à Domicile".
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Cartes de statistiques */}
      <Grid container spacing={3}>
        {/* Carte Utilisateurs */}
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderLeft: '8px solid #4a0404' }}>
            <PeopleIcon sx={{ fontSize: 50, color: '#4a0404', mb: 1 }} />
            <Typography variant="h6">Utilisateurs</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.users}</Typography>
          </Paper>
        </Grid>

        {/* Carte Vins */}
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderLeft: '8px solid #4a0404' }}>
            <WineBarIcon sx={{ fontSize: 50, color: '#4a0404', mb: 1 }} />
            <Typography variant="h6">Vins en cave</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.vins}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Section Information système */}
      <Box sx={{ mt: 6, p: 3, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ color: '#4a0404', mb: 1 }}>Statut du système</Typography>
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