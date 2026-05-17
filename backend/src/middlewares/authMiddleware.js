const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: 'Token requerido' });
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const token = parts[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = authMiddleware;
