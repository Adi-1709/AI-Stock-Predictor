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

// Alerts
router.route('/')
  .get(protect, getAlerts)
  .post(protect, createAlert);

// Delete alert
router.route('/:id')
  .delete(protect, deleteAlert);

// Notifications
router.route('/notifications')
  .get(getNotifications) // removed protect
  .post(async (req, res, next) => {
    try {
      const userId = '1';

      const { title, message, type } = req.body;

      const {
        insertTriggeredNotification
      } = await import(
        '../controllers/alertController.js'
      );

      await insertTriggeredNotification(
        userId,
        title,
        message,
        type
      );

      res.json({
        success: true
      });

    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  })
  .delete(clearNotifications); // removed protect

// Mark notification as read
router.route('/notifications/:id')
  .put(markNotificationRead); // removed protect

export default router;