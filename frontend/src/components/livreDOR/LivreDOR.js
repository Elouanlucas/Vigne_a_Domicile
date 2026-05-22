import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Card, CardContent, Divider, Alert, Grid, 
  Dialog, DialogTitle, DialogContent, DialogActions, Radio, RadioGroup, 
  FormControlLabel, FormControl, FormLabel, Rating
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReplyIcon from '@mui/icons-material/Reply';
import '../../styles/LivreDOR.css'; 

const LivreDOR = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour la Popup (Modal)
  const [openModal, setOpenModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // Note générale par étoiles (par défaut 5 étoiles cochées)
  const [noteGenerale, setNoteGenerale] = useState(5);

  // États pour les critères secondaires (0 = Non, 1 = Oui)
  const [questions, setQuestions] = useState({
    avis_vin: '0',
    avis_site: '0',
    avis_prestation: '0',
    avis_livraison: '0',
    avis_SAV: '0',
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/livredor');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setError('Impossible de charger les messages du livre d\'or.');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau lors de la récupération des messages.');
    }
  };

  const handleRadioChange = (e) => {
    setQuestions({
      ...questions,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenModal = () => setOpenModal(true);
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewMessage('');
    setNoteGenerale(5);
    setQuestions({
      avis_vin: '0',
      avis_site: '0',
      avis_prestation: '0',
      avis_livraison: '0',
      avis_SAV: '0',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newMessage.trim()) {
      setError('Le message ne peut pas être vide.');
      return;
    }

    const numUtilisateur = user?.numUtilisateur || user?.id;
    if (!numUtilisateur) {
      setError('Erreur : Impossible de récupérer votre identifiant utilisateur.');
      setOpenModal(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/livredor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: newMessage,
          numUtilisateur: numUtilisateur,
          note_generale: noteGenerale, // Envoie le nombre d'étoiles (1 à 5) à la colonne SQL
          avis_vin: parseInt(questions.avis_vin),
          avis_site: parseInt(questions.avis_site),
          avis_prestation: parseInt(questions.avis_prestation),
          avis_livraison: parseInt(questions.avis_livraison),
          avis_SAV: parseInt(questions.avis_SAV),
        })
      });

      if (response.ok) {
        setSuccess('Votre avis a été soumis avec succès ! Il est en cours de modération.');
        handleCloseModal();
        fetchMessages();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors de l\'envoi du message.');
        setOpenModal(false);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur réseau. Impossible d\'envoyer le message.');
      setOpenModal(false);
    }
  };

  const listeQuestionsSecondaires = [
    { id: 'avis_vin', label: "Avez-vous aimé nos vins ? 🍷" },
    { id: 'avis_site', label: "Trouvez-vous notre site web agréable ? 💻" },
    { id: 'avis_prestation', label: "Avez-vous aimé nos prestations / visites au domaine ? ⭐" },
    { id: 'avis_livraison', label: "La livraison s'est-elle bien passée ? 📦" },
    { id: 'avis_SAV', label: "Le service client / SAV a-t-il répondu à vos attentes ? 🛠️" },
  ];

  return (
    <Box className="livredor-wrapper">
      <Typography variant="h3" className="livredor-title" sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#4a0404' }}>
        Livre d'or
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, mx: 'auto', maxWidth: 800 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3, mx: 'auto', maxWidth: 800 }}>{success}</Alert>}

      <Grid container spacing={4} direction="column" alignItems="center" className="livredor-grid">
        
        {/* BLOC ACCUEIL ET ACTIONS */}
        <Grid item xs={12} sx={{ width: '100%', maxWidth: 800 }}>
          <Box className="sidebar-section">
            <Box className="cta-card" sx={{ mx: 'auto' }}>
              <Typography variant="h5" sx={{ mb: 2, color: '#4a0404', fontWeight: 'bold' }}>
                Votre avis compte
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#555', lineHeight: 1.5 }}>
                Vous avez dégusté nos crus ou visité notre domaine ? Donnez-nous une note et laissez-nous un message !
              </Typography>
              
              {user ? (
                <Button 
                  variant="contained" 
                  startIcon={<RateReviewIcon />}
                  onClick={handleOpenModal}
                  className="livredor-open-btn"
                >
                  Donner mon avis
                </Button>
              ) : (
                <Alert severity="info" className="login-alert" sx={{ justifyContent: 'center' }}>
                  Connectez-vous pour accéder au questionnaire et laisser un message.
                </Alert>
              )}
            </Box>
          </Box>
        </Grid>

        {/* LISTE DES COMMENTAIRES APPROUVÉS */}
        <Grid item xs={12} sx={{ width: '100%', maxWidth: 800 }}>
          <Box className="messages-section">
            <Typography variant="h5" sx={{ mb: 2, color: '#4a0404', fontWeight: 'bold', textAlign: 'center' }}>
              Les avis de nos clients
            </Typography>
            <Divider sx={{ mb: 4, borderColor: '#4a0404', opacity: 0.2, width: '100%' }} />
            
            <Box className="messages-list">
              {messages.length === 0 ? (
                <Typography variant="body1" sx={{ color: '#777', fontStyle: 'italic', textAlign: 'center' }}>
                  Aucun message pour le moment. Soyez le premier à en laisser un !
                </Typography>
              ) : (
                messages.map((msg) => (
                  <Card key={msg.id} variant="outlined" className="message-card" sx={{ mb: 3, borderRadius: '12px' }}>
                    <CardContent>
                      <Box className="card-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" className="user-login" sx={{ fontWeight: 'bold' }}>
                          @{msg.login}
                        </Typography>
                        <Typography variant="caption" className="message-date" color="textSecondary">
                          {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </Typography>
                      </Box>
                      
                      {/* Rendu des étoiles de l'avis */}
                      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={msg.note_generale} readOnly size="small" sx={{ color: '#4a0404' }} />
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4a0404' }}>
                          {msg.note_generale}/5
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {msg.avis_vin === 1 && <span className="badge badge-yes">🍷 Vin</span>}
                        {msg.avis_site === 1 && <span className="badge badge-yes">💻 Site</span>}
                        {msg.avis_prestation === 1 && <span className="badge badge-yes">⭐ Visite</span>}
                        {msg.avis_livraison === 1 && <span className="badge badge-yes">📦 Livraison</span>}
                        {msg.avis_SAV === 1 && <span className="badge badge-yes">🛠️ SAV</span>}
                      </Box>

                      <Typography variant="body1" className="message-text" sx={{ color: '#333' }}>
                        {msg.message}
                      </Typography>

                      {/* Réponse Admin (Corrigé : Suppression du bg obsolète pour assurer le rendu) */}
                      {msg.reponse_admin && (
                        <Box sx={{ 
                          mt: 2, 
                          p: 2, 
                          backgroundColor: '#f9f6f0', 
                          borderRadius: '8px', 
                          borderLeft: '4px solid #4a0404',
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 0.5
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4a0404' }}>
                            <ReplyIcon sx={{ transform: 'scaleX(-1)', fontSize: '1.2rem' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              Réponse du Domaine
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>
                            "{msg.reponse_admin}"
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* POPUP SOUVENIR D'AVIS (MODAL) */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#4a0404', fontWeight: 'bold', pb: 1 }}>
          Donner votre avis sur le Domaine
        </DialogTitle>
        
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          
          {/* L'AVIS GÉNÉRAL DEVIENT UNE SÉLECTION D'ÉTOILES */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1, alignItems: 'center', width: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
              Note globale (Étoiles)
            </Typography>
            <Rating 
              name="note-globale-etoiles" 
              value={noteGenerale} 
              size="large"
              sx={{ color: '#4a0404', fontSize: '2.5rem' }}
              onChange={(event, newValue) => {
                if (newValue) setNoteGenerale(newValue);
              }}
            />
          </Box>

          <Divider sx={{ my: 1 }}>
            <Typography variant="caption" color="textSecondary">Critères optionnels</Typography>
          </Divider>

          {/* Autres questions */}
          {listeQuestionsSecondaires.map((q) => (
            <FormControl key={q.id} component="fieldset" sx={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormLabel sx={{ color: '#555', fontWeight: 500, fontSize: '0.9rem', maxWidth: '65%' }}>
                {q.label}
              </FormLabel>
              <RadioGroup row name={q.id} value={questions[q.id]} onChange={handleRadioChange}>
                <FormControlLabel value="1" control={<Radio sx={{ color: '#4a0404', '&.Mui-checked': { color: '#4a0404' } }} />} label="Oui" />
                <FormControlLabel value="0" control={<Radio sx={{ color: '#4a0404', '&.Mui-checked': { color: '#4a0404' } }} />} label="Non" />
              </RadioGroup>
            </FormControl>
          ))}

          <Divider sx={{ my: 1 }} />

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Votre témoignage / message"
            placeholder="Partagez votre expérience avec nous..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2, backgroundColor: '#fbfaf8' }}>
          <Button onClick={handleCloseModal} sx={{ color: '#666', textTransform: 'none' }}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" className="livredor-submit-btn-modal">
            Envoyer mon avis
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LivreDOR;