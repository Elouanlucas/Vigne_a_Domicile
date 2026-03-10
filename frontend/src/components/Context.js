import '../styles/APropos.css';
import Vigne from '../assets/img/vigne.jpg';
import FamilleVigne from '../assets/img/vigne_ancienne.png';
import PortraitSommelier from '../assets/img/tonneau_de_vin.png';


function Context() {
return (
    <div className="histoire-container">
      <header className="histoire-header">
        <h1>Notre Héritage, Votre Passion</h1>
      </header>

      <section className="context-section">
        <h2>Bienvenue chez Vigne à Domicile</h2>
        <div className="histoire-image-container reverse">
            <div className="histoire-text">
                <p>Plus qu'une simple sélection de vins, <strong>Vigne à Domicile</strong> est une promesse. Celle de vous faire découvrir des nectars d'exception, dénichés au cœur des plus beaux terroirs, et de les livrer directement à votre table, avec le même soin que si nous les apportions à nos propres amis.</p>
            </div>
            <div className="context-image">
                <img src={Vigne} alt="Vigne" />
            </div>
        </div>
      </section>

    <section className="histoire-section">
        <h2>L'Histoire d'une lignée</h2>
        <div className="histoire-image-container">
            <div className="histoire-text">
            <p>Tout a commencé en 1924, au détour d'un coteau escarpé de la Vallée du Rhône. Mon arrière-grand-père, Pierre, n'était pas seulement un homme de la terre ; il était un "passeur de goûts". Il disait souvent : <em>« Le vin n'est pas une boisson, c'est une conversation que la terre entretient avec le ciel. »</em></p>
            <p>De génération en génération, ce savoir-faire s'est transmis comme un secret précieux. Mon grand-père a appris à écouter les vignes, mon père a appris à comprendre les cépages, et moi, j'ai appris à transmettre cette émotion. Aujourd'hui, <strong>Vigne à Domicile</strong> est le fruit de ce siècle de passion.</p>
            </div>
            <div className="histoire-image">
            <img src={FamilleVigne} alt="Famille viticole" />
            </div>
        </div>
    </section>

    <section className="histoire-section">
        <h2>Qui suis-je ?</h2>
        <div className="histoire-image-container reverse">
            <div className="histoire-text">
            <p>Je suis le garant de cette lignée. Passionné par l'art de vivre à la française, j'ai passé des années à parcourir les vignobles, notamment autour de notre belle région d'Angers.</p>
            <p>Mon rôle est simple : faire le pont entre le savoir-faire ancestral des domaines et votre verre, en sélectionnant pour vous des vins qui ont une âme.</p>
            </div>
            <div className="histoire-image">
            <img src={PortraitSommelier} alt="Sommelier au travail" />
            </div>
        </div>
    </section>

    <footer className="histoire-credits">
        <h3>Crédits</h3>
        <ul>
          <li><strong>Conception & Développement :</strong> Team Vigne à Domicile </li>
          <li><strong>Sélection œnologique :</strong> Propriétaire Fondateur</li>
          <li><strong>Remerciements :</strong> À tous nos vignerons partenaires.</li>
        </ul>
      </footer>
    </div>
  );
}
export default Context;