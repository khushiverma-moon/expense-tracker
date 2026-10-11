const jwt = require('jsonwebtoken');

const JWT_SECRET = 'my_super_secret_expense_key_123';

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if(!authHeader){
        return res.status(401).json({message: 'Accesss denied. No token provided.'})
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({message: 'Token missing from header.'})
    }

    try{
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();

    } catch(error){
        return res.status(401).json({message: 'Invalid or expired tokwn.'})
    }
};

module.exports = authMiddleware;
