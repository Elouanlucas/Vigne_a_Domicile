const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        console.error('Auth middleware: token manquant', { authorization: authHeader });
        return res.status(401).json({ message: "Token manquant" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware: token invalide', error.message);
        res.status(403).json({ message: "Token invalide" });
    }
};