import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

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
        
        let userDocs = await db.collection('users').where('email', '==', email).limit(1).get();
        
        if (userDocs.empty) {
          // Auto-create in Firestore to prevent session breakage on backend restarts
          const namePart = email.split('@')[0];
          const newUser = {
            name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
            email: email,
            plan: 'Sandbox Trial',
            avatar: namePart.substring(0, 2).toUpperCase(),
            bio: 'Premium Stock Platform member (Sandbox).',
            company: 'Independent Trader',
            phone: '',
            location: 'Global',
            createdAt: new Date().toISOString()
          };
          
          const docRef = await db.collection('users').add(newUser);
          req.user = { _id: docRef.id, id: docRef.id, ...newUser };
          return next();
        }
        
        const userDoc = userDocs.docs[0];
        req.user = { _id: userDoc.id, id: userDoc.id, ...userDoc.data() };
        return next();
      }

      // Verify real signed JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretcyberkey101');

      // Check user existence by decoded payload ID
      const userDoc = await db.collection('users').doc(decoded.id).get();
      let user = userDoc.exists ? { _id: userDoc.id, id: userDoc.id, ...userDoc.data() } : null;
      
      if (!user) {
        // Fallback to check by email if the token ID was an email
        const userDocs = await db.collection('users').where('email', '==', decoded.id).limit(1).get();
        if (!userDocs.empty) {
          const doc = userDocs.docs[0];
          user = { _id: doc.id, id: doc.id, ...doc.data() };
        }
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
