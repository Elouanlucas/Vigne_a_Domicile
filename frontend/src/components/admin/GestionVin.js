import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, TextField, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Box, Typography 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

function GestionVin() {
  const [vins, setVins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVin, setSelectedVin] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newVin, setNewVin] = useState({
    name: '',
    cover: '',
    price: '',
    category: '',
    description: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchVins();
  }, []);

  const fetchVins = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vins/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement vins:", error);
    }
  };

  const handleAddVin = async () => {
    if (!newVin.name || !newVin.price || !newVin.category) {
      alert("Veuillez remplir au moins: Nom, Prix et Catégorie");
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing 
        ? `http://localhost:3001/api/vins/update/${selectedVin.id}`
        : 'http://localhost:3001/api/vins/add';

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newVin)
      });

      if (response.ok) {
        setOpenDialog(false);
        setIsEditing(false);
        setNewVin({ name: '', cover: '', price: '', category: '', description: '' });
        fetchVins();
      } else {
        const err = await response.json();
        alert("Erreur : " + err.message);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (vin) => {
    setSelectedVin(vin);
    setNewVin({
      name: vin.name,
      cover: vin.cover || '',
      price: vin.price,
      category: vin.category,
      description: vin.description || ''
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce vin?")) {
      try {
        const response = await fetch(`http://localhost:3001/api/vins/delete/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchVins();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleOpenDialog = () => {
    setIsEditing(false);
    setSelectedVin(null);
    setNewVin({ name: '', cover: '', price: '', category: '', description: '' });
    setOpenDialog(true);
  };

  const filteredVins = vins.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#4a0404', fontWeight: 'bold' }}>Gestion des Vins</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField label="Rechercher..." variant="outlined" fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenDialog}
          sx={{ backgroundColor: '#4a0404', '&:hover': { backgroundColor: '#630606' }, minWidth: '180px' }}
        >
          Ajouter
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Catégorie</strong></TableCell>
              <TableCell><strong>Prix</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVins.map((v) => (
              <TableRow key={v.id} hover>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.category}</TableCell>
                <TableCell>{v.price}€</TableCell>
                <TableCell>{v.description ? v.description.substring(0, 50) + '...' : 'N/A'}</TableCell>
                <TableCell align="center">
                  <IconButton color="info" onClick={() => handleEdit(v)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(v.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- MODALE D'AJOUT/MODIFICATION --- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: '#4a0404', color: '#fff' }}>
          {isEditing ? 'Modifier le vin' : 'Ajouter un nouveau vin'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField 
              label="Nom" 
              required 
              value={newVin.name} 
              onChange={(e) => setNewVin({...newVin, name: e.target.value})} 
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField label="Catégorie" required value={newVin.category} onChange={(e) => setNewVin({...newVin, category: e.target.value})} />
            <TextField label="Prix (€)" type="number" required value={newVin.price} onChange={(e) => setNewVin({...newVin, price: e.target.value})} />
            <TextField label="Image (URL/Nom)" value={newVin.cover} onChange={(e) => setNewVin({...newVin, cover: e.target.value})} />
            <TextField 
              label="Description" 
              multiline 
              rows={4} 
              value={newVin.description} 
              onChange={(e) => setNewVin({...newVin, description: e.target.value})}
              sx={{ gridColumn: '1 / -1' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAddVin} sx={{ backgroundColor: '#4a0404' }}>
            {isEditing ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GestionVin;