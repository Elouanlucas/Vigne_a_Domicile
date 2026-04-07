import React, { useEffect, useState } from 'react';
import '../styles/index.css';

function Homepage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On récupère la chaîne de caractères
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      // On la re-transforme en objet JavaScript
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <>
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        <h1>Accueil</h1>
        {user ? (
          <h2>Bonjour, {user.prenom} !</h2>
        ) : (
          <p>Bienvenue chez Vigne à Domicile !!!</p>
        )}
        <p>Découvrez notre sélection de vins d'exception.</p>
      </main>
    </>
  );
}

export default Homepage;