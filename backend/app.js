//on importe le framwork express
const express = require(`express`);
const mysql = require('mysql2');

// express() est une fonction qui crée une instance de l’application Express
//Cette instance app sera notre application express

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vigne_a_domicile',
});

connection.connect(err => {
    if (err) {
        console.error('Erreur de connexion à MySQL :', err);
    } else {
        console.log('Connexion à MySQL réussie !');
    }
});

const cors = require('cors');

const app = express();

app.use(cors());
//on va exporter app pour qu'on puisse y accéder depuis les autres
//fichiers du projet, notamment notre serveur Node

app.use((req, res, next) => {
    console.log('Requête reçue !');
    next();
    });
    app.use((req, res) => {
    //on utilise l'objet réponse res et la méthode json()
    // pour renvoyer une réponse simple en json
    res.json({ message: 'Votre requête a bien été reçue !'
    });
});


module.exports = app;