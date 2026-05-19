import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import '../styles/Home.css'; 

const Questionaire = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Box component="main" className="home-container">
        <Typography variant="h4" sx={{ mb: 1, color: '#4a0404', fontWeight: 'bold' }}>
            Questionnaire
        </Typography>
    </Box>
  );
};

export default Questionaire;