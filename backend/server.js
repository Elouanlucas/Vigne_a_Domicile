const http = require('http');

//on importe l'application express via le fichier app.js :
const app = require('./app');
// on configure express pour lui dire sur quel port elle va tourner
app.set('port', process.env.PORT || 3001);
// on créé un serveur HTTP en utilisant le module http de Node.js
// et on lui passe l'application Express ‘app’ comme gestionnaire de requêtes.
const server = http.createServer(app);

server.listen(process.env.PORT || 3001);