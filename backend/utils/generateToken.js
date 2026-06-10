import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a given user identifier.
 * @param {string} id - User identifier (typically email or database ID)
 * @returns {string} - JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretcyberkey101', {
    expiresIn: '30d',
  });
};

export default generateToken;
