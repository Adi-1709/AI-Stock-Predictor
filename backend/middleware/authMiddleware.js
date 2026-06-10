import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDBConnected } from '../config/db.js';
import { sandboxUsers } from '../config/sandboxData.js';

/**
 * Route protection middleware that checks JWT authorization header.
 * Supports both real JWTs and frontend fallback mock structures.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Handle frontend mock tokens: "mock-jwt-token-for-email"
      if (token.startsWith('mock-jwt-token-for-')) {
        const email = token.replace('mock-jwt-token-for-', '').toLowerCase();
        
        let user;
        if (isDBConnected) {
          user = await User.findOne({ email });
        } else {
          user = sandboxUsers.find(u => u.email.toLowerCase() === email);
        }
        
        if (!user) {
          if (!isDBConnected) {
            // Auto-create in sandbox memory to prevent session breakage on backend restarts
            const namePart = email.split('@')[0];
            user = {
              _id: String(sandboxUsers.length + 1),
              name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
              email: email,
              plan: 'Sandbox Trial',
              avatar: namePart.substring(0, 2).toUpperCase(),
              bio: 'Premium Stock Platform member (Sandbox).',
              company: 'Independent Trader',
              phone: '',
              location: 'Global',
              createdAt: new Date()
            };
            sandboxUsers.push(user);
          } else {
            res.status(401);
            return next(new Error('Not authorized, user in mock token not found'));
          }
        }
        
        req.user = user;
        return next();
      }

      // Verify real signed JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretcyberkey101');

      // Check user existence by decoded payload ID
      let user;
      if (isDBConnected) {
        user = await User.findById(decoded.id) || await User.findOne({ email: decoded.id });
      } else {
        user = sandboxUsers.find(u => u._id === decoded.id || u.email === decoded.id);
      }

      if (!user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }


      // Attach user details to request
      req.user = user;
      next();
    } catch (error) {
      console.error(`🔒 [Auth Middleware] Validation failed: ${error.message}`);
      res.status(401);
      next(new Error('Not authorized, token validation failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
  }
};
