import { db } from '../config/firebase.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      res.json({
        id: userDoc.id,
        name: userData.name,
        email: userData.email,
        plan: userData.plan,
        avatar: userData.avatar,
        bio: userData.bio,
        company: userData.company,
        phone: userData.phone,
        location: userData.location,
        createdAt: userData.createdAt,
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
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfileController = async (req, res, next) => {
  try {
    const userRef = db.collection('users').doc(req.user.id);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const updates = {};

      if (req.body.name) updates.name = req.body.name;
      if (req.body.bio !== undefined) updates.bio = req.body.bio;
      if (req.body.company !== undefined) updates.company = req.body.company;
      if (req.body.phone !== undefined) updates.phone = req.body.phone;
      if (req.body.location !== undefined) updates.location = req.body.location;
      if (req.body.avatar) updates.avatar = req.body.avatar;
      if (req.body.plan) updates.plan = req.body.plan;

      await userRef.update(updates);

      const updatedUserDoc = await userRef.get();
      const updatedUserData = updatedUserDoc.data();

      // Log the profile update
      const logDetails = {
        userId: req.user.id,
        action: 'PROFILE_UPDATE',
        details: 'User updated their profile information',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        createdAt: new Date().toISOString()
      };
      await db.collection('activityLogs').add(logDetails);

      res.json({
        id: updatedUserDoc.id,
        name: updatedUserData.name,
        email: updatedUserData.email,
        plan: updatedUserData.plan,
        avatar: updatedUserData.avatar,
        bio: updatedUserData.bio,
        company: updatedUserData.company,
        phone: updatedUserData.phone,
        location: updatedUserData.location,
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
 * @desc    Get user activity logs
 * @route   GET /api/users/activity-logs
 * @access  Private
 */
export const getUserActivities = async (req, res, next) => {
  try {
    const logsSnapshot = await db.collection('activityLogs')
      .where('userId', '==', req.user.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const logs = [];
    logsSnapshot.forEach((doc) => {
      logs.push({ _id: doc.id, ...doc.data() });
    });

    res.json(logs);
  } catch (error) {
    res.status(500);
    next(error);
  }
}




