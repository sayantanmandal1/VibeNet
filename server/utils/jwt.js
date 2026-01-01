const jwt = require('jsonwebtoken');
const { client } = require('../config/redis');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const blacklistToken = async (token) => {
  try {
    const decoded = jwt.decode(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    if (expiresIn > 0) {
      await client.setEx(`blacklist:${token}`, expiresIn, 'true');
    }
  } catch (error) {
    console.error('Error blacklisting token:', error);
  }
};

module.exports = { generateToken, blacklistToken };