import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, TextField, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Box, Typography, MenuItem 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import '../../styles/GestionCompte.css';

// Configuration de l'URL API centrale
const API_URL = 'http://localhost:3001';

function GestionCompte() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  // États pour les modales
  const [openInfo, setOpenInfo] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // État pour le formulaire d'ajout
  const [newUser, setNewUser] = useState({
    login: '',
    motDePasse: '',
    nom: '',
    prenom: '',
    dateDeNaissance: '',
    email: '',
    telephone: '',
    role: 'client'
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  // Fonction pour envoyer le nouvel utilisateur au Back
  const handleAddUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setOpenAdd(false);
        fetchUsers(); // Rafraîchir la liste
        setNewUser({ login: '', motDePasse: '', nom: '', prenom: '', dateDeNaissance: '', email: '', telephone: '', role: 'client' });
      } else {
        const err = await response.json();
        alert("Erreur : " + err.message);
      }
    } catch (error) {
      console.error("Erreur ajout:", error);
    }
  };

  const handleDelete = async (userLogin) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${userLogin} ?`)) {
      try {
        const response = await fetch(`${API_URL}/api/user/delete-admin/${userLogin}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setUsers(users.filter(u => u.login !== userLogin));
      } catch (error) { console.error(error); }
    }
  };

  const filteredUsers = users.filter(u => 
    u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.login?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box className="gestion-compte-container">
      <Typography variant="h4" className="gestion-compte-title">
        Gestion des Utilisateurs
      </Typography>

      <Box className="gestion-compte-toolbar">
        <TextField 
          label="Rechercher..." 
          variant="outlined" 
          fullWidth 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={() => setOpenAdd(true)}
          className="gestion-compte-btn-add"
        >
          Ajouter
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead className="gestion-compte-table-header">
            <TableRow>
              <TableCell><strong>Login</strong></TableCell>
              <TableCell><strong>Prénom</strong></TableCell>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.login} hover>
                <TableCell>{u.login}</TableCell>
                <TableCell>{u.prenom}</TableCell>
                <TableCell>{u.nom}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell align="center">
                  <IconButton color="info" onClick={() => { setSelectedUser(u); setOpenInfo(true); }}>
                    <InfoIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(u.login)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- MODALE D'AJOUT --- */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle className="gestion-compte-dialog-title">
          Ajouter un nouvel utilisateur
        </DialogTitle>
        <DialogContent dividers>
          <Box className="gestion-compte-form-grid">
            <TextField label="Login" required value={newUser.login} onChange={(e) => setNewUser({...newUser, login: e.target.value})} />
            <TextField label="Mot de passe" type="password" required value={newUser.motDePasse} onChange={(e) => setNewUser({...newUser, motDePasse: e.target.value})} />
            <TextField label="Nom" required value={newUser.nom} onChange={(e) => setNewUser({...newUser, nom: e.target.value})} />
            <TextField label="Prénom" required value={newUser.prenom} onChange={(e) => setNewUser({...newUser, prenom: e.target.value})} />
            <TextField label="Date de Naissance" type="date" required InputLabelProps={{ shrink: true }} value={newUser.dateDeNaissance} onChange={(e) => setNewUser({...newUser, dateDeNaissance: e.target.value})} />
            <TextField label="Email" type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
            <TextField label="Téléphone" required value={newUser.telephone} onChange={(e) => setNewUser({...newUser, telephone: e.target.value})} />
            <TextField select label="Rôle" value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})}>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddUser} className="gestion-compte-btn-submit">
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- MODALE D'INFOS --- */}
      <Dialog open={openInfo} onClose={() => setOpenInfo(false)} fullWidth maxWidth="sm">
        <DialogTitle className="gestion-compte-dialog-title">
          Détails de l'utilisateur
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box className="gestion-compte-info-list">
              <Typography><strong>Login :</strong> {selectedUser.login}</Typography>
              <Typography><strong>Prénom :</strong> {selectedUser.prenom}</Typography>
              <Typography><strong>Nom :</strong> {selectedUser.nom}</Typography>
              <Typography><strong>Email :</strong> {selectedUser.email}</Typography>
              <Typography><strong>Rôle :</strong> {selectedUser.role}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfo(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GestionCompte;