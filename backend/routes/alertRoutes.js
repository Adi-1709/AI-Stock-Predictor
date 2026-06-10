import express from 'express';
import {
  getAlerts,
  createAlert,
  deleteAlert,
  getNotifications,
  markNotificationRead,
  clearNotifications
} from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAlerts)
  .post(protect, createAlert);

router.route('/:id')
  .delete(protect, deleteAlert);

router.route('/notifications')
  .get(protect, getNotifications)
  .post(protect, async (req, res, next) => {
    try {
      const userId = req.user._id || req.user.id || '1';
      const { title, message, type } = req.body;
      const { insertTriggeredNotification } = await import('../controllers/alertController.js');
      await insertTriggeredNotification(userId, title, message, type);
      res.json({ success: true });
    } catch (err) {
      res.status(500);
      next(err);
    }
  })
  .delete(protect, clearNotifications);

router.route('/notifications/:id')
  .put(protect, markNotificationRead);

export default router;
