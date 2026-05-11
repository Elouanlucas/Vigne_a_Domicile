import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, TextField, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Box, Typography, MenuItem, Select, 
  FormControl, InputLabel, Grid, Tabs, Tab 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import '../../styles/AdminPrestation.css'; // On importe le nouveau fichier

function Prestation() {
  const [prestations, setPrestations] = useState([]);
  const [caves, setCaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [token] = useState(localStorage.getItem('token'));

  const [openPresDialog, setOpenPresDialog] = useState(false);
  const [openCaveDialog, setOpenCaveDialog] = useState(false);
  const [caveTabValue, setCaveTabValue] = useState(0); 
  const [isEditing, setIsEditing] = useState(false);

  const [selectedPres, setSelectedPres] = useState(null);
  const [newPres, setNewPres] = useState({
    nom: '', type: 'cave', description: '', id_cave: '', adresse_fixe: '', prix: '', quantity: '', cover: ''
  });

  const [selectedCave, setSelectedCave] = useState(null);
  const [newCave, setNewCave] = useState({ nom: '', adresse: '', quantite: '', description: '' });
  const [editCaveData, setEditCaveData] = useState({ nom: '', adresse: '', quantite: '', description: '' });

  useEffect(() => {
    fetchPrestations();
    fetchCaves();
  }, []);

  const fetchPrestations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/prestations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPrestations(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const fetchCaves = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/caves', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCaves(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  };

  const handleSavePrestation = async () => {
    const formData = new FormData();
    formData.append('nom', newPres.nom);
    formData.append('type', newPres.type);
    formData.append('description', newPres.description);
    formData.append('id_cave', newPres.id_cave);
    formData.append('adresse_fixe', newPres.adresse_fixe);
    formData.append('prix', newPres.prix);
    formData.append('quantity', newPres.quantity);
    
    if (newPres.cover instanceof File) {
      formData.append('cover', newPres.cover);
    }

    try {
      const url = isEditing 
        ? `http://localhost:3001/api/prestations/${selectedPres.id}` 
        : 'http://localhost:3001/api/prestations';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        setOpenPresDialog(false);
        fetchPrestations();
      }
    } catch (error) { console.error(error); }
  };

  const handleAddCave = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/caves', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newCave)
      });
      if (response.ok) {
        fetchCaves();
        setNewCave({ nom: '', adresse: '', quantite: '', description: '' });
        setCaveTabValue(0); 
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdateCave = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/caves/${selectedCave.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editCaveData)
      });
      if (response.ok) {
        fetchCaves();
        setSelectedCave(null);
        setCaveTabValue(0);
      }
    } catch (error) { console.error(error); }
  };

  return (
    <Box className="admin-container">
      <Typography variant="h4" className="admin-main-title">Gestion des Prestations</Typography>

      <Box className="admin-top-bar">
        <TextField label="Rechercher..." variant="outlined" fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Button variant="outlined" startIcon={<WarehouseIcon />} className="btn-cave-outline" onClick={() => { setCaveTabValue(0); setOpenCaveDialog(true); }}>Gérer les Caves</Button>
        <Button variant="contained" startIcon={<AddIcon />} className="btn-add-primary" onClick={() => { setIsEditing(false); setNewPres({ nom: '', type: 'cave', id_cave: '', prix: '', quantity: '', description: '', cover: '' }); setOpenPresDialog(true); }}>Nouvelle Prestation</Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead className="table-head-grey">
            <TableRow>
              <TableCell><strong>Image</strong></TableCell>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Lieu</strong></TableCell>
              <TableCell><strong>Prix</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prestations.filter(p => p.nom.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <img 
                    src={`http://localhost:3001/uploads/${p.cover}`} 
                    alt={p.nom} 
                    className="img-preview-table"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/50'} 
                  />
                </TableCell>
                <TableCell>{p.nom}</TableCell>
                <TableCell>{p.type}</TableCell>
                <TableCell>{p.cave_nom || p.adresse_fixe || '—'}</TableCell>
                <TableCell>{p.prix}€</TableCell>
                <TableCell align="center">
                  <IconButton color="info" onClick={() => { setSelectedPres(p); setNewPres({...p, cover: p.cover || ''}); setIsEditing(true); setOpenPresDialog(true); }}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => { if(window.confirm("Supprimer ?")) { fetch(`http://localhost:3001/api/prestations/${p.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).then(() => fetchPrestations()); } }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCaveDialog} onClose={() => { setOpenCaveDialog(false); setSelectedCave(null); }} fullWidth maxWidth="sm">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={caveTabValue} onChange={(e, val) => setCaveTabValue(val)} centered>
            <Tab label="Toutes les Caves" />
            <Tab label="Ajouter une Cave" />
            {selectedCave && <Tab label="Modification" className="tab-edit-label" />}
          </Tabs>
        </Box>
        <DialogContent dividers>
          {caveTabValue === 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Nom</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                <TableBody>
                  {caves.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nom}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => { setSelectedCave(c); setEditCaveData(c); setCaveTabValue(2); }}><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => { if(window.confirm("Supprimer ?")) { fetch(`http://localhost:3001/api/caves/${c.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).then(() => fetchCaves()); } }}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {caveTabValue === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Nom" fullWidth value={newCave.nom} onChange={(e) => setNewCave({...newCave, nom: e.target.value})} />
              <TextField label="Adresse" fullWidth value={newCave.adresse} onChange={(e) => setNewCave({...newCave, adresse: e.target.value})} />
              <TextField label="Capacité" type="number" fullWidth value={newCave.quantite} onChange={(e) => setNewCave({...newCave, quantite: e.target.value})} />
              <TextField label="Description" multiline rows={2} fullWidth value={newCave.description} onChange={(e) => setNewCave({...newCave, description: e.target.value})} />
              <Button variant="contained" color="success" onClick={handleAddCave}>Créer la cave</Button>
            </Box>
          )}
          {caveTabValue === 2 && selectedCave && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField label="Nom" fullWidth value={editCaveData.nom} onChange={(e) => setEditCaveData({...editCaveData, nom: e.target.value})} />
              <TextField label="Description" multiline rows={2} fullWidth value={editCaveData.description} onChange={(e) => setEditCaveData({...editCaveData, description: e.target.value})} />
              <Button variant="contained" onClick={handleUpdateCave}>Enregistrer</Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openPresDialog} onClose={() => setOpenPresDialog(false)} fullWidth maxWidth="md">
        <DialogTitle className="dialog-title-dark">{isEditing ? 'Modifier Prestation' : 'Ajouter Prestation'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} className="form-grid-spacing">
            <Grid item xs={12} md={8}>
              <TextField label="Nom" fullWidth value={newPres.nom} onChange={(e) => setNewPres({...newPres, nom: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="outlined" component="label" fullWidth className="upload-btn-height">
                {newPres.cover instanceof File ? "Image prête" : "Changer Image"}
                <input type="file" hidden accept="image/*" onChange={(e) => setNewPres({ ...newPres, cover: e.target.files[0] })} />
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth><InputLabel>Type</InputLabel>
                <Select value={newPres.type} label="Type" onChange={(e) => setNewPres({...newPres, type: e.target.value})}>
                  <MenuItem value="cave">Cave</MenuItem><MenuItem value="domicile">Domicile</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {newPres.type === 'cave' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth><InputLabel>Cave</InputLabel>
                  <Select value={newPres.id_cave} label="Cave" onChange={(e) => setNewPres({...newPres, id_cave: e.target.value})}>
                    {caves.map(c => <MenuItem key={c.id} value={c.id}>{c.nom}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {newPres.type === 'domicile' && (
              <Grid item xs={12} md={6}>
                <TextField label="Adresse fixe (si applicable)" fullWidth value={newPres.adresse_fixe} onChange={(e) => setNewPres({...newPres, adresse_fixe: e.target.value})} />
              </Grid>
            )}
            <Grid item xs={6}><TextField label="Prix (€)" type="number" fullWidth value={newPres.prix} onChange={(e) => setNewPres({...newPres, prix: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField label="Max Pers." type="number" fullWidth value={newPres.quantity} onChange={(e) => setNewPres({...newPres, quantity: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField label="Description" multiline rows={3} fullWidth value={newPres.description} onChange={(e) => setNewPres({...newPres, description: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPresDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSavePrestation} className="btn-add-primary">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Prestation;