import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { isDBConnected } from '../config/db.js';
import { sandboxUsers, sandboxActivityLogs } from '../config/sandboxData.js';

/**
 * @desc    Get user profile details
 * @route   GET /api/user/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    let user;
    if (isDBConnected) {
      user = await User.findById(req.user.id);
    } else {
      user = sandboxUsers.find(u => u._id === String(req.user._id || req.user.id));
    }

    if (user) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatar: user.avatar,
        bio: user.bio,
        company: user.company,
        phone: user.phone,
        location: user.location,
        createdAt: user.createdAt
      });
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Update user profile configurations
 * @route   PUT /api/user/profile
 * @access  Private
 */
export const updateUserProfileController = async (req, res, next) => {
  try {
    let user;
    if (isDBConnected) {
      user = await User.findById(req.user.id);
    } else {
      user = sandboxUsers.find(u => u._id === String(req.user._id || req.user.id));
    }

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    // Assign fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.company !== undefined) user.company = req.body.company;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.avatar) user.avatar = req.body.avatar;
    if (req.body.plan) user.plan = req.body.plan;

    let updatedUser;
    if (isDBConnected) {
      updatedUser = await user.save();
    } else {
      updatedUser = user;
    }

    // Log the profile update
    const logDetails = {
      user: user._id,
      action: 'UPDATE_PROFILE',
      details: `User updated profile settings: Name: ${user.name}`,
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
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      plan: updatedUser.plan,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      company: updatedUser.company,
      phone: updatedUser.phone,
      location: updatedUser.location
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

/**
 * @desc    Get user activity logs
 * @route   GET /api/user/activity-logs
 * @access  Private
 */
export const getUserActivities = async (req, res, next) => {
  try {
    let logs;
    const userIdStr = String(req.user._id || req.user.id);
    if (isDBConnected) {
      logs = await ActivityLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    } else {
      logs = sandboxActivityLogs
        .filter(log => String(log.user) === userIdStr)
        .slice(0, 10);
    }
    res.json(logs);
  } catch (error) {
    res.status(500);
    next(error);
  }
};



