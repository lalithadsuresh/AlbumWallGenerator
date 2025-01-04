const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET; 

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //authentication required
    return res.status(401).json({ message: 'Unauthorized: Token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; 
    next();
  } catch (error) {
    // client lacks permission
    return res.status(403).json({ message: 'Forbidden: Token invalid or expired' });
  }
};

module.exports = authenticateToken;

