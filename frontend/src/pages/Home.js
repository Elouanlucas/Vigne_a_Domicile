import Footer from '../components/Footer';
import Header from '../components/Header';
import '../styles/index.css';
function Home() {
  return (
    <>
      <Header />
      
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        <h1>Accueil</h1>
        <p>Bienvenue chez Vigne à Domicile !</p>
      </main>

      <Footer />
    </>
  );
}

export default Home;