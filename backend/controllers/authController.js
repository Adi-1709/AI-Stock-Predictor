import generateToken from '../utils/generateToken.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { isDBConnected } from '../config/db.js';
import { sandboxUsers, sandboxActivityLogs } from '../config/sandboxData.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('Please provide email and password'));
  }

  try {
    let user;
    if (isDBConnected) {
      user = await User.findOne({ email });
    } else {
      user = sandboxUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    const isMatch = user && (isDBConnected ? await user.matchPassword(password) : await bcrypt.compare(password, user.password));

    if (user && isMatch) {
      // Record login event
      const logDetails = {
        user: user._id,
        action: 'LOGIN',
        details: `User authenticated successfully (Database: ${isDBConnected ? 'MongoDB' : 'Sandbox'})`,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        createdAt: new Date()
      };

      if (isDBConnected) {
        await ActivityLog.create(logDetails);
      } else {
        sandboxActivityLogs.unshift(logDetails);
      }

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    } else {
      // Record failed login event
      if (user) {
        const logDetails = {
          user: user._id,
          action: 'LOGIN_FAILED',
          details: 'Failed authentication: invalid credentials',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
          createdAt: new Date()
        };
        if (isDBConnected) {
          await ActivityLog.create(logDetails);
        } else {
          sandboxActivityLogs.unshift(logDetails);
        }
      }
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    return next(new Error('Please provide name, email, and password'));
  }

  try {
    let userExists;
    if (isDBConnected) {
      userExists = await User.findOne({ email });
    } else {
      userExists = sandboxUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (userExists) {
      res.status(400);
      return next(new Error('User already exists'));
    }

    let user;
    if (isDBConnected) {
      user = await User.create({ name, email, password });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        _id: String(sandboxUsers.length + 1),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        plan: 'Free Trial',
        avatar: name.substring(0, 2).toUpperCase(),
        bio: 'Premium Stock Platform member (Sandbox).',
        company: 'Independent Trader',
        phone: '',
        location: 'Global',
        createdAt: new Date()
      };
      sandboxUsers.push(user);
    }

    if (user) {
      // Record registration event
      const logDetails = {
        user: user._id,
        action: 'REGISTER',
        details: 'User created account successfully',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        createdAt: new Date()
      };

      if (isDBConnected) {
        await ActivityLog.create(logDetails);
      } else {
        sandboxActivityLogs.unshift(logDetails);
      }

      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data received'));
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};


