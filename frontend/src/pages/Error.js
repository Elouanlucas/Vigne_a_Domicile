import Footer from '../components/Footer';
import Header from '../components/Header';
import '../styles/Error.css';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function Error() {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <Header />
      
      <main className={`error-page ${theme}`}>
        <h1>Erreur 404</h1>
        <p>La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <a href="/">Retour à l'accueil</a>
      </main>

      <Footer />
    </>
  );
}

export default Error;