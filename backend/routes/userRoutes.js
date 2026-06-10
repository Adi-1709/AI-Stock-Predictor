import express from 'express';
import { getUserProfile, updateUserProfileController, getUserActivities } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfileController);

router.get('/activity-logs', protect, getUserActivities);

export default router;
