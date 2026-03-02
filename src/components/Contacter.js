import '../styles/index.css';
function Contacter() {
  return (
    <>
      
      <main style={{ minHeight: '80vh', padding: '20px' }}>
        <h2>Nous contacter</h2>
        <p>Une question sur le concours ? Une envie de participer ? Contacte-nous !</p>
        <br />
        <p><strong>📧 Email :</strong> 
            <a href="mailto:contact@VigneADomicile.fr">contact@VigneADomicile.fr</a>
        </p>
        <br />
        <p><strong>📞 Téléphone :</strong> 
            <a href="tel:+33642178933">+33 6 42 17 89 33</a>
        </p>
        <br />
        <p><strong>📍 Adresse :</strong> 10 Bd Jean Jeanneteau, 49100 Angers, France</p>
        <br /><br />

      </main>

    </>
  );
}

export default Contacter;